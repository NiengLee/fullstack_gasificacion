from pydantic import BaseModel
from typing import Optional


class KNNPrediction(BaseModel):
    CO_perc : float
    CO2_perc : float
    CH4_perc : float
    O2_perc : float
    H2_perc : float
    calorific_value : float

class KNNPredictionRequest(BaseModel):
    time: Optional[int] = 29
    t_in: Optional[int] = 500
    t_pr: Optional[int] = 1000
    agent_type: Optional[str]=  "Oxygen"
    q_agent: Optional[float] = 0.015
    sample_type: Optional[str] = "TWTS"
    catalyst_type: Optional[str] = "Marble dust"
    catalyst_rate: Optional[float] = 10

class KNNPredictionResponse(BaseModel):
    status: str
    message: str
    data: KNNPrediction