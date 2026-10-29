"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  HISTORY_STORAGE_KEY,
  HISTORY_UPDATED_EVENT,
  PRESET_LOAD_EVENT,
  type PriceHistoryEntry,
  type PresetLoadDetail,
} from "./calcPriceStorage";

function subscribeToHistory(onStoreChange: () => void) {
  window.addEventListener(HISTORY_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(HISTORY_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getHistorySnapshot() {
  try {
    return window.localStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerHistorySnapshot() {
  return "[]";
}

function parseHistory(raw: string): PriceHistoryEntry[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is PriceHistoryEntry => {
      return Boolean(
        item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.savedAt === "string" &&
          item.values &&
          typeof item.values === "object" &&
          typeof item.isActionFigure === "boolean" &&
          item.calculation &&
          typeof item.calculation.suggestedPrice === "number" &&
          typeof item.calculation.totalCost === "number" &&
          typeof item.calculation.profit === "number" &&
          typeof item.calculation.actualMargin === "number",
      );
    });
  } catch {
    return [];
  }
}

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data desconhecida";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function percent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value)}%`;
}

function notifyHistoryChanged() {
  window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));
}

export default function CalcPriceHistory() {
  const historySnapshot = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getServerHistorySnapshot,
  );
  const history = useMemo(() => parseHistory(historySnapshot), [historySnapshot]);

  function loadPreset(entry: PriceHistoryEntry) {
    const detail: PresetLoadDetail = {
      name: entry.name,
      values: entry.values,
      isActionFigure: entry.isActionFigure,
    };

    window.dispatchEvent(
      new CustomEvent<PresetLoadDetail>(PRESET_LOAD_EVENT, { detail }),
    );
  }

  function renamePreset(id: string, name: string) {
    try {
      const nextHistory = history.map((entry) =>
        entry.id === id ? { ...entry, name } : entry,
      );
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
      notifyHistoryChanged();
    } catch {
      // Se o navegador bloquear o armazenamento, o histórico anterior é preservado.
    }
  }

  function deletePreset(id: string) {
    try {
      const nextHistory = history.filter((entry) => entry.id !== id);
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
      notifyHistoryChanged();
    } catch {
      // Se o navegador bloquear o armazenamento, o histórico anterior é preservado.
    }
  }

  function clearHistory() {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, "[]");
      notifyHistoryChanged();
    } catch {
      // Se o navegador bloquear o armazenamento, o histórico anterior é preservado.
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Seus cálculos salvos</p>
          <h3 className="mt-1 text-xl font-semibold">Histórico de preços</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Salve um cálculo pelo botão do formulário. Carregue um item para restaurar todos os campos e continuar editando.
          </p>
        </div>
        <span className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          {history.length}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <p className="text-sm font-medium">Nenhum cálculo salvo ainda</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Preencha o formulário e clique em “Calcular e salvar preço” para criar seu primeiro preset.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {history.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 transition hover:border-white/20"
              >
                <div className="flex items-start gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Nome do preset</span>
                    <input
                      type="text"
                      value={entry.name}
                      maxLength={80}
                      aria-label={`Nome do preset ${entry.name || "sem nome"}`}
                      onChange={(event) => renamePreset(entry.id, event.target.value)}
                      className="w-full min-w-0 rounded-lg border border-transparent bg-transparent px-2 py-1 font-semibold text-fg outline-none transition placeholder:text-muted focus:border-primary/50 focus:bg-zinc-900"
                      placeholder="Nome deste cálculo"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => deletePreset(entry.id)}
                    aria-label={`Excluir preset ${entry.name || "sem nome"}`}
                    title="Excluir do histórico"
                    className="rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-red-400/10 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>

                <p className="mt-1 px-2 text-xs text-muted">
                  {formatDate(entry.savedAt)}
                  {entry.isActionFigure ? " · Action Figure" : " · Peça comum"}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-zinc-900 p-3">
                    <p className="text-[11px] leading-4 text-muted">Preço sugerido</p>
                    <p className="mt-1 text-sm font-semibold text-primary tabular-nums">
                      {currency(entry.calculation.suggestedPrice)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-900 p-3">
                    <p className="text-[11px] leading-4 text-muted">Custo total</p>
                    <p className="mt-1 text-sm font-semibold text-fg tabular-nums">
                      {currency(entry.calculation.totalCost)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-3">
                    <p className="text-[11px] leading-4 text-emerald-400">Lucro</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-400 tabular-nums">
                      {currency(entry.calculation.profit)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 px-1 text-xs text-muted">
                  Margem sobre a venda: <span className="font-semibold text-emerald-400">{percent(entry.calculation.actualMargin)}</span>
                </p>

                <button
                  type="button"
                  onClick={() => loadPreset(entry)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-fg transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                >
                  Carregar este preset <span aria-hidden="true">↗</span>
                </button>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={clearHistory}
            className="mt-4 text-xs text-muted underline decoration-white/20 underline-offset-4 transition hover:text-fg"
          >
            Limpar histórico
          </button>
        </>
      )}
    </section>
  );
}
