import os

from langchain_groq import ChatGroq
from services.rag_service import search_relevant_chunks

# AI Model Name
MODEL_NAME = "llama-3.1-8b-instant"

# Save previous chat messages
chat_history = []

# Store AI model
llm = None


# Create AI model only once
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


# Ask question to AI
def ask_question(question):

    # Search related code from vector database
    chunks = search_relevant_chunks(question, k=4)

    # No code found
    if len(chunks) == 0:

        return {
            "answer": "I couldn't find any related code.",
            "sources": [],
        }

    context = ""
    sources = []

    # Create context for AI
    for chunk in chunks:

        file_name = chunk.metadata.get("source", "Unknown File")

        context += f"\nFile: {file_name}\n"
        context += chunk.page_content + "\n"

        if file_name not in sources:
            sources.append(file_name)

    # Convert previous chat into text
    history = ""

    for message in chat_history:

        if message["role"] == "user":
            history += f"User: {message['text']}\n"
        else:
            history += f"AI: {message['text']}\n"

    # Prompt for AI
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

    # Get AI response
    response = get_llm().invoke(prompt)

    answer = response.content

    # Save user question
    chat_history.append({
        "role": "user",
        "text": question,
    })

    # Save AI answer
    chat_history.append({
        "role": "ai",
        "text": answer,
    })

    # Keep only last 10 messages
    if len(chat_history) > 10:
        del chat_history[:-10]

    return {
        "answer": answer,
        "sources": sources,
    }


# Clear all chat history
def clear_conversation_history():
    chat_history.clear()


# Return chat history
def get_conversation_history():
    return chat_history