import os
import shutil

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from services.file_service import read_project_files_with_content

CHROMA_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "chroma_db")
)

COLLECTION_NAME = "code_mentor_collection"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_embeddings = None


def get_embeddings():
    global _embeddings

    if _embeddings:
        return _embeddings

    _embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME
    )

    return _embeddings


def clear_vector_store():
    if os.path.exists(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)

    os.makedirs(CHROMA_DIR, exist_ok=True)


def build_vector_store():
    files = read_project_files_with_content()

    if not files:
        raise ValueError(
            "No files found to index. Upload a ZIP or import a GitHub repo first."
        )

    documents = []

    for file in files:
        documents.append(
            Document(
                page_content=file["content"],
                metadata={"source": file["path"]},
            )
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )

    chunks = splitter.split_documents(documents)

    clear_vector_store()

    Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DIR,
    )

    return {
        "total_files": len(files),
        "total_chunks": len(chunks),
    }


def get_vector_store():
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=CHROMA_DIR,
    )


def is_project_indexed():
    if not os.path.exists(CHROMA_DIR):
        return False

    return os.path.exists(
        os.path.join(CHROMA_DIR, "chroma.sqlite3")
    )


def search_relevant_chunks(query, k=4):
    return get_vector_store().similarity_search(query, k=k)