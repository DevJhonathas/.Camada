"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import {
  DRAFT_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  HISTORY_UPDATED_EVENT,
  PRESET_LOAD_EVENT,
  type FormValues,
  type PriceHistoryEntry,
  type PresetLoadDetail,
} from "./calcPriceStorage";


const INITIAL_VALUES: FormValues = {
  horasImpressaoHoras: "6",
  horasImpressaoMinutos: "12",
  pesoPeca: "246",
  valorFilamento: "100",
  pesoRolo: "1000",
  desperdicioFilamento: "0",
  potenciaKW: "0.15",
  tarifaKW: "0.25",
  valorImpressora: "3999",
  vidaUtil: "24",
  horasUsoMensal: "160",
  custoManutencaoMensal: "0",
  custoPrimer: "0",
  custoVerniz: "0",
  custoLixas: "0",
  custoTintaAcrilica: "0",
  tempoModelagem: "0",
  tempoAcabamento: "0",
  valorHora: "250",
  taxaPlataforma: "0",
  impostos: "0",
  custoEmbalagem: "0",
  outrosCustos: "0",
  margemLucro: "30",
};

const INITIAL_PRODUCT_NAME = "Minha peça";

type SavedDraft = {
  values: FormValues;
  isActionFigure: boolean;
  productName: string;
  hasStoredData: boolean;
  error: boolean;
};

function subscribeToClient() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function readSavedDraft(): SavedDraft {
  try {
    const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) {
      return {
        values: { ...INITIAL_VALUES },
        isActionFigure: false,
        productName: INITIAL_PRODUCT_NAME,
        hasStoredData: false,
        error: false,
      };
    }

    const parsed = JSON.parse(stored) as {
      values?: Partial<Record<keyof FormValues, unknown>>;
      isActionFigure?: unknown;
      productName?: unknown;
    };
    const restored: FormValues = { ...INITIAL_VALUES };

    if (parsed.values && typeof parsed.values === "object") {
      (Object.keys(INITIAL_VALUES) as (keyof FormValues)[]).forEach((key) => {
        const savedValue = parsed.values?.[key];
        if (typeof savedValue === "string" || typeof savedValue === "number") {
          restored[key] = String(savedValue);
        }
      });
    }

    return {
      values: restored,
      isActionFigure:
        typeof parsed.isActionFigure === "boolean"
          ? parsed.isActionFigure
          : false,
      productName:
        typeof parsed.productName === "string" && parsed.productName.trim()
          ? parsed.productName
          : INITIAL_PRODUCT_NAME,
      hasStoredData: true,
      error: false,
    };
  } catch {
    return {
      values: { ...INITIAL_VALUES },
      isActionFigure: false,
      productName: INITIAL_PRODUCT_NAME,
      hasStoredData: false,
      error: true,
    };
  }
}

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nonNegative(value: string): number {
  return Math.max(0, numberValue(value));
}

