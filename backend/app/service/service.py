import numpy as np
import pandas as pd
import polars as pl
from typing import Optional, Sequence, Tuple, Union
from bokeh.resources import CDN
from bokeh.plotting import figure, show
from bokeh.transform import factor_cmap
from bokeh.embed import components, file_html
from bokeh.palettes import Category10, Category20
from bokeh.models import ColumnDataSource, LinearInterpolator, HoverTool

from app.schema.schema import KNNPredictionRequest, KNNPredictionResponse
from app.util.utils import knn_prediction_best_model



def predict_knn(data: KNNPredictionRequest) -> KNNPredictionResponse:
    
    vals = knn_prediction_best_model(data)  
    
    return KNNPredictionResponse(
        status="200",
        message="OK!",
        data={
                "CO_perc": vals[0],
                "CO2_perc": vals[1],
                "CH4_perc": vals[2],
                "O2_perc": vals[3],
                "H2_perc": vals[4],
                "calorific_value": vals[5],
            }
    )


def scatter_bokeh(
    df: Union[pd.DataFrame, pl.DataFrame],x: str,y: str,size_col: Optional[str] = None,hue: Optional[str] = None,*,
    width: int = 700,height: int = 520,alpha: float = 0.25,size_range: Tuple[float, float] = (6, 26),size_percentiles: Tuple[float, float] = (5, 95),
    max_hue: int = 12,legend_loc: str = "top_right",title: Optional[str] = None,show_plot: bool = True):
    """
        Scatter Bokeh con tamaño por `size_col` y color por `hue` (ambos opcionales).
        - df: pandas o polars.
        - x, y: columnas obligatorias.
        - size_col: columna numérica para el tamaño (opcional).
        - hue: columna categórica para el color (opcional).
    """

    if isinstance(df, pl.DataFrame):
        dfp = df.to_pandas()
    elif isinstance(df, pd.DataFrame):
        dfp = df.copy()
    else:
        raise TypeError("df debe ser pandas.DataFrame o polars.DataFrame")

    for col in (x, y):
        if col not in dfp.columns:
            raise ValueError(f"Columna requerida no encontrada: {col!r}")
    if size_col is not None and size_col not in dfp.columns:
        raise ValueError(f"size_col no encontrada: {size_col!r}")
    if hue is not None and hue not in dfp.columns:
        raise ValueError(f"hue no encontrada: {hue!r}")

    cols = [x, y]
    if size_col: cols.append(size_col)
    if hue: cols.append(hue)
    dfp = dfp[cols].dropna(subset=[x, y])
    if size_col:
        dfp = dfp.dropna(subset=[size_col])
    if hue:
        dfp[hue] = dfp[hue].astype("string").fillna("Missing")

    src = ColumnDataSource(dfp)

    size_kwargs = dict(size=8)
    if size_col:
        c = dfp[size_col].to_numpy()
        lo, hi = np.percentile(c, size_percentiles)
        if lo == hi:
            hi = lo + 1e-9
        size_map = LinearInterpolator(x=[lo, hi], y=list(size_range))
        size_kwargs = dict(size={'field': size_col, 'transform': size_map})

    color_kwargs = dict()
    if hue:
        factors = dfp[hue].astype(str).value_counts().index.tolist()[:max_hue]
        dfp = dfp[dfp[hue].isin(factors)].copy()
        src.data = ColumnDataSource.from_df(dfp)  
        k = len(factors)
        if k <= 10:
            palette = Category10[max(3, k)]
        else:
            palette = Category20[max(3, min(20, k))]
        color_mapper = factor_cmap(hue, palette=palette, factors=factors)
        color_kwargs = dict(fill_color=color_mapper, line_color=color_mapper)
    else:
        color_kwargs = dict(fill_color="#1f77b4", line_color="black")

    if title is None:
        t = f"{y} vs {x}"
        if size_col: t += f" · size={size_col}"
        if hue: t += f" · hue={hue}"
    else:
        t = title

    p = figure(
        title=t,
        x_axis_label=x, y_axis_label=y,
        width=width, height=height,
        tools="pan,wheel_zoom,box_zoom,reset,save"
    )

    r = p.scatter(
        x=x, y=y, source=src,
        **size_kwargs, **color_kwargs,
        marker="circle", alpha=alpha,
        line_width=0.8,
        hover_fill_color=color_kwargs.get('fill_color', "#1f77b4"),
        hover_alpha=0.9, hover_line_color='black', hover_line_width=1.5,
        legend_field=hue if hue else None
    )

    
    tips = [(x, f"@{x}{{0.2f}}"), (y, f"@{y}{{0.2f}}")]
    if size_col: tips.append((size_col, f"@{size_col}{{0.2f}}"))
    if hue: tips.append((hue, f"@{hue}"))
    p.add_tools(HoverTool(tooltips=tips, renderers=[r], mode='mouse'))

    
    if hue:
        p.legend.location = legend_loc
        p.legend.click_policy = "hide"
        
        leg = p.legend[0]
        leg.padding = 2
        leg.spacing = 2
        leg.glyph_width = 10
        leg.label_standoff = 4
        leg.label_text_font_size = "8pt"
        leg.background_fill_alpha = 0.6
        leg.border_line_alpha = 0.0

    if show_plot:
        show(p)
    return p


def scatter_fig(df, *, x: str, y: str, size_col: str | None, hue: str | None):
    # usamos tu función y NO mostramos en el server
    p = scatter_bokeh(df, x=x, y=y, size_col=size_col, hue=hue, show_plot=False)
    return p

def scatter_html(df, **kwargs):
    p = scatter_fig(df, **kwargs)
    return file_html(p, CDN, title="Bokeh Scatter")

def scatter_components(df, **kwargs):
    p = scatter_fig(df, **kwargs)
    script, div = components(p)
    return {"script": script, "div": div}
