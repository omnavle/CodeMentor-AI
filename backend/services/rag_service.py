import os
import shutil

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
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

    Returns a summary: how many files were processed and how many
    chunks were created.
    """
    # Step 1: Read all source files with their full content
    files = read_project_files_with_content()

    if len(files) == 0:
        raise ValueError(
            "No files found to index. Upload a ZIP or import a GitHub repo first."
        )

    # Step 2: Convert each file into a LangChain Document object.
    # metadata["source"] keeps track of which file the text came from,
    # so later we can tell the user "this answer came from utils.py".
    documents = []
    for file in files:
        doc = Document(
            page_content=file["content"],
            metadata={"source": file["path"]},
        )
        documents.append(doc)

    # Step 3: Split each document into smaller chunks.
    # chunk_size = max number of characters per chunk.
    # chunk_overlap = characters shared between consecutive chunks,
    # so we don't lose context right at the boundary of a chunk.
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = splitter.split_documents(documents)

    # Step 4: Clear any old embeddings from a previous project
    clear_vector_store()

    # Step 5: Generate embeddings for every chunk and store them in ChromaDB
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
    This will be used in Milestone 5 to search for relevant
    chunks when the user asks a question.
    """
    embeddings = get_embeddings()
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR,
    )