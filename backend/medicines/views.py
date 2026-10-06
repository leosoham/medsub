import re

from rapidfuzz import process

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Medicine
from .jan_models import JanAushadhiPrices
from .rag_service import build_rag_context
from .llm_service import generate_medicine_explanation

from ml.semantic_search_service import semantic_search
# =====================================================
# Helper Functions
# =====================================================

def normalize_composition(text):
    """
    Normalize composition string for matching.

    Example:
    Paracetamol500mg -> paracetamol 500 mg
    """

    if not text:
        return ""

    text = text.lower().strip()

    # Add space between number and unit
    text = re.sub(r'(\d)(mg|ml|mcg|g|iu)', r'\1 \2', text)

    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)

    return text


def normalize_name(text):
    """
    Normalize medicine name for fuzzy search.
    """

    if not text:
        return ""

    text = text.lower().strip()

    # Remove everything except letters and numbers
    text = re.sub(r'[^a-z0-9]', '', text)

    remove_words = [
        "tablet",
        "tablets",
        "capsule",
        "capsules",
        "syrup",
        "injection",
        "cream",
        "ointment",
        "gel",
        "drops",
        "suspension"
    ]

    for word in remove_words:
        text = text.replace(word, "")

    return text.strip()


# =====================================================
# Reusable Substitution Logic
# =====================================================

