import os
from typing import TypedDict, List

from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

from services.rag_service import search_relevant_chunks

MODEL_NAME = "llama-3.1-8b-instant"
MAX_HISTORY = 10

llm = None
chat_history = []


def get_llm():
    global llm

    if llm is None:
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("GROQ_API_KEY not found.")

        llm = ChatGroq(
            model=MODEL_NAME,
            api_key=api_key,
            temperature=0.2,
        )

    return llm


class ChatState(TypedDict):
    question: str
    history: List[dict]
    context: str
    sources: List[str]
    answer: str


def retrieve_node(state: ChatState):
    chunks = search_relevant_chunks(state["question"], k=4)

    if not chunks:
        state["context"] = ""
        state["sources"] = []
        return state

    context = []
    sources = []

    for chunk in chunks:
        file_name = chunk.metadata.get("source", "Unknown File")
        context.append(f"File: {file_name}\n{chunk.page_content}")
        sources.append(file_name)

    state["context"] = "\n\n".join(context)
    state["sources"] = list(dict.fromkeys(sources))

    return state


def generate_node(state: ChatState):
    if state["context"] == "":
        state["answer"] = "I couldn't find any related code."
        return state

    history_text = ""

    for message in state["history"]:
        if message["role"] == "user":
            history_text += f"User: {message['text']}\n"
        else:
            history_text += f"AI: {message['text']}\n"

    prompt = f"""
You are an AI Code Mentor.

Use only the code below to answer the question.

Conversation:
{history_text}

Code:
{state["context"]}

Question:
{state["question"]}

Answer:
"""

    response = get_llm().invoke(prompt)
    state["answer"] = response.content

    return state


def build_chat_graph():
    graph = StateGraph(ChatState)

    graph.add_node("retrieve", retrieve_node)
    graph.add_node("generate", generate_node)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


chat_graph = build_chat_graph()


def ask_question(question: str):
    state = {
        "question": question,
        "history": chat_history,
        "context": "",
        "sources": [],
        "answer": "",
    }

    result = chat_graph.invoke(state)

    chat_history.append(
        {
            "role": "user",
            "text": question,
        }
    )

    chat_history.append(
        {
            "role": "ai",
            "text": result["answer"],
        }
    )

    if len(chat_history) > MAX_HISTORY:
        chat_history[:] = chat_history[-MAX_HISTORY:]

    return {
        "answer": result["answer"],
        "sources": result["sources"],
    }


def clear_conversation_history():
    chat_history.clear()


def get_conversation_history():
    return chat_history