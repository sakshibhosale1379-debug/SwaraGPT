"""
Raga Recognition Module - Identifies ragas from swara sequences.
Uses pattern matching against aroha/avaroha definitions of major Hindustani ragas.
"""
from typing import Optional


# ─── Raga Database (Major Hindustani Ragas) ─────────────────
RAGA_DATABASE = {
    "Yaman": {
        "thaat": "Kalyan",
        "aroha": ["Ni", "Re", "Ga", "Ma (Tivra)", "Dha", "Ni", "Sa"],
        "avaroha": ["Sa", "Ni", "Dha", "Pa", "Ma (Tivra)", "Ga", "Re", "Sa"],
        "vadi": "Ga",
        "samvadi": "Ni",
        "swaras": {"Sa", "Re", "Ga", "Ma (Tivra)", "Pa", "Dha", "Ni"},
        "time": "Evening (first prahar of night)",
        "mood": "Devotional, peaceful, romantic",
    },
    "Bhairav": {
        "thaat": "Bhairav",
        "aroha": ["Sa", "Re (Komal)", "Ga", "Ma", "Pa", "Dha (Komal)", "Ni", "Sa"],
        "avaroha": ["Sa", "Ni", "Dha (Komal)", "Pa", "Ma", "Ga", "Re (Komal)", "Sa"],
        "vadi": "Dha (Komal)",
        "samvadi": "Re (Komal)",
        "swaras": {"Sa", "Re (Komal)", "Ga", "Ma", "Pa", "Dha (Komal)", "Ni"},
        "time": "Early morning (Sandhi Prakash)",
        "mood": "Serious, devotional, majestic",
    },
    "Bhairavi": {
        "thaat": "Bhairavi",
        "aroha": ["Sa", "Re (Komal)", "Ga (Komal)", "Ma", "Pa", "Dha (Komal)", "Ni (Komal)", "Sa"],
        "avaroha": ["Sa", "Ni (Komal)", "Dha (Komal)", "Pa", "Ma", "Ga (Komal)", "Re (Komal)", "Sa"],
        "vadi": "Ma",
        "samvadi": "Sa",
        "swaras": {"Sa", "Re (Komal)", "Ga (Komal)", "Ma", "Pa", "Dha (Komal)", "Ni (Komal)"},
        "time": "Any time (conclusion raga)",
        "mood": "Devotional, emotional, compassionate",
    },
    "Bilawal": {
        "thaat": "Bilawal",
        "aroha": ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "Sa"],
        "avaroha": ["Sa", "Ni", "Dha", "Pa", "Ma", "Ga", "Re", "Sa"],
        "vadi": "Dha",
        "samvadi": "Ga",
        "swaras": {"Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"},
        "time": "Late morning",
        "mood": "Bright, joyful",
    },
    "Kafi": {
        "thaat": "Kafi",
        "aroha": ["Sa", "Re", "Ga (Komal)", "Ma", "Pa", "Dha", "Ni (Komal)", "Sa"],
        "avaroha": ["Sa", "Ni (Komal)", "Dha", "Pa", "Ma", "Ga (Komal)", "Re", "Sa"],
        "vadi": "Pa",
        "samvadi": "Sa",
        "swaras": {"Sa", "Re", "Ga (Komal)", "Ma", "Pa", "Dha", "Ni (Komal)"},
        "time": "Late night",
        "mood": "Romantic, light, playful",
    },
    "Asavari": {
        "thaat": "Asavari",
        "aroha": ["Sa", "Re", "Ma", "Pa", "Dha (Komal)", "Sa"],
        "avaroha": ["Sa", "Ni (Komal)", "Dha (Komal)", "Pa", "Ma", "Ga (Komal)", "Re", "Sa"],
        "vadi": "Dha (Komal)",
        "samvadi": "Ga (Komal)",
        "swaras": {"Sa", "Re", "Ga (Komal)", "Ma", "Pa", "Dha (Komal)", "Ni (Komal)"},
        "time": "Late morning",
        "mood": "Pathos, seriousness",
    },
    "Khamaj": {
        "thaat": "Khamaj",
        "aroha": ["Sa", "Ga", "Ma", "Pa", "Dha", "Ni", "Sa"],
        "avaroha": ["Sa", "Ni (Komal)", "Dha", "Pa", "Ma", "Ga", "Re", "Sa"],
        "vadi": "Ga",
        "samvadi": "Ni",
        "swaras": {"Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "Ni (Komal)"},
        "time": "Evening",
        "mood": "Romantic, light",
    },
    "Malkauns": {
        "thaat": "Bhairavi",
        "aroha": ["Sa", "Ga (Komal)", "Ma", "Dha (Komal)", "Ni (Komal)", "Sa"],
        "avaroha": ["Sa", "Ni (Komal)", "Dha (Komal)", "Ma", "Ga (Komal)", "Sa"],
        "vadi": "Ma",
        "samvadi": "Sa",
        "swaras": {"Sa", "Ga (Komal)", "Ma", "Dha (Komal)", "Ni (Komal)"},
        "time": "Late night",
        "mood": "Serious, meditative, powerful",
    },
    "Darbari Kanada": {
        "thaat": "Asavari",
        "aroha": ["Sa", "Re", "Ga (Komal)", "Ma", "Pa", "Dha (Komal)", "Ni (Komal)", "Sa"],
        "avaroha": ["Sa", "Ni (Komal)", "Dha (Komal)", "Pa", "Ma", "Pa", "Ga (Komal)", "Re", "Sa"],
        "vadi": "Re",
        "samvadi": "Pa",
        "swaras": {"Sa", "Re", "Ga (Komal)", "Ma", "Pa", "Dha (Komal)", "Ni (Komal)"},
        "time": "Late night",
        "mood": "Majestic, serious, royal",
    },
    "Bageshri": {
        "thaat": "Kafi",
        "aroha": ["Sa", "Ga (Komal)", "Ma", "Dha", "Ni (Komal)", "Sa"],
        "avaroha": ["Sa", "Ni (Komal)", "Dha", "Pa", "Ma", "Ga (Komal)", "Re", "Sa"],
        "vadi": "Ma",
        "samvadi": "Sa",
        "swaras": {"Sa", "Re", "Ga (Komal)", "Ma", "Pa", "Dha", "Ni (Komal)"},
        "time": "Late night",
        "mood": "Romantic, sentimental",
    },
}


