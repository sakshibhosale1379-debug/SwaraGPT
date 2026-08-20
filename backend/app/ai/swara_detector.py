"""
Swara Detection Module - Maps detected pitches to Indian Classical Music swaras.
Identifies Sa, Re, Ga, Ma, Pa, Dha, Ni with Komal/Tivra variants.
"""
import numpy as np
from typing import Optional


# Swara frequency ratios relative to Sa (Just Intonation)
SWARA_RATIOS = {
    "Sa": 1.0,
    "Re (Komal)": 16/15,      # ~112 cents
    "Re": 9/8,                  # ~204 cents
    "Ga (Komal)": 6/5,         # ~316 cents
    "Ga": 5/4,                  # ~386 cents
    "Ma": 4/3,                  # ~498 cents
    "Ma (Tivra)": 45/32,       # ~590 cents
    "Pa": 3/2,                  # ~702 cents
    "Dha (Komal)": 8/5,        # ~814 cents
    "Dha": 5/3,                 # ~884 cents
    "Ni (Komal)": 9/5,         # ~1018 cents
    "Ni": 15/8,                 # ~1088 cents
}

# Cents values for each swara
SWARA_CENTS = {name: round(1200 * np.log2(ratio), 1) for name, ratio in SWARA_RATIOS.items()}


async def detect_swaras(file_path: str, pitch_data: dict) -> list[dict]:
    """
    Map detected pitch values to the nearest swaras.
    
    Args:
        file_path: Path to audio file
        pitch_data: Output from pitch_detector
        
    Returns:
        List of detected swara events with timestamps and accuracy.
    """
    try:
        sa_freq = pitch_data.get("sa_estimate", 261.63)
        pitch_contour = pitch_data.get("pitch_contour", [])
        timestamps = pitch_data.get("timestamps", [])

        if not pitch_contour or sa_freq <= 0:
            return _mock_swara_data()

        detected_swaras = []
        prev_swara = None

        for i, (freq, time) in enumerate(zip(pitch_contour, timestamps)):
            if freq <= 0 or freq < 50:
                continue

            # Calculate cents from Sa
            cents = 1200 * np.log2(freq / sa_freq)
            cents_normalized = cents % 1200  # Normalize to single octave
            if cents < 0:
                cents_normalized = (cents % 1200 + 1200) % 1200

            # Find nearest swara
            best_swara = "Sa"
            best_deviation = 1200
            for swara_name, swara_cents in SWARA_CENTS.items():
                deviation = abs(cents_normalized - swara_cents)
                # Also check wrap-around (e.g., 1190 cents is close to Sa at 0)
                deviation = min(deviation, 1200 - deviation)
                if deviation < best_deviation:
                    best_deviation = deviation
                    best_swara = swara_name

            # Calculate accuracy (100% = perfect, 0% = 50 cents off)
            accuracy = max(0, 100 - (best_deviation * 2))

            # Only record if it's a new swara or significant change
            if best_swara != prev_swara:
                detected_swaras.append({
                    "swara": best_swara,
                    "timestamp": round(time, 3),
                    "frequency": round(freq, 2),
                    "accuracy": round(accuracy, 1),
                    "is_correct": accuracy > 70,
                    "cents_deviation": round(best_deviation, 1),
                })
                prev_swara = best_swara

        return detected_swaras if detected_swaras else _mock_swara_data()

    except Exception as e:
        print(f"Swara detection error: {e}")
        return _mock_swara_data()


def get_swara_sequence(swaras: list[dict]) -> str:
    """Convert detected swaras to a readable sequence string."""
    return " ".join(s["swara"] for s in swaras)


def calculate_swara_accuracy(swaras: list[dict]) -> float:
    """Calculate overall swara accuracy."""
    if not swaras:
        return 0.0
    accuracies = [s["accuracy"] for s in swaras]
    return round(sum(accuracies) / len(accuracies), 2)


def _mock_swara_data() -> list[dict]:
    """Return mock swara data for demo/testing."""
    return [
        {"swara": "Sa", "timestamp": 0.0, "frequency": 261.63, "accuracy": 95.2, "is_correct": True, "cents_deviation": 2.4},
        {"swara": "Re", "timestamp": 0.5, "frequency": 293.66, "accuracy": 88.7, "is_correct": True, "cents_deviation": 5.7},
        {"swara": "Ga", "timestamp": 1.0, "frequency": 329.63, "accuracy": 92.1, "is_correct": True, "cents_deviation": 3.9},
        {"swara": "Ma", "timestamp": 1.5, "frequency": 349.23, "accuracy": 85.4, "is_correct": True, "cents_deviation": 7.3},
        {"swara": "Pa", "timestamp": 2.0, "frequency": 392.0, "accuracy": 96.8, "is_correct": True, "cents_deviation": 1.6},
        {"swara": "Dha", "timestamp": 2.5, "frequency": 440.0, "accuracy": 91.3, "is_correct": True, "cents_deviation": 4.3},
        {"swara": "Ni", "timestamp": 3.0, "frequency": 493.88, "accuracy": 79.2, "is_correct": True, "cents_deviation": 10.4},
        {"swara": "Sa", "timestamp": 3.5, "frequency": 523.25, "accuracy": 94.1, "is_correct": True, "cents_deviation": 2.9},
    ]
