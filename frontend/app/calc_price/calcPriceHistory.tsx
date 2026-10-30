"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  DRAFT_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  HISTORY_UPDATED_EVENT,
  PRESET_LOAD_EVENT,
  type PriceHistoryEntry,
  type PresetLoadDetail,
} from "./calcPriceStorage";

type HistoryView = "recent" | "all";
type SortOption =
  | "recent"
  | "oldest"
  | "margin-desc"
  | "margin-asc"
  | "cost-desc"
  | "cost-asc"
  | "profit-desc"
  | "profit-asc";

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

function dateValue(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function percent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value)}%`;
}

function notifyHistoryChanged() {
  window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));
}

function sortEntries(entries: PriceHistoryEntry[], sort: SortOption) {
  const sorted = [...entries];

  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => dateValue(a.savedAt) - dateValue(b.savedAt));
    case "margin-desc":
      return sorted.sort((a, b) => b.calculation.actualMargin - a.calculation.actualMargin);
    case "margin-asc":
      return sorted.sort((a, b) => a.calculation.actualMargin - b.calculation.actualMargin);
    case "cost-desc":
      return sorted.sort((a, b) => b.calculation.totalCost - a.calculation.totalCost);
    case "cost-asc":
      return sorted.sort((a, b) => a.calculation.totalCost - b.calculation.totalCost);
    case "profit-desc":
      return sorted.sort((a, b) => b.calculation.profit - a.calculation.profit);
    case "profit-asc":
      return sorted.sort((a, b) => a.calculation.profit - b.calculation.profit);
    case "recent":
    default:
      return sorted.sort((a, b) => dateValue(b.savedAt) - dateValue(a.savedAt));
  }
}

export default function CalcPriceHistory({ view = "recent" }: { view?: HistoryView }) {
  const router = useRouter();
  const historySnapshot = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getServerHistorySnapshot,
  );
  const history = useMemo(() => parseHistory(historySnapshot), [historySnapshot]);
  const [searchName, setSearchName] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");

  // A prévia da calculadora sempre mostra os três registros mais recentes.
  // Na página completa, o mesmo componente oferece busca e ordenação.
  const recentHistory = useMemo(() => sortEntries(history, "recent"), [history]);
  const filteredHistory = useMemo(() => {
    const query = searchName.trim().toLocaleLowerCase("pt-BR");
    const matching = view === "all"
      ? recentHistory.filter((entry) => entry.name.toLocaleLowerCase("pt-BR").includes(query))
      : recentHistory;
    return sortEntries(matching, sort);
  }, [recentHistory, searchName, sort, view]);
  const visibleHistory = view === "recent" ? recentHistory.slice(0, 3) : filteredHistory;

  function loadPreset(entry: PriceHistoryEntry) {
    const detail: PresetLoadDetail = {
      name: entry.name,
      values: entry.values,
      isActionFigure: entry.isActionFigure,
    };

    // O rascunho também é gravado para que a página da calculadora possa
    // restaurar o preset quando o usuário o carrega pela página de histórico.
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          values: entry.values,
          isActionFigure: entry.isActionFigure,
          productName: entry.name,
        }),
      );
    } catch {
      // O evento ainda permite carregar os dados quando a calculadora já está montada.
    }

    if (view === "all") {
      router.push("/calc_price");
      return;
    }

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted">Seus cálculos salvos</p>
          <h2 className="mt-1 text-xl font-semibold">
            {view === "all" ? "Histórico completo de preços" : "Histórico de preços"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {view === "all"
              ? "Pesquise pelo nome e ordene os cálculos por data, margem de lucro, custo total ou lucro. Carregue um preset para restaurar todos os campos na calculadora."
              : "Seus três cálculos mais recentes. Carregue um preset para restaurar todos os campos e continuar editando."}
          </p>
        </div>
        <span className="self-start rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          {history.length} {history.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      {view === "all" && history.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.65fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-fg">Buscar por nome</span>
            <input
              type="search"
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
              placeholder="Ex.: Action Figure dragão"
              className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-fg">Ordenar por</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="recent">Mais recentes primeiro</option>
              <option value="oldest">Mais antigos primeiro</option>
              <option value="margin-desc">Maior margem de lucro</option>
              <option value="margin-asc">Menor margem de lucro</option>
              <option value="cost-desc">Maior custo total</option>
              <option value="cost-asc">Menor custo total</option>
              <option value="profit-desc">Maior lucro em reais</option>
              <option value="profit-asc">Menor lucro em reais</option>
            </select>
          </label>
        </div>
      )}

      {history.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <p className="text-sm font-medium">Nenhum cálculo salvo ainda</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Preencha o formulário e clique em “Calcular e salvar preço” para criar seu primeiro preset.
          </p>
          {view === "all" && (
            <Link
              href="/calc_price"
              className="mt-4 inline-flex rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-fg transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              Ir para a calculadora
            </Link>
          )}
        </div>
      ) : visibleHistory.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <p className="text-sm font-medium">Nenhum resultado encontrado</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Tente outro nome ou limpe a busca para ver todos os cálculos.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {visibleHistory.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 transition hover:border-white/20 sm:p-5"
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

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
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

          {view === "recent" && history.length > 3 && (
            <Link
              href="/calc_price/history"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-fg transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              Ver histórico completo ({history.length}) <span aria-hidden="true">→</span>
            </Link>
          )}

          {view === "all" && (
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Mostrando {visibleHistory.length} de {history.length} cálculos salvos.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/calc_price"
                  className="text-xs font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                >
                  Voltar para a calculadora
                </Link>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-muted underline decoration-white/20 underline-offset-4 transition hover:text-red-300"
                >
                  Limpar histórico
                </button>
              </div>
            </div>
          )}

          {view === "recent" && (
            <button
              type="button"
              onClick={clearHistory}
              className="mt-4 text-xs text-muted underline decoration-white/20 underline-offset-4 transition hover:text-fg"
            >
              Limpar histórico
            </button>
          )}
        </>
      )}
    </section>
  );
}
