import { createSignal, Show } from "solid-js";
import Scatter from "./views/Scatter";
import PredictKnn from "./views/PredictKnn";
// arriba del archivo
import unalLogo from "./assets/logounalmed.svg";


export default function App() {
  const [tab, setTab] = createSignal<"scatter" | "knn">("scatter");

  return (
    <div class="min-h-dvh max-w-screen-sm mx-auto">
      <header class="nav">
        <div class="max-w-screen-sm mx-auto flex">
          <button
            class={`tab ${tab() === "scatter" ? "tab-active" : ""}`}
            onClick={() => setTab("scatter")}
          >
            Scatter (Bokeh)
          </button>
          <button
            class={`tab ${tab() === "knn" ? "tab-active" : ""}`}
            onClick={() => setTab("knn")}
          >
            Predicción KNN
          </button>
        </div>
      </header>

      <main class="p-4 space-y-4">
        <Show when={tab() === "scatter"}>
          <Scatter />
        </Show>
        <Show when={tab() === "knn"}>
          <PredictKnn />
        </Show>
      </main>

      <footer class="px-4 py-6 text-xs text-neutral-400">
        <div class="flex flex-col items-center text-center gap-3">
          <span>Universidad Nacional de Colombia · Gasification Demo DataScience/MachineLearning</span>
          <a
            href="https://www.linkedin.com/in/ncyl91/"
            target="_blank"
            rel="noopener noreferrer"
            class="
              group inline-flex items-center gap-2 rounded-full my-4 px-6 py-3 text-sm font-semibold
              text-black bg-[#39FF14] ring-2 ring-[#39FF14]/60
              shadow-[0_0_14px_#39FF14,0_0_28px_#39FF14]
              transform-gpu origin-center transition-transform duration-300
              motion-safe:animate-[periodic-vibrate-wide_3.5s_linear_infinite]
              hover:scale-[1.5]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40
            "
          >
            <svg aria-hidden viewBox="0 0 24 24" class="h-5 w-5 opacity-80">
              <path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.08 1 2.48 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.7-2.54 3.47V23h-4V8z"/>
            </svg>
            <span>By NiengLee</span>
          </a>

          <div class="h-28 w-28 rounded-full overflow-hidden bg-[#0b121a] ring-1 ring-cyan-500/40 shadow-lg">
            <a href="https://minas.medellin.unal.edu.co/maestria-quimica" target="_blank" rel="noopener noreferrer">
            <img
              src={unalLogo}
              alt="Universidad Nacional de Colombia"
              class="h-full w-full object-contain p-3 bg-amber-50"
              loading="lazy"
            />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