def get_substitution_data(name, request=None):

    # -------------------------------------
    # STEP 1 : Clean User Input
    # -------------------------------------

    name = " ".join(name.split())
    normalized_input = normalize_name(name)

    medicine = None

    # -------------------------------------
    # STEP 2 : Exact Search
    # -------------------------------------

    medicine = Medicine.objects.filter(
        medicine_name__iexact=name
    ).first()

    # -------------------------------------
    # STEP 3 : Normalized Search
    # -------------------------------------

    if medicine is None:
        medicine = Medicine.objects.filter(
            name_normalized__iexact=normalized_input
        ).first()

    # -------------------------------------
    # STEP 4 : Startswith Search
    # -------------------------------------

    if medicine is None:
        medicine = Medicine.objects.filter(
            medicine_name__istartswith=name
        ).first()

    # -------------------------------------
    # STEP 5 : Contains Search
    # -------------------------------------

    if medicine is None:
        medicine = Medicine.objects.filter(
            medicine_name__icontains=name
        ).first()

    # -------------------------------------
    # STEP 6 : Fuzzy Search
    # -------------------------------------

    if medicine is None:

        medicines = Medicine.objects.only(
            "id",
            "medicine_name",
            "name_normalized"
        )

        best_match = None
        best_score = 0

        for item in medicines:

            result = process.extractOne(
                normalized_input,
                [normalize_name(item.name_normalized)]
            )

            if result:

                score = result[1]

                if score > best_score:
                    best_score = score
                    best_match = item

        if best_score >= 90:
            medicine = best_match

    # -------------------------------------
    # STEP 7 : Suggestions
    # -------------------------------------

    if medicine is None:

        first_word = name.split()[0]

        suggestions = Medicine.objects.filter(
            medicine_name__icontains=first_word
        ).values_list(
            "medicine_name",
            flat=True
        ).distinct()[:5]

        return None, {
            "message": "Medicine not found.",
            "suggestions": list(suggestions)
        }

    # -------------------------------------
    # STEP 8 : Find Substitute Medicines
    # -------------------------------------

    substitutes = Medicine.objects.filter(
        composition_normalized=medicine.composition_normalized
    ).exclude(
        id=medicine.id
    ).exclude(
        price__isnull=True
    ).exclude(
        price=0
    )

    # -------------------------------------
    # Filters
    # -------------------------------------

    if request is not None:

        manufacturer = request.GET.get("manufacturer")
        dosage_form = request.GET.get("dosage_form")
        min_price = request.GET.get("min_price")
        max_price = request.GET.get("max_price")

        if manufacturer:
            substitutes = substitutes.filter(
                manufacturer__icontains=manufacturer
            )

        if dosage_form:
            substitutes = substitutes.filter(
                dosage_form__iexact=dosage_form
            )

        if min_price:
            try:
                substitutes = substitutes.filter(
                    price__gte=float(min_price)
                )
            except ValueError:
                pass

        if max_price:
            try:
                substitutes = substitutes.filter(
                    price__lte=float(max_price)
                )
            except ValueError:
                pass

        # -------------------------------------
        # Sorting
        # -------------------------------------

        sort = request.GET.get("sort", "price_low")

    else:
        sort = "price_low"

    if sort == "price_low":

        substitutes = substitutes.order_by("price")

    elif sort == "price_high":

        substitutes = substitutes.order_by("-price")

    elif sort == "name":

        substitutes = substitutes.order_by("medicine_name")

    else:

        substitutes = substitutes.order_by("price")

    substitutes = substitutes[:10]

    substitute_data = []

    # -------------------------------------
    # STEP 9 : Find Jan Aushadhi Medicine
    # -------------------------------------

    normalized_composition = normalize_composition(
        medicine.composition_normalized
    )

    jan_medicine = None

    for jan_item in JanAushadhiPrices.objects.all():

        jan_normalized = normalize_composition(
            jan_item.generic_normalized
        )

        if jan_normalized == normalized_composition:

            jan_medicine = jan_item
            break

    # -------------------------------------
    # STEP 9A : Jan Aushadhi Price Comparison
    # -------------------------------------

    jan_amount_saved = None
    jan_saving_percent = None

    if (
        jan_medicine
        and medicine.price is not None
        and jan_medicine.official_price is not None
        and float(medicine.price) > 0
    ):

        jan_amount_saved = (
            float(medicine.price)
            - float(jan_medicine.official_price)
        )

        jan_saving_percent = round(
            (jan_amount_saved / float(medicine.price)) * 100,
            2
        )

    # -------------------------------------
    # STEP 10 : Price Comparison
    # -------------------------------------

    for item in substitutes:

        amount_saved = None
        saving_percent = None

        if (
            medicine.price is not None
            and item.price is not None
            and medicine.price > 0
        ):

            amount_saved = medicine.price - item.price

            saving_percent = round(
                (amount_saved / medicine.price) * 100,
                2
            )

        substitute_data.append(
            {
                "medicine_name": item.medicine_name,
                "manufacturer": item.manufacturer,
                "dosage_form": item.dosage_form,

                "price": (
                    float(item.price)
                    if item.price is not None
                    else None
                ),

                "amount_saved": (
                    round(float(amount_saved), 2)
                    if amount_saved is not None
                    else None
                ),

                "saving_percent": (
                    f"{saving_percent}%"
                    if saving_percent is not None
                    else None
                ),

                "uses": item.uses,
                "side_effects": item.side_effects,
            }
        )

    # -------------------------------------
    # Final reusable result
    # -------------------------------------

    result = {
        "searched_medicine": {
            "medicine_name": medicine.medicine_name,
            "manufacturer": medicine.manufacturer,
            "dosage_form": medicine.dosage_form,

            "price": (
                float(medicine.price)
                if medicine.price is not None
                else None
            ),

            "composition": medicine.composition_normalized,
            "uses": medicine.uses,
            "side_effects": medicine.side_effects,
        },

        "jan_aushadhi": {
            "generic_name": (
                jan_medicine.generic_name
                if jan_medicine
                else None
            ),

            "official_price": (
                float(jan_medicine.official_price)
                if (
                    jan_medicine
                    and jan_medicine.official_price is not None
                )
                else None
            ),

            "amount_saved": (
                round(jan_amount_saved, 2)
                if jan_amount_saved is not None
                else None
            ),

            "saving_percent": (
                f"{jan_saving_percent}%"
                if jan_saving_percent is not None
                else None
            ),
        },

        "total_substitutes": len(substitute_data),

        "substitutes": substitute_data,
    }

    return result, None


# =====================================================
# Medicine Substitute API
# =====================================================

@api_view(["GET"])
def substitutes(request, name):

    result, error = get_substitution_data(
        name,
        request
    )

    if error:

        return Response(
            error,
            status=404
        )

    return Response(result)


# =====================================================
# Search API
# =====================================================

