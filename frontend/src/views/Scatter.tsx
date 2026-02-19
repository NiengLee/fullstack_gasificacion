import { createSignal, Show } from "solid-js";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

type DType = "float" | "int" | "string";
const COLUMNS: { name: string; dtype: DType }[] = [
    { name: "Time", dtype: "float" },                 
    { name: "Temperature", dtype: "int" },            
    { name: "ProcessTemperature", dtype: "int" },     
    { name: "AgentType", dtype: "string" },           
    { name: "AgentFlow", dtype: "float" },            
    { name: "SampleType", dtype: "string" },          
    { name: "CatalystType", dtype: "string" },        
    { name: "CatalystRatio", dtype: "float" },        
    { name: "CarbonMonoxide", dtype: "float" },       
    { name: "CarbonDioxide", dtype: "float" },        
    { name: "Methane", dtype: "float" },              
    { name: "Oxygen", dtype: "float" },               
    { name: "Hydrogen", dtype: "float" },             
    { name: "CalorificValue", dtype: "float" },       
];

const NUMERIC_COLS = COLUMNS.filter(c => c.dtype !== "string").map(c => c.name);
const STRING_COLS  = COLUMNS.filter(c => c.dtype === "string").map(c => c.name);

export default function Scatter() {
    const [x, setX] = createSignal("");
    const [y, setY] = createSignal("");
    const [sizeCol, setSizeCol] = createSignal("");
    const [hue, setHue] = createSignal("");
    const [html, setHtml] = createSignal<string>("");
    const [loading, setLoading] = createSignal(false);
    const [err, setErr] = createSignal<string>("");

    async function fetchHtml(e: Event) {
    e.preventDefault();
    setErr("");
    if (!x() || !y()) {
        setErr("Campos obligatorios: x, y.");
        return;
    }
    setLoading(true);
    try {
        const params = new URLSearchParams();
        params.set("x", x());
        params.set("y", y());
        if (sizeCol()) params.set("size_col", sizeCol());
        if (hue()) params.set("hue", hue());

        const res = await fetch(`${API_BASE}/api/v1/viz/scatter/html?${params}`, {
        headers: { Accept: "text/html" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setHtml(await res.text());
    } catch (e: any) {
        setErr(e?.message ?? "Error al cargar HTML");
        setHtml("");
    } finally {
        setLoading(false);
    }
    }

    return (
    <section class="space-y-4">
        <div class="card space-y-3">
        <h2 class="text-lg font-semibold text-cyan-300">Scatter (Bokeh)</h2>
        <form class="space-y-3" onSubmit={fetchHtml}>
            <div>
            <label class="label">Columna X *</label>
            <select class="input" value={x()} onChange={e => setX(e.currentTarget.value)}>
                <option value="">Selecciona…</option>
                {NUMERIC_COLS.map(n => (
                <option value={n}>{n}</option>
                ))}
            </select>
            </div>

            <div>
            <label class="label">Columna Y *</label>
            <select class="input" value={y()} onChange={e => setY(e.currentTarget.value)}>
                <option value="">Selecciona…</option>
                {NUMERIC_COLS.map(n => (
                <option value={n}>{n}</option>
                ))}
            </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="label">size_col (opcional)</label>
                <select class="input" value={sizeCol()} onChange={e => setSizeCol(e.currentTarget.value)}>
                <option value="">— Ninguna —</option>
                {NUMERIC_COLS.map(n => (
                    <option value={n}>{n}</option>
                ))}
                </select>
            </div>

            <div>
                <label class="label">hue (opcional)</label>
                <select class="input" value={hue()} onChange={e => setHue(e.currentTarget.value)}>
                <option value="">— Ninguna —</option>
                {STRING_COLS.map(s => (
                    <option value={s}>{s}</option>
                ))}
                </select>
            </div>
            </div>

            <button class="btn btn-primary w-full" disabled={loading()}>
            {loading() ? "Cargando..." : "Renderizar"}
            </button>

            <Show when={err()}>
            <p class="text-sm text-red-400">{err()}</p>
            </Show>
        </form>
        </div>

        <Show when={html()}>
        <div class="card p-2">
            <iframe
            class="w-full rounded-xl border border-[#163042] min-h-[70vh]"
            srcDoc={html()}
            sandbox="allow-scripts allow-same-origin"
            />
        </div>
        </Show>
    </section>
    );
}
