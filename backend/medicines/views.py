
import re

from rapidfuzz import process

from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import Medicine
from .jan_models import JanAushadhiPrices
from .rag_service import build_rag_context
from .llm_service import generate_medicine_explanation
from .prescription_service import (
    extract_pdf_text,
    extract_medicine_candidates,
)

from ml.semantic_search_service import semantic_search


# =====================================================
# Helper Functions
# =====================================================

def normalize_composition(text):
    """Normalize composition strings for matching."""

    if not text:
        return ""

    text = text.lower().strip()
    text = re.sub(r"(\d)(mg|ml|mcg|g|iu)", r"\1 \2", text)
    text = re.sub(r"\s+", " ", text)

    return text


def normalize_name(text):
    """Normalize medicine names for fuzzy search."""

    if not text:
        return ""

    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]", "", text)

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
        "suspension",
    ]

    for word in remove_words:
        text = text.replace(word, "")

    return text.strip()


# =====================================================
# Reusable Substitution Logic
# =====================================================

def get_substitution_data(name="", request=None, medicine_id=None):
    """
    Return substitution and Jan Aushadhi price-comparison data.

    If medicine_id is supplied, use that exact database record.
    Otherwise, preserve the existing name-based search behavior.
    """

    medicine = None

    # STEP 1: Resolve the exact confirmed medicine ID.
    if medicine_id is not None:
        medicine = Medicine.objects.filter(id=medicine_id).first()

        if medicine is None:
            return None, {
                "message": "Confirmed medicine was not found."
            }

    # STEP 2: Existing name-based medicine lookup.
    else:
        name = " ".join(name.split())
        normalized_input = normalize_name(name)

        if not name:
            return None, {
                "message": "Please provide a medicine name."
            }

        medicine = Medicine.objects.filter(
            medicine_name__iexact=name
        ).first()

        if medicine is None:
            medicine = Medicine.objects.filter(
                name_normalized__iexact=normalized_input
            ).first()

        if medicine is None:
            medicine = Medicine.objects.filter(
                medicine_name__istartswith=name
            ).first()

        if medicine is None:
            medicine = Medicine.objects.filter(
                medicine_name__icontains=name
            ).first()

        # Preserve the existing fuzzy-search fallback.
        if medicine is None:
            medicines = Medicine.objects.only(
                "id",
                "medicine_name",
                "name_normalized",
            )

            best_match = None
            best_score = 0

            for item in medicines:
                result = process.extractOne(
                    normalized_input,
                    [normalize_name(item.name_normalized)],
                )

                if result and result[1] > best_score:
                    best_score = result[1]
                    best_match = item

            if best_score >= 90:
                medicine = best_match

        if medicine is None:
            first_word = name.split()[0]

            suggestions = Medicine.objects.filter(
                medicine_name__icontains=first_word
            ).values_list(
                "medicine_name",
                flat=True,
            ).distinct()[:5]

            return None, {
                "message": "Medicine not found.",
                "suggestions": list(suggestions),
            }

    # STEP 3: Find substitutes using the existing composition rule.
    substitutes = Medicine.objects.filter(
        composition_normalized=medicine.composition_normalized
    ).exclude(
        id=medicine.id
    ).exclude(
        price__isnull=True
    ).exclude(
        price=0
    )

    # STEP 4: Apply optional filters.
    if request is not None:
        manufacturer = request.GET.get("manufacturer")
        dosage_form = request.GET.get("dosage_form")
        min_price = request.GET.get("min_price")
        max_price = request.GET.get("max_price")
        sort = request.GET.get("sort", "price_low")

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
            except (ValueError, TypeError):
                return None, {
                    "message": "min_price must be a valid number."
                }

        if max_price:
            try:
                substitutes = substitutes.filter(
                    price__lte=float(max_price)
                )
            except (ValueError, TypeError):
                return None, {
                    "message": "max_price must be a valid number."
                }

    else:
        sort = "price_low"

    # STEP 5: Sort and limit substitutes.
    if sort == "price_low":
        substitutes = substitutes.order_by("price")
    elif sort == "price_high":
        substitutes = substitutes.order_by("-price")
    elif sort == "name":
        substitutes = substitutes.order_by("medicine_name")
    else:
        substitutes = substitutes.order_by("price")

    substitutes = substitutes[:10]

    # STEP 6: Find a matching Jan Aushadhi entry.
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

    # STEP 7: Calculate Jan Aushadhi savings.
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
            2,
        )

    # STEP 8: Build substitute price comparisons.
    substitute_data = []

    for item in substitutes:
        amount_saved = None
        saving_percent = None

        if (
            medicine.price is not None
            and item.price is not None
            and medicine.price > 0
        ):
            amount_saved = float(medicine.price) - float(item.price)

            saving_percent = round(
                (amount_saved / float(medicine.price)) * 100,
                2,
            )

        substitute_data.append(
            {
                "id": item.id,
                "medicine_name": item.medicine_name,
                "manufacturer": item.manufacturer,
                "dosage_form": item.dosage_form,
                "price": (
                    float(item.price)
                    if item.price is not None
                    else None
                ),
                "amount_saved": (
                    round(amount_saved, 2)
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

    # STEP 9: Return the existing substitution response structure.
    result = {
        "searched_medicine": {
            "id": medicine.id,
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
    result, error = get_substitution_data(name, request)

    if error:
        return Response(error, status=404)

    return Response(result)


# =====================================================
# Medicine Search API
# =====================================================

@api_view(["GET"])
def search_medicine(request):
    query = request.GET.get("q", "").strip()

    if not query:
        return Response([])

    normalized_query = normalize_name(query)

    medicines = Medicine.objects.only(
        "id",
        "medicine_name",
        "manufacturer",
        "name_normalized",
    )

    results = []
    seen = set()

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

    if len(results) < 10:
        choices = {}

        for item in medicines:
            normalized = normalize_name(item.name_normalized)

            if normalized and normalized not in choices:
                choices[normalized] = item

        matches = process.extract(
            normalized_query,
            list(choices.keys()),
            limit=10,
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
            "message": "Medicine Substitute API is running.",
        }
    )


# =====================================================
# RAG Explanation API
# =====================================================

@api_view(["GET"])
def explain_medicine(request, name):
    substitution_data, error = get_substitution_data(name, request)

    if error:
        return Response(error, status=404)

    rag_context = build_rag_context(substitution_data)

    explanation = generate_medicine_explanation(rag_context)

    return Response(
        {
            "medicine_name": name,
            "explanation": explanation,
            "substitution_data": {
                "searched_medicine": substitution_data.get(
                    "searched_medicine"
                ),
                "jan_aushadhi": substitution_data.get("jan_aushadhi"),
                "total_substitutes": substitution_data.get(
                    "total_substitutes"
                ),
            },
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

    search_results = semantic_search(query, top_k=10)

    if not search_results:
        return Response([])

    medicine_ids = [
        result["medicine_id"]
        for result in search_results
    ]

    medicines = Medicine.objects.filter(id__in=medicine_ids)

    medicine_lookup = {
        medicine.id: medicine
        for medicine in medicines
    }

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


# =====================================================
# Prescription PDF Upload API
# =====================================================

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def prescription_upload(request):
    """
    Extract selectable text from a digital prescription PDF
    and return possible medicine candidates for user confirmation.
    """

    pdf_file = request.FILES.get("file")

    if pdf_file is None:
        return Response(
            {
                "error": (
                    "No PDF file provided. "
                    "Upload it using the 'file' field."
                )
            },
            status=400,
        )

    try:
        extracted_text = extract_pdf_text(pdf_file)

        if not extracted_text:
            return Response(
                {
                    "error": (
                        "No selectable text was found. "
                        "Please upload a digital prescription PDF "
                        "containing selectable text."
                    )
                },
                status=422,
            )

        medicines = extract_medicine_candidates(extracted_text)

        return Response(
            {
                "message": "Prescription PDF processed successfully.",
                "extracted_text": extracted_text,
                "medicines": medicines,
                "needs_confirmation": True,
            },
            status=200,
        )

    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)

    except Exception:
        return Response(
            {
                "error": (
                    "An unexpected error occurred while processing "
                    "the prescription."
                )
            },
            status=500,
        )


# =====================================================
# Prescription Confirmation API
# =====================================================

@api_view(["POST"])
def prescription_confirm(request):
    """
    Accept a user-confirmed medicine ID and return its substitution data.

    Expected JSON:
    {
        "medicine_id": 168906
    }
    """

    medicine_id = request.data.get("medicine_id")

    if medicine_id is None:
        return Response(
            {"error": "medicine_id is required."},
            status=400,
        )

    # Reject booleans, decimals, and non-integer identifiers.
    if isinstance(medicine_id, bool):
        return Response(
            {"error": "medicine_id must be a positive integer."},
            status=400,
        )

    try:
        medicine_id = int(medicine_id)
    except (TypeError, ValueError, OverflowError):
        return Response(
            {"error": "medicine_id must be a positive integer."},
            status=400,
        )

    if medicine_id <= 0:
        return Response(
            {"error": "medicine_id must be a positive integer."},
            status=400,
        )

    result, error = get_substitution_data(
        request=request,
        medicine_id=medicine_id,
    )

    if error:
        return Response(error, status=404)

    return Response(
        {
            "message": "Confirmed medicine substitution data retrieved.",
            "substitution_data": result,
        },
        status=200,
    )