@api_view(["GET"])
def search_medicine(request):

    query = request.GET.get("q", "").strip()

    if not query:
        return Response([])

    normalized_query = normalize_name(query)

    medicines = Medicine.objects.only(
        "medicine_name",
        "name_normalized"
    )

    results = []

    seen = set()

    # -------------------------------------
    # Exact / Contains Search
    # -------------------------------------

    exact_matches = Medicine.objects.filter(
        medicine_name__icontains=query
    ).order_by("medicine_name")[:10]

    for medicine in exact_matches:

        if medicine.medicine_name not in seen:

            results.append(
                {
                    "id": medicine.id,
                    "medicine_name": medicine.medicine_name,
                    "manufacturer": medicine.manufacturer,
                }
            )

            seen.add(medicine.medicine_name)

    # -------------------------------------
    # Fuzzy Search
    # -------------------------------------

    if len(results) < 10:

        choices = {}

        for item in medicines:

            choices[
                normalize_name(item.name_normalized)
            ] = item

        matches = process.extract(
            normalized_query,
            list(choices.keys()),
            limit=10
        )

        for match in matches:

            score = match[1]

            if score >= 80:

                medicine = choices[match[0]]

                if medicine.medicine_name not in seen:

                    results.append(
                        {
                            "id": medicine.id,
                            "medicine_name": medicine.medicine_name,
                            "manufacturer": medicine.manufacturer,

                        }
                    )

                    seen.add(medicine.medicine_name)

    return Response(results[:10])


# =====================================================
# Health API
# =====================================================

@api_view(["GET"])
def health(request):

    return Response(
        {
            "status": "ok",
            "message": "Medicine Substitute API is running."
        }
    )


# =====================================================
# RAG Explanation API
# =====================================================

@api_view(["GET"])
def explain_medicine(request, name):

    # -------------------------------------
    # STEP 1 : Get substitution information
    # -------------------------------------

    substitution_data, error = get_substitution_data(
        name,
        request
    )

    if error:

        return Response(
            error,
            status=404
        )

    # -------------------------------------
    # STEP 2 : Build RAG context
    # -------------------------------------

    rag_context = build_rag_context(
        substitution_data
    )

    # -------------------------------------
    # STEP 3 : Generate LLM explanation
    # -------------------------------------

    explanation = generate_medicine_explanation(
        rag_context
    )

    # -------------------------------------
    # STEP 4 : Final response
    # -------------------------------------

    return Response(
        {
            "medicine_name": name,

            "explanation": explanation,

            "substitution_data": {
                "searched_medicine": substitution_data.get(
                    "searched_medicine"
                ),

                "jan_aushadhi": substitution_data.get(
                    "jan_aushadhi"
                ),

                "total_substitutes": substitution_data.get(
                    "total_substitutes"
                )
            }
        }
    )

# =====================================================
# Symptom Search API
# =====================================================

@api_view(["GET"])
def symptom_search(request):
    query = request.GET.get("q", "").strip()

    if not query:
        return Response(
            {"message": "Please provide a symptom query."},
            status=400,
        )

    # Step 1: Perform semantic search using ChromaDB
    search_results = semantic_search(query, top_k=10)

    if not search_results:
        return Response([])

    # Step 2: Collect medicine IDs returned by ChromaDB
    medicine_ids = [
        result["medicine_id"]
        for result in search_results
    ]

    # Step 3: Retrieve matching medicines from PostgreSQL
    medicines = Medicine.objects.filter(id__in=medicine_ids)

    medicine_lookup = {
        medicine.id: medicine
        for medicine in medicines
    }

    # Step 4: Preserve ChromaDB similarity ranking
    results = []

    for result in search_results:
        medicine = medicine_lookup.get(result["medicine_id"])

        if medicine is None:
            continue

        results.append(
            {
                "id": medicine.id,
                "medicine_name": medicine.medicine_name,
                "manufacturer": medicine.manufacturer,
                "dosage_form": medicine.dosage_form,
                "price": (
                    float(medicine.price)
                    if medicine.price is not None
                    else None
                ),
                "uses": medicine.uses,
                "side_effects": medicine.side_effects,
                "distance": result["distance"],
            }
        )

    return Response(results)
