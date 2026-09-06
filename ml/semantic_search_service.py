import chromadb
from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"
CHROMA_PATH = "ml/chroma_db"
COLLECTION_NAME = "medicines_v31_test"


print("Loading semantic search model...")

model = SentenceTransformer(MODEL_NAME)

chroma_client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = chroma_client.get_collection(
    name=COLLECTION_NAME
)


def semantic_search(query: str, top_k: int = 5):

    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    search_results = []

    for i in range(len(results["ids"][0])):

        search_results.append({
            "medicine_id": results["metadatas"][0][i]["medicine_id"],
            "medicine_name": results["metadatas"][0][i]["medicine_name"],
            "distance": results["distances"][0][i],
            "document": results["documents"][0][i]
        })

    return search_results