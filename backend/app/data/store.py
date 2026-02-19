# app/data/store.py
from pathlib import Path
from threading import RLock
import polars as pl
import pandas as pd
from app.config.settings import settings

class DatasetStore:
    def __init__(self, path: str | Path, engine: str = "polars"):
        self.path = Path(path)
        self.engine = engine
        self._df = None
        self._sig = None
        self._lock = RLock()

    def _read(self):
        if self.path.suffix.lower() == ".parquet":
            return pl.read_parquet(self.path) if self.engine == "polars" else pd.read_parquet(self.path)

        if self.engine == "polars":
            # intenta con un escaneo más largo para inferencia
            try:
                return pl.read_csv(
                    self.path,
                    separator=";",
                    infer_schema_length=10000,
                )
            except pl.exceptions.ComputeError:
                float_cols = [
                    "CarbonMonoxide", "CarbonDioxide", "Methane",
                    "Oxygen", "Hydrogen", "CalorificValue",
                ]
                overrides = {c: pl.Float64 for c in float_cols}
                return pl.read_csv(
                    self.path,
                    separator=";",
                    infer_schema_length=10000,
                    schema_overrides=overrides,   # <-- clave
                )
        else:
            return pd.read_csv(self.path, sep=";")

    def get(self):
        sig = (self.path.stat().st_mtime_ns, self.path.stat().st_size)
        with self._lock:
            if self._df is None or sig != self._sig:
                self._df = self._read()
                self._sig = sig
            return self._df

store = DatasetStore(settings.DATASET_PATH, engine=settings.DATASET_ENGINE)

def df_dep():
    return store.get()
