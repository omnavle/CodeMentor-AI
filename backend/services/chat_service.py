import os
from typing import TypedDict, List

from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

from services.rag_service import search_relevant_chunks

# Free, fast Groq model. Good balance of speed and quality for code Q&A.
GROQ_MODEL_NAME = "llama-3.1-8b-instant"

# Maximum number of past messages (user + AI combined) to keep in history.
# Keeps the prompt from growing too large over a long conversation.
MAX_HISTORY_MESSAGES = 10

# We keep a single shared LLM object so we don't recreate it on every request.
_llm = None

# Simple in-memory conversation history (list of {"role": "user"/"ai", "text": "..."})
# Since this app has no login system, we keep ONE conversation at a time --
# matching how we already keep ONE active project at a time.
conversation_history: List[dict] = []


def get_llm():
    """
    Returns a shared ChatGroq instance.
    Reads the API key from the GROQ_API_KEY environment variable.
    """
    global _llm
    if _llm is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is missing. Please add it to your .env file."
            )
        _llm = ChatGroq(
            model=GROQ_MODEL_NAME,
            api_key=api_key,
            temperature=0.2,
        )
    return _llm


# ---------------------------------------------------------------------------
# LangGraph Setup
#
# Our workflow has exactly 2 steps ("nodes"):
#   1. retrieve_node  -> searches ChromaDB for relevant code chunks
#   2. generate_node  -> builds a prompt (code + history + question) and
#                        calls Groq to generate the final answer
#
# The "state" is just a dictionary that gets passed from node to node,
# each node reads from it and adds new data to it.
# ---------------------------------------------------------------------------

class ChatState(TypedDict):
    question: str          # the user's current question
    history: List[dict]    # past conversation messages
    context: str           # retrieved code context (filled in by retrieve_node)
    sources: List[str]     # which files the context came from
    answer: str            # final AI answer (filled in by generate_node)


def retrieve_node(state: ChatState) -> ChatState:
    """
    Step 1: Search ChromaDB for code chunks relevant to the question.
    """
    chunks = search_relevant_chunks(state["question"], k=4)

    if len(chunks) == 0:
        state["context"] = ""
        state["sources"] = []
        return state

    context_parts = []
    sources = []
    for chunk in chunks:
        source = chunk.metadata.get("source", "unknown file")
        context_parts.append(f"--- File: {source} ---\n{chunk.page_content}")
        sources.append(source)

    state["context"] = "\n\n".join(context_parts)
    state["sources"] = list(dict.fromkeys(sources))  # unique, keeps order
    return state


def generate_node(state: ChatState) -> ChatState:
    """
    Step 2: Build a prompt using the retrieved code + past conversation,
    then call Groq to generate the final answer.
    """
    if not state["context"]:
        state["answer"] = "I couldn't find any relevant code for this question."
        return state

    # Format past conversation into simple readable text
    history_text = ""
    for msg in state["history"]:
        role_label = "User" if msg["role"] == "user" else "AI Mentor"
        history_text += f"{role_label}: {msg['text']}\n"

    prompt = f"""You are an AI Code Mentor. You help developers understand a codebase
by answering questions using ONLY the code context provided below.

Rules:
- Base your answer strictly on the given code context.
- If the answer isn't in the context, say you don't have enough information.
- When relevant, mention which file(s) your answer is based on.
- Use the conversation history to understand follow-up questions
  (e.g. "explain that in more detail" or "what about the other function?").
- Explain things clearly and simply, like a helpful senior developer mentoring a junior.

Conversation so far:
{history_text if history_text else "(no previous messages)"}

Code Context:
{state['context']}

Current Question: {state['question']}

Answer:"""

    llm = get_llm()
    response = llm.invoke(prompt)
    state["answer"] = response.content
    return state


def build_chat_graph():
    """
    Builds and compiles the LangGraph workflow:
    retrieve_node -> generate_node -> END
    """
    graph = StateGraph(ChatState)

    graph.add_node("retrieve", retrieve_node)
    graph.add_node("generate", generate_node)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


# Compile the graph once when the module loads, reuse it for every request
chat_graph = build_chat_graph()


# ---------------------------------------------------------------------------
# Public functions used by main.py
# ---------------------------------------------------------------------------

def ask_question(question: str):
    """
    Runs the LangGraph workflow for a single question, using the
    current conversation history, then updates the history with
    the new question + answer.
    """
    initial_state: ChatState = {
        "question": question,
        "history": conversation_history,
        "context": "",
        "sources": [],
        "answer": "",
    }

    result = chat_graph.invoke(initial_state)

    # Update the shared conversation history
    conversation_history.append({"role": "user", "text": question})
    conversation_history.append({"role": "ai", "text": result["answer"]})

    # Keep history from growing forever -- only keep the last N messages
    if len(conversation_history) > MAX_HISTORY_MESSAGES:
        del conversation_history[: len(conversation_history) - MAX_HISTORY_MESSAGES]

    return {
        "answer": result["answer"],
        "sources": result["sources"],
    }


def clear_conversation_history():
    """
    Clears the in-memory conversation history.
    Called when the user clicks "Clear Chat" or loads a new project.
    """
    conversation_history.clear()


def get_conversation_history():
    """
    Returns the current conversation history.
    """
    return conversation_history