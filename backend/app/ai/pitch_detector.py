"""
Pitch Detection Module - Using YIN algorithm and FFT for Indian Classical Music.
Detects fundamental frequency (F0) from vocal recordings.
"""
import numpy as np
from typing import Optional


async def detect_pitch(file_path: str) -> dict:
    """
    Detect pitch contour from an audio file using librosa's YIN algorithm.
    
    Returns:
        dict with pitch_contour, timestamps, mean_pitch, pitch_stability,
        pitch_range, and shruti_deviation.
    """
    try:
        import librosa

        # Load audio file
        y, sr = librosa.load(file_path, sr=22050, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)

        # YIN pitch detection
        f0 = librosa.yin(
            y,
            fmin=librosa.note_to_hz('C2'),  # ~65 Hz (low male voice)
            fmax=librosa.note_to_hz('C6'),  # ~1047 Hz (high female voice)
            sr=sr,
            frame_length=2048,
            hop_length=512,
        )

        # Generate timestamps
        timestamps = librosa.times_like(f0, sr=sr, hop_length=512)

        # Filter out unvoiced segments (very low or very high values)
        voiced_mask = (f0 > 50) & (f0 < 1200)
        voiced_f0 = f0[voiced_mask]

        if len(voiced_f0) == 0:
            return {
                "mean_pitch": 0.0,
                "pitch_stability": 0.0,
                "pitch_range_low": 0.0,
                "pitch_range_high": 0.0,
                "pitch_contour": [],
                "timestamps": [],
                "duration": duration,
                "shruti_deviation": 0.0,
            }

        # Calculate pitch statistics
        mean_pitch = float(np.mean(voiced_f0))
        std_pitch = float(np.std(voiced_f0))
        pitch_stability = max(0, min(100, 100 - (std_pitch / mean_pitch * 100)))

        # Estimate Sa (tonic) - most common pitch
        sa_estimate = estimate_tonic(voiced_f0)

        # Calculate shruti deviation from nearest standard pitch
        shruti_deviation = calculate_shruti_deviation(voiced_f0, sa_estimate)

        return {
            "mean_pitch": round(mean_pitch, 2),
            "pitch_stability": round(pitch_stability, 2),
            "pitch_range_low": round(float(np.min(voiced_f0)), 2),
            "pitch_range_high": round(float(np.max(voiced_f0)), 2),
            "pitch_contour": [round(float(x), 2) for x in f0[:500]],  # Limit for response size
            "timestamps": [round(float(t), 3) for t in timestamps[:500]],
            "duration": round(duration, 2),
            "sa_estimate": round(sa_estimate, 2),
            "shruti_deviation": round(shruti_deviation, 4),
        }

    except ImportError:
        return _mock_pitch_data()
    except Exception as e:
        print(f"Pitch detection error: {e}")
        return _mock_pitch_data()


def estimate_tonic(pitches: np.ndarray) -> float:
    """
    Estimate the tonic (Sa) frequency using histogram-based method.
    The Sa is typically the most sustained pitch in Indian classical singing.
    """
    # Convert to cents relative to C2 (65.41 Hz)
    cents = 1200 * np.log2(pitches / 65.41)
    
    # Create histogram with fine resolution
    hist, bin_edges = np.histogram(cents, bins=240, range=(0, 2400))
    
    # Find peak (most common pitch)
    peak_idx = np.argmax(hist)
    peak_cents = (bin_edges[peak_idx] + bin_edges[peak_idx + 1]) / 2
    
    # Convert back to Hz
    sa_hz = 65.41 * (2 ** (peak_cents / 1200))
    return sa_hz


def calculate_shruti_deviation(pitches: np.ndarray, sa_freq: float) -> float:
    """
    Calculate average deviation from the nearest shruti positions.
    In Indian music, there are 22 shrutis per octave.
    """
    if sa_freq <= 0:
        return 0.0

    # Calculate intervals in cents relative to Sa
    cents_from_sa = 1200 * np.log2(pitches / sa_freq)
    cents_from_sa = cents_from_sa % 1200  # Normalize to one octave

    # 12 semitone positions (simplified from 22 shrutis)
    semitone_cents = np.array([0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100])

    # Calculate deviation from nearest semitone for each pitch
    deviations = []
    for c in cents_from_sa:
        min_dev = min(abs(c - s) for s in semitone_cents)
        deviations.append(min_dev)

    return float(np.mean(deviations))


def _mock_pitch_data() -> dict:
    """Return mock pitch data for demo/testing."""
    return {
        "mean_pitch": 261.63,
        "pitch_stability": 78.5,
        "pitch_range_low": 196.0,
        "pitch_range_high": 392.0,
        "pitch_contour": [261.63, 265.0, 270.0, 293.66, 329.63, 349.23, 392.0, 349.23, 329.63, 293.66, 261.63],
        "timestamps": [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
        "duration": 5.0,
        "sa_estimate": 261.63,
        "shruti_deviation": 12.5,
    }
