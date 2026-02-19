import { createSignal, Show } from "solid-js";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const AGENTS = ["Air", "Oxygen"] as const;
const CATALYSTS = ["Al-Ni", "Marble dust", "None"] as const;
const SAMPLES = ["TWTS", "Leather scraps"] as const;

type Agent = (typeof AGENTS)[number];
type Catalyst = (typeof CATALYSTS)[number];
type Sample = (typeof SAMPLES)[number];

type Pred = {
  status: string;
  message: string;
  data: {
    CO_perc: number;
    CO2_perc: number;
    CH4_perc: number;
    O2_perc: number;
    H2_perc: number;
    calorific_value: number;
  };
};

type Payload = {
  time: number;
  t_in: number;
  t_pr: number;
  agent_type: Agent;
  q_agent: number;
  sample_type: Sample;
  catalyst_type: Catalyst;
  catalyst_rate: number;
};

export default function PredictKnn() {
  const [payload, setPayload] = createSignal<Payload>({
    time: 29,
    t_in: 500,
    t_pr: 1000,
    agent_type: "Oxygen",
    q_agent: 0.015,
    sample_type: "TWTS",
    catalyst_type: "Marble dust",
    catalyst_rate: 10,
  });
  const [res, setRes] = createSignal<Pred | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [err, setErr] = createSignal<string>("");

  function bindNum<K extends keyof Payload>(key: K) {
    return (v: string) => setPayload({ ...payload(), [key]: Number(v) } as Payload);
  }

  async function submit(e: Event) {
    e.preventDefault();
    setErr(""); setRes(null); setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/predict-knn`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload()),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setRes(await r.json());
    } catch (e: any) {
      setErr(e?.message ?? "Error en predicción");
    } finally {
      setLoading(false);
    }
  }

  const P = payload;

  return (
    <section class="space-y-4">
      <div class="card space-y-3">
        <h2 class="text-lg font-semibold text-cyan-300">Predicción KNN</h2>
        <form class="space-y-3" onSubmit={submit}>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">time</label>
              <input type="number" class="input" value={P().time}
                     onInput={(e) => bindNum("time")(e.currentTarget.value)} />
            </div>
            <div>
              <label class="label">t_in</label>
              <input type="number" class="input" value={P().t_in}
                     onInput={(e) => bindNum("t_in")(e.currentTarget.value)} />
            </div>
            <div>
              <label class="label">t_pr</label>
              <input type="number" class="input" value={P().t_pr}
                     onInput={(e) => bindNum("t_pr")(e.currentTarget.value)} />
            </div>
            <div>
              <label class="label">q_agent</label>
              <input step="0.0001" type="number" class="input" value={P().q_agent}
                     onInput={(e) => bindNum("q_agent")(e.currentTarget.value)} />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <div>
              <label class="label">agent_type</label>
              <select
                class="input"
                value={P().agent_type}
                onChange={(e) =>
                  setPayload({ ...P(), agent_type: e.currentTarget.value as Agent })
                }
              >
                {AGENTS.map(a => <option value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label class="label">sample_type</label>
              <select
                class="input"
                value={P().sample_type}
                onChange={(e) =>
                  setPayload({ ...P(), sample_type: e.currentTarget.value as Sample })
                }
              >
                {SAMPLES.map(s => <option value={s}>{s}</option>)}
              </select>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="label">catalyst_type</label>
                <select
                  class="input"
                  value={P().catalyst_type}
                  onChange={(e) => {
                    const v = e.currentTarget.value as Catalyst;
                    setPayload({
                      ...P(),
                      catalyst_type: v,
                      catalyst_rate: v === "None" ? 0 : P().catalyst_rate,
                    });
                  }}
                >
                  {CATALYSTS.map(c => <option value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label class="label">catalyst_rate</label>
                <input
                  type="number"
                  class="input"
                  value={P().catalyst_rate}
                  min="0"
                  step="1"
                  disabled={P().catalyst_type === "None"}
                  onInput={(e) => bindNum("catalyst_rate")(e.currentTarget.value)}
                />
              </div>
            </div>
          </div>

          <button class="btn btn-primary w-full" disabled={loading()}>
            {loading() ? "Calculando..." : "Predecir"}
          </button>
          <Show when={err()}>
            <p class="text-sm text-red-400">{err()}</p>
          </Show>
        </form>
      </div>

      <Show when={res()}>
        {(r) => (
          <div class="card space-y-3">
            <h3 class="text-cyan-300 font-semibold">Resultados</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <Metric label="H₂ %" value={r().data.H2_perc} />
              <Metric label="CO %" value={r().data.CO_perc} />
              <Metric label="CO₂ %" value={r().data.CO2_perc} />
              <Metric label="CH₄ %" value={r().data.CH4_perc} />
              <Metric label="O₂ %" value={r().data.O2_perc} />
              <Metric label="Valor Calorífico" value={r().data.calorific_value} />
            </div>
            <p class="text-xs text-neutral-400">{r().message}</p>
          </div>
        )}
      </Show>
    </section>
  );
}

function Metric(props: { label: string; value: number }) {
  return (
    <div class="rounded-xl border border-[#163042] p-3 bg-gradient-to-b from-[#0e1620] to-[#0b121a]">
      <div class="text-[11px] uppercase tracking-wide text-neutral-400">{props.label}</div>
      <div class="text-xl font-semibold text-cyan-200">
        {Number(props.value ?? 0).toFixed(3)}
      </div>
    </div>
  );
}
