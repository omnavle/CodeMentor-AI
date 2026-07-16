import os
from langchain_groq import ChatGroq
from services.rag_service import search_relevant_chunks

MODEL_NAME = "llama-3.1-8b-instant"

chat_history = []
llm = None


def get_llm():
    global llm

    if llm:
        return llm

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found.")

    llm = ChatGroq(
        model=MODEL_NAME,
        api_key=api_key,
        temperature=0.2,
    )
    return llm


def ask_question(question):
    chunks = search_relevant_chunks(question, k=4)

    if not chunks:
        return {
            "answer": "I couldn't find any related code.",
            "sources": [],
        }

    context = ""
    sources = []

    for chunk in chunks:
        file = chunk.metadata.get("source", "Unknown File")
        context += f"\nFile: {file}\n{chunk.page_content}\n"

        if file not in sources:
            sources.append(file)

    history = ""

    for msg in chat_history:
        role = "User" if msg["role"] == "user" else "AI"
        history += f"{role}: {msg['text']}\n"

    prompt = f"""
You are an AI Code Mentor.

Use only the given code to answer.

Previous Conversation:
{history}

Code:
{context}

Question:
{question}

Answer:
"""

    answer = get_llm().invoke(prompt).content

    chat_history.extend([
        {"role": "user", "text": question},
        {"role": "ai", "text": answer},
    ])

    chat_history[:] = chat_history[-10:]

    return {
        "answer": answer,
        "sources": sources,
    }


def clear_conversation_history():
    chat_history.clear()


def get_conversation_history():
    return chat_history