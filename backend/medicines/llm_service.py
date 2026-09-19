import os

from dotenv import load_dotenv
from groq import Groq


# =====================================================
# Groq Configuration
# =====================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment.")

client = Groq(
    api_key=GROQ_API_KEY
)

MODEL_NAME = "openai/gpt-oss-20b"


# =====================================================
# Generate Medicine Explanation
# =====================================================

def generate_medicine_explanation(context):

    prompt = f"""
You are an explanation assistant for a medicine substitution system.

Explain ONLY the information explicitly present in the context.

STRICT RULES:

1. Use only the information provided in the context.

2. Do not add any medical facts that are not present in the context.

3. Do not infer or assume that a medicine is safe, effective,
   suitable, equivalent, or medically appropriate.

4. Do not claim that one medicine is better than another.

5. Do not claim that a substitution maintains or improves treatment.

6. Do not invent dosage, benefits, risks, contraindications,
   interactions, or medical advice.

7. Do not make recommendations yourself.

8. If the context contains medicines with the same composition,
   you may state that they have the same listed composition.

9. If the context provides prices or savings, you may state
   those exact values. Do not describe them as an offer or
   availability.

10. Never use words such as "available", "stocked", "sold",
    "offered", or "can be purchased". Only say that a medicine
    or price is "listed in the provided data".

11. Do not use the word "equivalent" unless the context
    explicitly uses that word.

12. Keep the explanation to 3-4 sentences.

13. If information is missing, simply omit it rather than guessing.

CONTEXT:

{context}

Write a factual explanation based only on the context.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_completion_tokens=1000,
        reasoning_effort="low",
        include_reasoning=False,
        temperature=0.2
    )

    return response.choices[0].message.content.strip()