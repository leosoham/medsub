import re
from functools import lru_cache

import pymupdf
from rapidfuzz import fuzz, process

from .models import Medicine


MAX_PDF_SIZE = 10 * 1024 * 1024  # 10 MB

NON_MEDICINE_KEYWORDS = (
    "patient:",
    "doctor:",
    "dr.",
    "hospital",
    "clinic",
    "date:",
    "age:",
    "gender:",
    "address:",
    "diagnosis:",
    "follow up",
    "follow-up",
    "signature",
    "prescription:",
    "for software testing only",
)

HEADING_LINES = {
    "sample digital prescription",
    "digital prescription",
    "prescription",
    "medicines",
    "medication",
    "medicine",
    "rx",
}

DOSAGE_FORM_WORDS = {
    "tablet",
    "tablets",
    "tab",
    "tabs",
    "capsule",
    "capsules",
    "cap",
    "caps",
    "syrup",
    "suspension",
    "injection",
    "injections",
    "drops",
    "drop",
    "cream",
    "ointment",
    "gel",
    "powder",
    "solution",
    "oral",
    "topical",
    "extended",
    "release",
    "dispersible",
    "chewable",
}

STRENGTH_PATTERN = re.compile(
    r"\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%)\b",
    re.IGNORECASE,
)


def extract_pdf_text(pdf_file):
    """
    Extract selectable text from an uploaded PDF.

    Raises ValueError for invalid, oversized, empty, or encrypted PDFs.
    Scanned/image-only PDFs are not processed using OCR.
    """
    if pdf_file is None:
        raise ValueError("Please upload a prescription PDF.")

    if getattr(pdf_file, "size", 0) > MAX_PDF_SIZE:
        raise ValueError("PDF size must not exceed 10 MB.")

    filename = getattr(pdf_file, "name", "")

    if not filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are supported.")

    pdf_bytes = pdf_file.read()

    if not pdf_bytes:
        raise ValueError("The uploaded PDF is empty.")

    try:
        with pymupdf.open(
            stream=pdf_bytes,
            filetype="pdf",
        ) as document:

            if document.is_encrypted:
                raise ValueError(
                    "Password-protected PDFs are not supported."
                )

            extracted_pages = []

            for page in document:
                page_text = page.get_text("text")

                if page_text.strip():
                    extracted_pages.append(page_text)

            return "\n".join(extracted_pages).strip()

    except ValueError:
        raise

    except Exception as exc:
        raise ValueError(
            "The PDF could not be read. Please upload a valid PDF."
        ) from exc


def _normalize_text(value):
    """Normalize text for conservative medicine-name comparison."""

    value = (value or "").lower()
    value = value.replace("μg", "mcg").replace("µg", "mcg")
    value = re.sub(r"[^a-z0-9.%]+", " ", value)

    return " ".join(value.split())


def _extract_strengths(value):
    """Extract explicit strengths as normalized number/unit pairs."""

    strengths = []

    for number, unit in STRENGTH_PATTERN.findall(value or ""):
        unit = unit.lower()
        numeric_value = float(number)

        if unit == "g":
            numeric_value *= 1000
            unit = "mg"

        strengths.append((numeric_value, unit))

    return strengths




def _clean_prescription_lines(extracted_text):
    """Pair medicine names with their strength/form lines."""

    raw_lines = [
        line.strip()
        for line in extracted_text.splitlines()
        if line.strip()
    ]

    lines = []
    seen = set()
    i = 0

    while i < len(raw_lines):
        line = re.sub(
            r"^\s*\d+[\.\)]\s*", "", raw_lines[i]
        ).strip()

        lowered = line.lower()

        # Skip headings and common metadata.
        if (
            lowered in HEADING_LINES
            or any(
                keyword in lowered
                for keyword in NON_MEDICINE_KEYWORDS
            )
            or lowered.startswith((
                "patient ", "name:", "age:", "patient id:",
                "date ", "date:", "gender ", "address ",
                "hospital ", "clinic ", "signature ",
                "document type", "demo id", "issued",
                "allergies", "weight", "contact",
                "reason for visit", "relevant history",
                "diagnosis", "medicine text", "test directions",
                "parsing target", "expected extraction",
                "text present", "purpose", "page ",
                "genericx", "demo document", "demo only",
                "fictional test document", "test note:",
            ))
        ):
            i += 1
            continue

        # A strength/form line may follow the medicine name.
        if (
            STRENGTH_PATTERN.search(line)
            and re.search(r"[a-zA-Z]", line)
        ):
            # Skip strength-only cells such as "500 mg tablet".
            i += 1
            continue

        # Treat a line without a strength as a possible medicine name.
        if not re.search(r"[a-zA-Z]", line):
            i += 1
            continue

        # Combine this line with the next line if it contains a strength.
        if i + 1 < len(raw_lines):
            next_line = raw_lines[i + 1].strip()

            if (
                STRENGTH_PATTERN.search(next_line)
                and re.search(r"[a-zA-Z]", next_line)
            ):
                candidate = f"{line} {next_line}"
                normalized = _normalize_text(candidate)

                if normalized not in seen:
                    seen.add(normalized)
                    lines.append(candidate)

                i += 2
                continue

        i += 1

    return lines


