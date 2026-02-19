# app/util/utils.py
import pandas as pd
import numpy as np
from pathlib import Path
from joblib import load
from app.schema.schema import KNNPredictionRequest

MODEL_PATH = Path(__file__).resolve().parent / "Best_model.joblib"

def knn_prediction_best_model(data: KNNPredictionRequest) -> list[float]:
    model = load(MODEL_PATH)

    columns = ['Time (min)', 'Tin/amb (°C)', 'ProcessTemperature (°C)','AgentType','AgentFlow (L/min)', 'SampleType', 'CatalystType', 'CatalystRatio (%)']
    row = [data.time, data.t_in, data.t_pr, data.agent_type, data.q_agent,data.sample_type, data.catalyst_type, data.catalyst_rate]
    sample_df = pd.DataFrame([row], columns=columns)
    yhat = model.predict(sample_df)

    return np.asarray(yhat, dtype=float).reshape(-1).tolist()
