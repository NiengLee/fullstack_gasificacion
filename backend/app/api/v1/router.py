from fastapi.security import HTTPBearer
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi import APIRouter, HTTPException, Depends, Request, Body,Query

from app.data.store import df_dep
from app.config.settings import settings
from app.schema.schema import KNNPredictionRequest, KNNPredictionResponse
from app.service.service import scatter_html, scatter_components

from app.data.store import df_dep
from app.service.service import predict_knn



router  = APIRouter(prefix="/api/v1", tags=["Operation Actions"])
security= HTTPBearer()


@router.post("/predict-knn",
            summary="Predict gasification",
            description="Gasification prediction using KNN",
            response_model=KNNPredictionResponse,
            responses={
                200: {"description": "Successful Prediction"},
                500: {"description": "Internal server error"}
            },
        )
def predict_knn_endpoint(data: KNNPredictionRequest) -> KNNPredictionResponse:
    try:    
        return predict_knn(data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")


@router.get("/viz/scatter/html", response_class=HTMLResponse,summary="Scatter Bokeh (HTML)")
def viz_scatter_html(
                        x: str = Query(..., description="columna eje X"),
                        y: str = Query(..., description="columna eje Y"),
                        size_col: str | None = Query(None, description="columna numérica para tamaño"),
                        hue: str | None = Query(None, description="columna categórica para color"),
                        df = Depends(df_dep),
                    ):
    try:
        html = scatter_html(df, x=x, y=y, size_col=size_col, hue=hue)
        return HTMLResponse(content=html)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/viz/scatter/components",summary="Scatter Bokeh (components)")
def viz_scatter_components(
                            x: str = Query(..., description="columna eje X"),
                            y: str = Query(..., description="columna eje Y"),
                            size_col: str | None = Query(None, description="columna numérica para tamaño"),
                            hue: str | None = Query(None, description="columna categórica para color"),
                            df = Depends(df_dep),
                        ):
    try:
        payload = scatter_components(df, x=x, y=y, size_col=size_col, hue=hue)
        return JSONResponse(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))