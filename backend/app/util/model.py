from functools import lru_cache
from pathlib import Path
from joblib import load

MODEL_PATH = Path(__file__).resolve().parent / "Best_model.joblib"

@lru_cache(maxsize=1)
def get_model():
    return load(MODEL_PATH)
