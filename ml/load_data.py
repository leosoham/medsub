import os

import pandas as pd
import psycopg2
from dotenv import load_dotenv


# -------------------------------------
# Configuration
# -------------------------------------

BATCH_SIZE = 1000


# -------------------------------------
# Load environment variables
# -------------------------------------

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")


# -------------------------------------
# Create medicine document
# -------------------------------------

def create_document(row):
    return (
        f"Medicine: {row['medicine_name']}. "
        f"Composition: {row['composition']}. "
        f"Uses: {row['uses']}. "
        f"Side effects: {row['side_effects']}."
    )


# -------------------------------------
# Fetch one batch of medicines
# -------------------------------------

def load_batch(last_id=0, batch_size=BATCH_SIZE):

    connection = psycopg2.connect(DATABASE_URL)

    query = """
        SELECT
            id,
            medicine_name,
            composition,
            uses,
            side_effects
        FROM medicines
        WHERE composition IS NOT NULL
          AND uses IS NOT NULL
          AND side_effects IS NOT NULL
          AND TRIM(composition) <> ''
          AND TRIM(uses) <> ''
          AND TRIM(side_effects) <> ''
        AND id > %s
        ORDER BY id
        LIMIT %s;
    """

    df = pd.read_sql_query(
        query,
        connection,
        params=(last_id, batch_size)
    )

    connection.close()

    if not df.empty:
        df["document"] = df.apply(
            create_document,
            axis=1
        )

    return df


# -------------------------------------
# Test the loader
# -------------------------------------

if __name__ == "__main__":

    print("Loading medicine batch...")

    df = load_batch()

    print()
    print("Batch loaded successfully!")
    print("Number of medicines:", len(df))

    if not df.empty:

        print()
        print("First medicine:")
        print(df.iloc[0])

        print()
        print("Sample document:")
        print(df["document"].iloc[0])