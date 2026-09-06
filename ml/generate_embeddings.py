from sentence_transformers import SentenceTransformer

from load_data import load_batch


# -------------------------------------
# Configuration
# -------------------------------------

BATCH_SIZE = 1000


# -------------------------------------
# Load embedding model
# -------------------------------------

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")


# -------------------------------------
# Load one medicine batch
# -------------------------------------

print("Loading medicine batch...")

df = load_batch(
    last_id=0,
    batch_size=BATCH_SIZE
)

print("Number of medicines:", len(df))


# -------------------------------------
# Generate embeddings
# -------------------------------------

if not df.empty:

    print("Generating embeddings...")

    embeddings = model.encode(
        df["document"].tolist(),
        batch_size=32,
        show_progress_bar=True
    )

    print("\nEmbedding generation completed!")
    print("Number of embeddings:", len(embeddings))
    print("Embedding dimensions:", embeddings.shape[1])

else:

    print("No medicines found.")