@lru_cache(maxsize=1)
def _get_medicine_index():
    """
    Load medicine records and precompute searchable fields once per process.

    The index remains cached until the cache is cleared or Django restarts.
    """

    medicine_rows = list(
        Medicine.objects.exclude(
            medicine_name__isnull=True
        )
        .exclude(medicine_name="")
        .values(
            "id",
            "medicine_name",
            "manufacturer",
            "dosage_form",
            "price",
            "composition",
        )
    )

    indexed_rows = []
    normalized_names = []

    for medicine in medicine_rows:
        name = medicine["medicine_name"] or ""
        composition = medicine.get("composition") or ""

        normalized_name = _normalize_text(name)

        indexed_rows.append(
            {
                **medicine,
                "_normalized_name": normalized_name,
                "_normalized_composition": _normalize_text(
                    composition
                ),
                "_name_strengths": _extract_strengths(name),
            }
        )

        normalized_names.append(normalized_name)

    return indexed_rows, normalized_names


def clear_medicine_index_cache():
    """
    Clear the cached medicine index after medicine data changes.
    """

    _get_medicine_index.cache_clear()


def extract_medicine_candidates(extracted_text, limit=5):
    """
    Find possible database matches for each prescription line.

    This function retrieves candidates only. It does not establish
    therapeutic equivalence or recommend treatment.

    All results require confirmation.
    """

    if not extracted_text or not extracted_text.strip():
        return []

    if (
        not isinstance(limit, int)
        or isinstance(limit, bool)
        or limit < 1
    ):
        raise ValueError("limit must be a positive integer.")

    lines = _clean_prescription_lines(extracted_text)

    if not lines:
        return []

    medicine_rows, normalized_names = _get_medicine_index()

    if not medicine_rows:
        return []

    results = []

    for line in lines:
        requested_normalized = _normalize_text(line)
        requested_strengths = _extract_strengths(line)

        # Remove dosage instructions and strengths from meaningful tokens.
        requested_tokens = set(requested_normalized.split())

        requested_tokens -= DOSAGE_FORM_WORDS

        requested_tokens -= {
            "mg",
            "mcg",
            "g",
            "ml",
            "iu",
            "percent",
            "once",
            "twice",
            "daily",
            "nightly",
            "morning",
            "evening",
            "before",
            "after",
            "food",
            "days",
            "day",
            "week",
            "weeks",
        }

        requested_tokens = {
            token
            for token in requested_tokens
            if not token.isdigit() and len(token) >= 3
        }

        # Fuzzy retrieval creates candidates, not proof of equivalence.
        matches = process.extract(
            requested_normalized,
            normalized_names,
            scorer=fuzz.WRatio,
            limit=min(len(normalized_names), limit * 20),
            score_cutoff=65,
        )

        candidates = []
        seen_ids = set()

        for _, score, index in matches:
            medicine = medicine_rows[index]

            if medicine["id"] in seen_ids:
                continue

            name = medicine["medicine_name"] or ""
            composition = medicine.get("composition") or ""

            normalized_name = medicine["_normalized_name"]
            normalized_composition = medicine[
                "_normalized_composition"
            ]

            candidate_text = (
                f" {normalized_name} {normalized_composition} "
            )

            # Require a meaningful requested token in the candidate.
            if requested_tokens and not any(
                f" {token} " in candidate_text
                for token in requested_tokens
            ):
                continue

            # Reject explicitly different strengths when both sides
            # contain strength information.
            candidate_name_strengths = medicine["_name_strengths"]

            if requested_strengths and candidate_name_strengths:
                if not any(
                    requested_strength in candidate_name_strengths
                    for requested_strength in requested_strengths
                ):
                    continue

            # Preserve the original conservative contradiction check.
            if requested_tokens and normalized_composition:
                composition_tokens = set(
                    normalized_composition.split()
                )

                name_tokens = set(normalized_name.split())

                if (
                    not requested_tokens.intersection(
                        composition_tokens
                    )
                    and not requested_tokens.intersection(
                        name_tokens
                    )
                ):
                    continue

            seen_ids.add(medicine["id"])

            candidates.append(
                {
                    "id": medicine["id"],
                    "medicine_name": name,
                    "manufacturer": medicine["manufacturer"],
                    "dosage_form": medicine["dosage_form"],
                    "composition": composition,
                    "price": (
                        float(medicine["price"])
                        if medicine["price"] is not None
                        else None
                    ),
                    "match_score": round(float(score), 2),
                }
            )

            if len(candidates) >= limit:
                break

        results.append(
            {
                "extracted_text": line,
                "candidates": candidates,
                "needs_confirmation": True,
            }
        )

    return results