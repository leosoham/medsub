import sys
from pathlib import Path


# =====================================================
# ML Path Configuration
# =====================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ML_PATH = PROJECT_ROOT / "ml"

if str(ML_PATH) not in sys.path:
    sys.path.insert(0, str(ML_PATH))


# Import semantic search from ML layer
from semantic_search_service import semantic_search


# =====================================================
# Medicine Context Retrieval
# =====================================================

def retrieve_medicine_context(query, top_k=5):
    """
    Retrieve relevant medicine documents from ChromaDB.
    """

    results = semantic_search(
        query=query,
        top_k=top_k
    )

    return results


# =====================================================
# Build RAG Context
# =====================================================

def build_rag_context(substitution_data):
    """
    Build the context that will later be provided
    to the LLM for explanation.
    """

    searched_medicine = substitution_data.get(
        "searched_medicine",
        {}
    )

    jan_aushadhi = substitution_data.get(
        "jan_aushadhi",
        {}
    )

    # -------------------------------------
    # Brand medicine information
    # -------------------------------------

    medicine_name = searched_medicine.get(
        "medicine_name"
    )

    composition = searched_medicine.get(
        "composition"
    )

    uses = searched_medicine.get(
        "uses"
    )

    side_effects = searched_medicine.get(
        "side_effects"
    )

    brand_query = (
        f"{medicine_name}. "
        f"Composition: {composition}. "
        f"Uses: {uses}. "
        f"Side effects: {side_effects}."
    )

    brand_results = retrieve_medicine_context(
        brand_query,
        top_k=3
    )

    # -------------------------------------
    # Generic medicine information
    # -------------------------------------

    generic_name = jan_aushadhi.get(
        "generic_name"
    )

    generic_results = []

    if generic_name:

        generic_query = (
            f"{generic_name}. "
            f"Composition: {composition}."
        )

        generic_results = retrieve_medicine_context(
            generic_query,
            top_k=3
        )

    # -------------------------------------
    # Build final context
    # -------------------------------------

    context = {
        "searched_medicine": searched_medicine,
        "jan_aushadhi": jan_aushadhi,
        "brand_retrieval": brand_results,
        "generic_retrieval": generic_results,
    }

    return context