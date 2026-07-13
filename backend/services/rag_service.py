import os
import shutil

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from services.file_service import read_project_files_with_content

# Folder where ChromaDB will persist its data on disk
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
CHROMA_DIR = os.path.abspath(CHROMA_DIR)

# Name of the "collection" inside ChromaDB (like a table name)
COLLECTION_NAME = "code_mentor_collection"

# Free, local embedding model. Small and fast -- good for beginners.
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# We keep a single shared embeddings object so the model
# is only loaded into memory once, not on every request.
_embeddings = None


def get_embeddings():
    """
    Returns a shared Hugging Face embeddings instance.
    The model is loaded only once and reused after that.
    """
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    return _embeddings


def clear_vector_store():
    """
    Deletes any previously stored embeddings so we always
    index fresh data for the currently loaded project.
    """
    if os.path.exists(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
    os.makedirs(CHROMA_DIR, exist_ok=True)


def build_vector_store():
    """
    Reads all files from the current workspace, splits them into chunks,
    generates embeddings for each chunk, and stores them in ChromaDB.
    """
    files = read_project_files_with_content()

    if len(files) == 0:
        raise ValueError(
            "No files found to index. Upload a ZIP or import a GitHub repo first."
        )

    documents = []
    for file in files:
        doc = Document(
            page_content=file["content"],
            metadata={"source": file["path"]},
        )
        documents.append(doc)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = splitter.split_documents(documents)

    clear_vector_store()

    embeddings = get_embeddings()
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DIR,
    )

    return {
        "total_files": len(files),
        "total_chunks": len(chunks),
    }


def get_vector_store():
    """
    Loads the existing ChromaDB vector store from disk.
    """
    embeddings = get_embeddings()
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR,
    )


def is_project_indexed() -> bool:
    """
    Checks whether a ChromaDB index already exists on disk.
    Used by the chat endpoint to give a clear error if the
    user tries to chat before indexing a project.
    """
    if not os.path.exists(CHROMA_DIR):
        return False

    # A valid Chroma store will have created a sqlite file inside
    sqlite_path = os.path.join(CHROMA_DIR, "chroma.sqlite3")
    return os.path.exists(sqlite_path)


def search_relevant_chunks(query: str, k: int = 4):
    """
    Searches the vector store for the top-k chunks most relevant
    to the user's question. Returns LangChain Document objects,
    each with page_content and metadata (source file path).
    """
    vector_store = get_vector_store()
    results = vector_store.similarity_search(query, k=k)
    return results