import anthropic
import os
import json
from dotenv import load_dotenv

load_dotenv()

# client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def build_drug_combination_key(drugs: list[dict]) -> str:
    """
    Creates a normalized cache key from drug list.
    Sorts alphabetically so "Warfarin + Metformin" == "Metformin + Warfarin"
    Lowercased to handle case differences.
    """
    drug_names = sorted([d["name"].strip().lower() for d in drugs])
    return "|".join(drug_names)

def check_drug_interactions(drugs: list[dict]) -> dict:
    # Mock implementation approved by hiring team

    drug_names = [d["name"] for d in drugs]

    if len(drugs) == 1:
        severity = "None"
        has_interactions = False
        interactions = []
        summary = "Only one medication provided. No interaction check required."
    elif len(drugs) <= 3:
        severity = "Mild"
        has_interactions = True
        interactions = [
            {
                "drugs_involved": drug_names[:2],
                "severity": "Mild",
                "effect": "Potential interaction detected between prescribed medications.",
                "recommendation": "Review patient history and monitor as needed."
            }
        ]
        summary = f"Potential mild interaction detected among {len(drugs)} medications."
    else:
        severity = "Moderate"
        has_interactions = True
        interactions = [
            {
                "drugs_involved": drug_names[:2],
                "severity": "Moderate",
                "effect": "Multiple medications may increase risk of adverse effects.",
                "recommendation": "Clinical review recommended before dispensing."
            }
        ]
        summary = f"Potential moderate interaction risk detected among {len(drugs)} medications."

    return {
        "success": True,
        "severity": severity,
        "result": {
            "has_interactions": has_interactions,
            "severity": severity,
            "summary": summary,
            "interactions": interactions,
            "general_advice": "Mock AI analysis generated for assessment purposes."
        },
        "raw_text": "mock_response"
    }


def check_drug_interaction(drugs: list[dict]) -> dict:
    """
    Calls Claude API with a pharmacy-specific prompt.
    Returns dict with: result (str), severity (str), success (bool)
    
    Only call this when len(drugs) >= 2.
    """
    
    # Format drug list for prompt
    drug_list_text = "\n".join(
        [f"- {d['name']} {d['dosage']}" for d in drugs]
    )

    prompt = f"""You are a clinical pharmacist AI assistant helping a licensed pharmacist 
review a prescription before dispensing medication to a patient.

Analyze the following prescribed medications for drug-drug interactions, 
contraindications, additive toxicity, and combined pharmacokinetic effects 
(e.g., CYP450 enzyme inhibition/induction, protein binding displacement).

Prescribed medications:
{drug_list_text}

Provide your clinical analysis in the following JSON format ONLY — 
no preamble, no explanation outside the JSON:

{{
  "has_interactions": true or false,
  "severity": "None" or "Mild" or "Moderate" or "Severe",
  "summary": "One sentence summary for the pharmacist",
  "interactions": [
    {{
      "drugs_involved": ["Drug A", "Drug B"],
      "severity": "Mild" or "Moderate" or "Severe",
      "effect": "What happens clinically",
      "recommendation": "What the pharmacist should do"
    }}
  ],
  "general_advice": "Any additional dispensing notes or monitoring requirements"
}}

If there are no interactions, return has_interactions: false, severity: "None", 
and an empty interactions array with reassuring general_advice."""

    try:
        message = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        raw_text = message.content[0].text.strip()
        
        # Strip markdown code fences if Claude adds them
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        
        parsed = json.loads(raw_text)
        
        return {
            "success": True,
            "severity": parsed.get("severity", "None"),
            "result": parsed,
            "raw_text": raw_text
        }

    except json.JSONDecodeError:
        # Claude returned something we can't parse — still save it as text
        return {
            "success": True,
            "severity": "Unknown",
            "result": {"summary": raw_text, "interactions": [], "has_interactions": False},
            "raw_text": raw_text
        }
    except anthropic.APIConnectionError:
        return {
            "success": False,
            "error": "Could not connect to AI service. Prescription saved without interaction check.",
            "severity": None,
            "result": None
        }
    except anthropic.RateLimitError:
        return {
            "success": False,
            "error": "AI service is busy. Prescription saved. Please re-check interactions later.",
            "severity": None,
            "result": None
        }
    except Exception as e:
        return {
            "success": False,
            "error": "AI interaction check failed. Prescription saved without it.",
            "severity": None,
            "result": None
        }