function currency(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

type Calculation = {
  materialCost: number;
  energyCost: number;
  depreciationCost: number;
  maintenanceCost: number;
  finishingCost: number;
  laborCost: number;
  packagingCost: number;
  otherCost: number;
  productionCost: number;
  platformFee: number | null;
  taxCost: number | null;
  totalCost: number | null;
  suggestedPrice: number | null;
  profit: number | null;
  actualMargin: number | null;
  error: string | null;
  warning: string | null;
};

function calculatePrice(values: FormValues, isActionFigure: boolean): Calculation {
  const printHours =
    nonNegative(values.horasImpressaoHoras) +
    nonNegative(values.horasImpressaoMinutos) / 60;
  const pieceWeight = nonNegative(values.pesoPeca);
  const spoolWeight = nonNegative(values.pesoRolo);
  const filamentPrice = nonNegative(values.valorFilamento);
  const wastePercent = nonNegative(values.desperdicioFilamento);
  const powerKW = nonNegative(values.potenciaKW);
  const electricityRate = nonNegative(values.tarifaKW);
  const printerValue = nonNegative(values.valorImpressora);
  const lifetimeMonths = nonNegative(values.vidaUtil);
  const monthlyUsageHours = nonNegative(values.horasUsoMensal);
  const monthlyMaintenance = nonNegative(values.custoManutencaoMensal);

  const materialCost =
    spoolWeight > 0
      ? (pieceWeight / spoolWeight) * filamentPrice * (1 + wastePercent / 100)
      : 0;
  const energyCost = printHours * powerKW * electricityRate;

  let depreciationCost = 0;
  let maintenanceCost = 0;
  let warning: string | null = null;

  if (lifetimeMonths > 0 && monthlyUsageHours > 0) {
    depreciationCost =
      (printerValue / (lifetimeMonths * monthlyUsageHours)) * printHours;
    maintenanceCost = (monthlyMaintenance / monthlyUsageHours) * printHours;
  } else if (printerValue > 0 || monthlyMaintenance > 0) {
    warning =
      "Preencha uma vida útil em meses maior que zero e as horas de uso mensal para incluir a depreciação e a manutenção no custo.";
  }

  const finishingCost = isActionFigure
    ? nonNegative(values.custoPrimer) +
      nonNegative(values.custoVerniz) +
      nonNegative(values.custoLixas) +
      nonNegative(values.custoTintaAcrilica)
    : 0;

  const laborCost = isActionFigure
    ? (nonNegative(values.tempoModelagem) +
        nonNegative(values.tempoAcabamento)) *
      nonNegative(values.valorHora)
    : 0;

  const packagingCost = nonNegative(values.custoEmbalagem);
  const otherCost = nonNegative(values.outrosCustos);
  const productionCost =
    materialCost +
    energyCost +
    depreciationCost +
    maintenanceCost +
    finishingCost +
    laborCost +
    packagingCost +
    otherCost;

  if (spoolWeight <= 0) {
    return {
      materialCost,
      energyCost,
      depreciationCost,
      maintenanceCost,
      finishingCost,
      laborCost,
      packagingCost,
      otherCost,
      productionCost,
      platformFee: null,
      taxCost: null,
      totalCost: null,
      suggestedPrice: null,
      profit: null,
      actualMargin: null,
      error: "Informe um peso de rolo maior que zero para calcular o custo do filamento.",
      warning,
    };
  }

  const platformRate = nonNegative(values.taxaPlataforma);
  const taxRate = nonNegative(values.impostos);
  const targetMargin = nonNegative(values.margemLucro);
  const remainingShare = 1 - (platformRate + taxRate + targetMargin) / 100;

  if (remainingShare <= 0) {
    return {
      materialCost,
      energyCost,
      depreciationCost,
      maintenanceCost,
      finishingCost,
      laborCost,
      packagingCost,
      otherCost,
      productionCost,
      platformFee: null,
      taxCost: null,
      totalCost: null,
      suggestedPrice: null,
      profit: null,
      actualMargin: null,
      error:
        "A soma da taxa da plataforma, dos impostos e da margem desejada precisa ser inferior a 100%.",
      warning,
    };
  }


  const suggestedPrice = productionCost / remainingShare;
  const platformFee = suggestedPrice * (platformRate / 100);
  const taxCost = suggestedPrice * (taxRate / 100);
  const totalCost = productionCost + platformFee + taxCost;
  const profit = suggestedPrice - totalCost;
  const actualMargin = suggestedPrice > 0 ? (profit / suggestedPrice) * 100 : 0;

  return {
    materialCost,
    energyCost,
    depreciationCost,
    maintenanceCost,
    finishingCost,
    laborCost,
    packagingCost,
    otherCost,
    productionCost,
    platformFee,
    taxCost,
    totalCost,
    suggestedPrice,
    profit,
    actualMargin,
    error: null,
    warning,
  };
}

type FieldProps = {
  id: keyof FormValues;
  label: string;
  value: string;
  onValueChange: (id: keyof FormValues, value: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  step?: number | "any";
  min?: number;
  max?: number;
  help?: string;
  required?: boolean;
};

function Field({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  prefix,
  suffix,
  step = "any",
  min = 0,
  max,
  help,
  required = false,
}: FieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>

      <div className="relative mt-2">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted">
            {prefix}
          </span>
        )}

        <input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onValueChange(id, event.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          required={required}
          className={`w-full rounded-xl border border-border bg-bg py-3 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            prefix ? "pl-12" : "pl-4"
          } ${suffix ? "pr-14" : "pr-4"}`}
        />

        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>

      {help && <p className="mt-2 text-xs leading-5 text-muted">{help}</p>}
    </div>
  );
}

function SectionTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}

const inputCard = "rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8";

export default function CalcPriceForm({ historySlot }: { historySlot?: ReactNode }) {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
  const savedDraft = useMemo(
    () => (isClient ? readSavedDraft() : null),
    [isClient],
  );

  const [editedValues, setEditedValues] = useState<FormValues | null>(null);
  const [editedIsActionFigure, setEditedIsActionFigure] = useState<boolean | null>(null);
  const [editedProductName, setEditedProductName] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "error" | null>(null);

  const values = editedValues ?? savedDraft?.values ?? INITIAL_VALUES;
  const isActionFigure =
    editedIsActionFigure ?? savedDraft?.isActionFigure ?? false;
  const productName =
    editedProductName ?? savedDraft?.productName ?? INITIAL_PRODUCT_NAME;
  const visibleSaveStatus: "loading" | "ready" | "saved" | "error" = !isClient
    ? "loading"
    : saveStatus ??
      (savedDraft?.error
        ? "error"
        : savedDraft?.hasStoredData
          ? "saved"
          : "ready");

  const result = useMemo(
    () => calculatePrice(values, isActionFigure),
    [values, isActionFigure],
  );

  function persistValues(
    nextValues: FormValues,
    nextIsActionFigure: boolean,
    nextProductName: string,
  ) {
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          values: nextValues,
          isActionFigure: nextIsActionFigure,
          productName: nextProductName,
        }),
      );
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  function updateValue(id: keyof FormValues, value: string) {
    const nextValues = { ...values, [id]: value };
    setEditedValues(nextValues);
    setSubmitMessage(null);
    persistValues(nextValues, isActionFigure, productName);
  }

  function updateActionFigure(checked: boolean) {
    setEditedIsActionFigure(checked);
    setSubmitMessage(null);
    persistValues(values, checked, productName);
  }

  function updateProductName(nextName: string) {
    setEditedProductName(nextName);
    setSubmitMessage(null);
    persistValues(values, isActionFigure, nextName);
  }

  function saveCurrentPreset() {
    const safeName = productName.trim() || "Peça sem nome";
    const entry: PriceHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: safeName,
      savedAt: new Date().toISOString(),
      values: { ...values },
      isActionFigure,
      calculation: {
        suggestedPrice: result.suggestedPrice!,
        totalCost: result.totalCost!,
        profit: result.profit!,
        actualMargin: result.actualMargin ?? 0,
      },
    };

    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as PriceHistoryEntry[]) : [];
      const history = Array.isArray(parsed) ? parsed : [];
      window.localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify([entry, ...history].slice(0, 30)),
      );
      window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));
      setSubmitMessage(`“${safeName}” foi salvo no histórico.`);
      setSaveStatus("saved");
    } catch {
      setSubmitMessage("Não foi possível salvar o cálculo no histórico deste navegador.");
      setSaveStatus("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persistValues(values, isActionFigure, productName);

    if (result.error || result.suggestedPrice === null || result.totalCost === null || result.profit === null) {
      setSubmitMessage("Corrija os campos indicados antes de salvar este cálculo no histórico.");
      return;
    }

    saveCurrentPreset();
  }

  function resetValues() {
    const nextValues = { ...INITIAL_VALUES };
    setEditedValues(nextValues);
    setEditedIsActionFigure(false);
    setEditedProductName(INITIAL_PRODUCT_NAME);
    setSubmitMessage(null);
    persistValues(nextValues, false, INITIAL_PRODUCT_NAME);
  }

  useEffect(() => {
    function handleLoadPreset(event: Event) {
      const detail = (event as CustomEvent<PresetLoadDetail>).detail;
      if (!detail?.values) return;

      const nextValues = { ...INITIAL_VALUES, ...detail.values };
      const nextIsActionFigure = Boolean(detail.isActionFigure);
      const nextProductName = detail.name?.trim() || INITIAL_PRODUCT_NAME;

      setEditedValues(nextValues);
      setEditedIsActionFigure(nextIsActionFigure);
      setEditedProductName(nextProductName);
      setSubmitMessage(`Preset “${nextProductName}” carregado no formulário.`);

      try {
        window.localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            values: nextValues,
            isActionFigure: nextIsActionFigure,
            productName: nextProductName,
          }),
        );
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }

    window.addEventListener(PRESET_LOAD_EVENT, handleLoadPreset);
    return () => window.removeEventListener(PRESET_LOAD_EVENT, handleLoadPreset);
  }, []);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className={inputCard}>
          <label htmlFor="productName" className="block text-sm font-medium text-fg">
            Nome da peça / preset
          </label>
          <input
            id="productName"
            name="productName"
            type="text"
            value={productName}
            onChange={(event) => updateProductName(event.target.value)}
            maxLength={80}
            placeholder="Ex.: Action Figure dragão"
            className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-2 text-xs leading-5 text-muted">
            Esse nome aparece no resumo e identifica o cálculo quando você salvá-lo no histórico.
          </p>
        </section>

        <section className={inputCard}>
          <SectionTitle
            number="01"
            title="Dados da impressão"
            description="Informe o tempo de produção e a quantidade de material utilizado."
          />

          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-fg">Tempo de impressão</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <Field
                  id="horasImpressaoHoras"
                  label="Horas"
                  value={values.horasImpressaoHoras}
                  onValueChange={updateValue}
                  suffix="h"
                  step={1}
                />
                <Field
                  id="horasImpressaoMinutos"
                  label="Minutos"
                  value={values.horasImpressaoMinutos}
                  onValueChange={updateValue}
                  suffix="min"
                  step={1}
                  min={0}
                  max={59}
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                Informe horas e minutos separadamente. Ex.: 6 horas e 20 minutos.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="pesoPeca"
                label="Peso da peça"
                value={values.pesoPeca}
                onValueChange={updateValue}
                suffix="g"
                help="Peso total de filamento utilizado na peça."
              />
              <Field
                id="valorFilamento"
                label="Preço do rolo de filamento"
                value={values.valorFilamento}
                onValueChange={updateValue}
                prefix="R$"
                help="Preço pago pelo rolo inteiro."
              />
              <Field
                id="pesoRolo"
                label="Peso do rolo"
                value={values.pesoRolo}
                onValueChange={updateValue}
                suffix="g"
              />
              <Field
                id="desperdicioFilamento"
                label="Desperdício estimado"
                value={values.desperdicioFilamento}
                onValueChange={updateValue}
                suffix="%"
                help="Margem adicional para falhas e perdas de material."
              />
            </div>
          </div>
        </section>

        <section className={inputCard}>
          <SectionTitle
            number="02"
            title="Energia elétrica"
            description="Informe o consumo estimado da impressora e o preço da energia."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="potenciaKW"
              label="Potência média da impressora"
              value={values.potenciaKW}
              onValueChange={updateValue}
              suffix="kW"
              help="Use a potência média estimada durante a impressão."
            />
            <Field
              id="tarifaKW"
              label="Tarifa de energia"
              value={values.tarifaKW}
              onValueChange={updateValue}
              prefix="R$"
              suffix="/kWh"
            />
          </div>
        </section>

        <section className={inputCard}>
          <SectionTitle
            number="03"
            title="Impressora e depreciação"
            description="Registre o valor do equipamento e sua vida útil estimada."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="valorImpressora"
              label="Valor da impressora"
              value={values.valorImpressora}
              onValueChange={updateValue}
              prefix="R$"
            />
            <Field
              id="vidaUtil"
              label="Vida útil estimada"
              value={values.vidaUtil}
              onValueChange={updateValue}
              suffix="meses"
              step={1}
              help="Tempo estimado até a substituição do equipamento."
            />
            <Field
              id="horasUsoMensal"
              label="Uso da impressora por mês"
              value={values.horasUsoMensal}
              onValueChange={updateValue}
              suffix="h"
              help="Estimativa das horas de impressão por mês."
            />
            <Field
              id="custoManutencaoMensal"
              label="Manutenção mensal"
              value={values.custoManutencaoMensal}
              onValueChange={updateValue}
              prefix="R$"
              help="Reserva estimada para bicos, peças e reparos."
            />
          </div>
        </section>

        <section className={inputCard}>
          <SectionTitle
            number="04"
            title="Acabamento e mão de obra"
            description="Personalize os custos de acordo com o tipo de peça produzida."
          />

          <label
            htmlFor="isActionFigure"
            className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
              isActionFigure
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-bg hover:border-primary/30"
            }`}
          >
            <input
              id="isActionFigure"
              type="checkbox"
              checked={isActionFigure}
              onChange={(event) => updateActionFigure(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-primary"
            />
            <span>
              <span className="block font-semibold text-fg">
                Estou produzindo uma Action Figure
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted">
                Incluir os campos de pintura, acabamento, modelagem e mão de obra.
              </span>
            </span>
          </label>

          {isActionFigure && (
            <div className="rise mt-6 space-y-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                  Materiais de acabamento
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="custoPrimer" label="Custo do primer" value={values.custoPrimer} onValueChange={updateValue} prefix="R$" />
                  <Field id="custoVerniz" label="Custo do verniz" value={values.custoVerniz} onValueChange={updateValue} prefix="R$" />
                  <Field id="custoLixas" label="Custo das lixas" value={values.custoLixas} onValueChange={updateValue} prefix="R$" />
                  <Field id="custoTintaAcrilica" label="Custo da tinta acrílica" value={values.custoTintaAcrilica} onValueChange={updateValue} prefix="R$" />
                </div>
                <p className="mt-3 text-xs leading-5 text-muted">
                  Informe o custo proporcional utilizado em uma peça, não necessariamente o preço do frasco inteiro.
                </p>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                  Tempo de trabalho
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="tempoModelagem" label="Tempo de modelagem" value={values.tempoModelagem} onValueChange={updateValue} suffix="h" help="Tempo de preparação ou criação do modelo." />
                  <Field id="tempoAcabamento" label="Tempo de acabamento" value={values.tempoAcabamento} onValueChange={updateValue} suffix="h" help="Tempo gasto na pintura e finalização." />
                  <div className="sm:col-span-2">
                    <Field id="valorHora" label="Valor da hora de trabalho" value={values.valorHora} onValueChange={updateValue} prefix="R$" suffix="/h" help="Valor atribuído a cada hora de trabalho manual." />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted">
                  O tempo de modelagem está sendo atribuído integralmente a esta peça. Se o mesmo modelo render várias unidades, depois podemos dividir esse custo pela quantidade produzida.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className={inputCard}>
          <SectionTitle
            number="05"
            title="Venda e outras despesas"
            description="Adicione os custos que podem afetar o preço final do produto."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="taxaPlataforma"
              label="Taxas da plataforma"
              value={values.taxaPlataforma}
              onValueChange={updateValue}
              suffix="%"
              help="Percentual cobrado sobre o preço de venda."
            />
            <Field
              id="impostos"
              label="Impostos"
              value={values.impostos}
              onValueChange={updateValue}
              suffix="%"
              help="Informe o percentual aplicável ao seu caso."
            />
            <Field
              id="custoEmbalagem"
              label="Custo da embalagem"
              value={values.custoEmbalagem}
              onValueChange={updateValue}
              prefix="R$"
              help="Caixa, proteção e materiais por peça."
            />
            <Field
              id="outrosCustos"
              label="Outros custos por peça"
              value={values.outrosCustos}
              onValueChange={updateValue}
              prefix="R$"
              help="Despesas variáveis que ainda não foram incluídas."
            />
            <div className="sm:col-span-2">
              <Field
                id="margemLucro"
                label="Margem de lucro desejada"
                value={values.margemLucro}
                onValueChange={updateValue}
                suffix="%"
                help="Margem desejada sobre o preço de venda, após os custos, taxas e impostos informados."
              />
            </div>
          </div>
        </section>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-fg transition hover:brightness-110"
          >
            Calcular e salvar preço <span aria-hidden="true">→</span>
          </button>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <div className="min-w-0" aria-live="polite">
              <p>
                {visibleSaveStatus === "loading" && "Carregando dados salvos…"}
              {visibleSaveStatus === "ready" && "As alterações serão salvas automaticamente neste navegador"}
              {visibleSaveStatus === "saved" && "✓ Dados salvos automaticamente neste navegador"}
                {visibleSaveStatus === "error" && "Não foi possível salvar no navegador. Verifique as permissões de armazenamento."}
              </p>
              {submitMessage && <p className="mt-1 text-xs text-primary">{submitMessage}</p>}
            </div>
            <button
              type="button"
              onClick={resetValues}
              className="underline decoration-border underline-offset-4 transition hover:text-fg"
            >
              Restaurar valores iniciais
            </button>
          </div>
        </div>
      </form>

      <aside className="lg:sticky lg:top-6">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Visão geral</p>
              <h2 className="mt-1 text-xl font-semibold">{productName.trim() || "Resumo da sua peça"}</h2>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-2xl">🖨️</div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
            <p className="text-sm text-muted">Preço de venda sugerido</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-primary">
              {currency(result.suggestedPrice)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Calculado com base nos custos preenchidos e na margem desejada.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-2 p-4 sm:p-5">
              <p className="text-sm text-muted">Custo total</p>
              <p className="mt-3 text-xl font-bold sm:text-2xl">
                {currency(result.totalCost)}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-4 sm:p-5">
              <p className="text-sm text-emerald-400">Lucro estimado</p>
              <p className="mt-3 text-xl font-bold text-emerald-400 sm:text-2xl">
                {currency(result.profit)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-5 text-sm">
            <span className="text-muted">Margem sobre a venda</span>
            <span className="font-semibold text-emerald-400">
              {percent(result.actualMargin)}
            </span>
          </div>

          {result.error && (
            <div role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm leading-6 text-red-300">
              {result.error}
            </div>
          )}

          {result.warning && (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200">
              {result.warning}
            </div>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="text-sm font-semibold">Composição do custo</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Filamento</dt>
                <dd className="font-medium tabular-nums">{currency(result.materialCost)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Energia elétrica</dt>
                <dd className="font-medium tabular-nums">{currency(result.energyCost)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Depreciação</dt>
                <dd className="font-medium tabular-nums">{currency(result.depreciationCost)}</dd>
              </div>
              {result.maintenanceCost > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Manutenção</dt>
                  <dd className="font-medium tabular-nums">{currency(result.maintenanceCost)}</dd>
                </div>
              )}
              {isActionFigure && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Materiais de acabamento</dt>
                    <dd className="font-medium tabular-nums">{currency(result.finishingCost)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Mão de obra</dt>
                    <dd className="font-medium tabular-nums">{currency(result.laborCost)}</dd>
                  </div>
                </>
              )}
              {result.packagingCost > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Embalagem</dt>
                  <dd className="font-medium tabular-nums">{currency(result.packagingCost)}</dd>
                </div>
              )}
              {result.otherCost > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Outros custos</dt>
                  <dd className="font-medium tabular-nums">{currency(result.otherCost)}</dd>
                </div>
              )}
              {result.platformFee !== null && result.platformFee > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Taxa da plataforma</dt>
                  <dd className="font-medium tabular-nums">{currency(result.platformFee)}</dd>
                </div>
              )}
              {result.taxCost !== null && result.taxCost > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Impostos</dt>
                  <dd className="font-medium tabular-nums">{currency(result.taxCost)}</dd>
                </div>
              )}
            </dl>
          </div>

          <p className="mt-5 text-xs leading-5 text-muted">
            O custo total inclui os custos de produção, as taxas da plataforma e os impostos calculados sobre o preço sugerido. O lucro é o que resta após essas despesas.
          </p>
        </div>

        {historySlot && <div className="mt-4">{historySlot}</div>}

        <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
          <h3 className="font-semibold">Como o preço é calculado</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            O preço sugerido considera a margem desejada sobre o próprio preço de venda, descontando as taxas e os impostos percentuais informados. Isso é diferente de simplesmente adicionar uma porcentagem ao custo.
          </p>
        </div>
      </aside>
    </div>
  );
}
