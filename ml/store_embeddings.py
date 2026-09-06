import chromadb

from sentence_transformers import SentenceTransformer
from load_data import load_batch


# -------------------------------------
# Configuration
# -------------------------------------

BATCH_SIZE = 1000
MODEL_NAME = "all-MiniLM-L6-v2"
CHROMA_PATH = "ml/chroma_db"
COLLECTION_NAME = "medicines_v31_test"


# -------------------------------------
# Load embedding model
# -------------------------------------

print("Loading embedding model...")
model = SentenceTransformer(MODEL_NAME)


# -------------------------------------
# Connect to ChromaDB
# -------------------------------------

print("Connecting to ChromaDB...")

chroma_client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME
)

print("Current ChromaDB records:", collection.count())


# -------------------------------------
# Determine starting point
# -------------------------------------

stored_count = collection.count()

if stored_count == 0:
    last_id = 0
else:
    existing = collection.get(
        include=[]
    )

    last_id = max(
        int(medicine_id)
        for medicine_id in existing["ids"]
    )

print("Starting from medicine ID:", last_id)


# -------------------------------------
# Process batches
# -------------------------------------

total_processed = 0

while True:

    print()
    print("=" * 60)
    print("Loading next batch...")
    print("Starting ID:", last_id)
    print("=" * 60)

    df = load_batch(
        last_id=last_id,
        batch_size=BATCH_SIZE
    )

    if df.empty:
        print()
        print("No more medicines to process.")
        break

    print("Batch size:", len(df))

    # ---------------------------------
    # Generate embeddings
    # ---------------------------------

    print("Generating embeddings...")

    embeddings = model.encode(
        df["document"].tolist(),
        batch_size=32,
        show_progress_bar=True
    )

    print("Embeddings generated successfully!")

    # ---------------------------------
    # Store embeddings
    # ---------------------------------

    print("Storing embeddings in ChromaDB...")

    collection.upsert(
        ids=[
            str(medicine_id)
            for medicine_id in df["id"]
        ],

        embeddings=embeddings.tolist(),

        documents=df["document"].tolist(),

        metadatas=[
            {
                "medicine_id": int(row["id"]),
                "medicine_name": row["medicine_name"]
            }
            for _, row in df.iterrows()
        ]
    )

    # ---------------------------------
    # Update progress
    # ---------------------------------

    last_id = int(df["id"].iloc[-1])

    total_processed += len(df)

    print()
    print("Batch stored successfully!")
    print("Batch records:", len(df))
    print("Last processed ID:", last_id)
    print("Total processed this run:", total_processed)
    print("Total records in ChromaDB:", collection.count())


# -------------------------------------
# Final verification
# -------------------------------------

print()
print("=" * 60)
print("FULL INGESTION COMPLETED")
print("=" * 60)

print("Total records in ChromaDB:", collection.count())