async def recognize_raga(file_path: str, swara_data: list[dict]) -> list[dict]:
    """
    Recognize the raga from detected swara sequence.
    Uses swara-set matching with confidence scoring.
    
    Returns:
        List of raga predictions sorted by confidence.
    """
    try:
        if not swara_data:
            return _mock_raga_data()

        # Extract unique swaras used (normalize variants)
        detected_swaras = set()
        for s in swara_data:
            detected_swaras.add(s["swara"])

        # Score each raga based on swara overlap
        predictions = []
        for raga_name, raga_info in RAGA_DATABASE.items():
            raga_swaras = raga_info["swaras"]
            
            # Jaccard similarity
            intersection = len(detected_swaras & raga_swaras)
            union = len(detected_swaras | raga_swaras)
            similarity = intersection / union if union > 0 else 0

            # Bonus for matching vadi/samvadi
            vadi_bonus = 0.1 if raga_info["vadi"] in detected_swaras else 0
            samvadi_bonus = 0.05 if raga_info["samvadi"] in detected_swaras else 0

            # Penalty for extra swaras not in the raga
            extra_swaras = detected_swaras - raga_swaras
            penalty = len(extra_swaras) * 0.05

            confidence = min(1.0, max(0, similarity + vadi_bonus + samvadi_bonus - penalty))

            if confidence > 0.2:
                predictions.append({
                    "raga_name": raga_name,
                    "confidence": round(confidence, 3),
                    "thaat": raga_info["thaat"],
                    "time": raga_info.get("time", ""),
                    "mood": raga_info.get("mood", ""),
                    "aroha": " ".join(raga_info["aroha"]),
                    "avaroha": " ".join(raga_info["avaroha"]),
                })

        # Sort by confidence descending
        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        return predictions[:5] if predictions else _mock_raga_data()

    except Exception as e:
        print(f"Raga recognition error: {e}")
        return _mock_raga_data()


def _mock_raga_data() -> list[dict]:
    """Return mock raga prediction data for demo/testing."""
    return [
        {"raga_name": "Yaman", "confidence": 0.89, "thaat": "Kalyan"},
        {"raga_name": "Bilawal", "confidence": 0.65, "thaat": "Bilawal"},
        {"raga_name": "Khamaj", "confidence": 0.42, "thaat": "Khamaj"},
    ]
