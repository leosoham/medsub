import chromadb
from sentence_transformers import SentenceTransformer


# -------------------------------------
# Configuration
# -------------------------------------

MODEL_NAME = "all-MiniLM-L6-v2"
CHROMA_PATH = "ml/chroma_db"
COLLECTION_NAME = "medicines_v31_test"

TOP_K = 5


# -------------------------------------
# Load model and collection
# -------------------------------------

print("Loading embedding model...")
model = SentenceTransformer(MODEL_NAME)

print("Connecting to ChromaDB...")
chroma_client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = chroma_client.get_collection(
    name=COLLECTION_NAME
)

print("Total records in ChromaDB:", collection.count())


# -------------------------------------
# Validation queries
# -------------------------------------

queries = [
    "medicine for cough with mucus",
    "medicine for allergic sneezing and runny nose",
    "medicine for bacterial infection",
    "medicine for acidity and heartburn",
    "medicine for fever and body pain",
    "medicine for nausea and vomiting",
    "medicine for diarrhea",
    "medicine for headache",
    "medicine for stomach pain",
    "medicine for constipation",
    "medicine for joint pain",
    "medicine for skin infection",
    "medicine for fungal infection",
    "medicine for high blood pressure",
    "medicine for diabetes",
]


# -------------------------------------
# Run semantic search
# -------------------------------------

for query in queries:

    print()
    print("=" * 80)
    print("QUERY:", query)
    print("=" * 80)

    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=TOP_K
    )

    for i in range(len(results["ids"][0])):

        print()
        print(f"Rank {i + 1}")
        print("Medicine:", results["metadatas"][0][i]["medicine_name"])
        print("Medicine ID:", results["metadatas"][0][i]["medicine_id"])
        print("Distance:", results["distances"][0][i])
        print("Document:", results["documents"][0][i])