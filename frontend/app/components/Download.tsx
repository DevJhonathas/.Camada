
"use client";

import { useState } from "react";
import type { PriceHistoryEntry, FormValues } from "../calc_price/calcPriceStorage";
import { FileDown, FileSpreadsheet } from "lucide-react";

type DownloadsProps = {
  entries: PriceHistoryEntry[];
  variant?: "inline" | "toolbar";
};

type ParameterField = {
  key: keyof FormValues;
  label: string;
  unit?: string;
  format?: "currency" | "percent" | "number";
  actionFigure?: boolean;
};

const parameterFields: ParameterField[] = [
  { key: "horasImpressaoHoras", label: "Horas de impressão", unit: "h" },
  { key: "horasImpressaoMinutos", label: "Minutos de impressão", unit: "min" },
  { key: "pesoPeca", label: "Peso da peça", unit: "g" },
  { key: "valorFilamento", label: "Preço do rolo de filamento", format: "currency" },
  { key: "pesoRolo", label: "Peso do rolo", unit: "g" },
  { key: "desperdicioFilamento", label: "Desperdício estimado", unit: "%", format: "percent" },
  { key: "potenciaKW", label: "Potência média", unit: "kW" },
  { key: "tarifaKW", label: "Tarifa de energia", format: "currency" },
  { key: "valorImpressora", label: "Valor da impressora", format: "currency" },
  { key: "vidaUtil", label: "Vida útil", unit: "meses" },
  { key: "horasUsoMensal", label: "Uso mensal", unit: "h" },
  { key: "custoManutencaoMensal", label: "Manutenção mensal", format: "currency" },
  { key: "custoPrimer", label: "Custo do primer", format: "currency", actionFigure: true },
  { key: "custoVerniz", label: "Custo do verniz", format: "currency", actionFigure: true },
  { key: "custoLixas", label: "Custo das lixas", format: "currency", actionFigure: true },
  { key: "custoTintaAcrilica", label: "Custo da tinta acrílica", format: "currency", actionFigure: true },
  { key: "tempoModelagem", label: "Tempo de modelagem", unit: "h", actionFigure: true },
  { key: "tempoAcabamento", label: "Tempo de acabamento", unit: "h", actionFigure: true },
  { key: "valorHora", label: "Valor da hora de trabalho", format: "currency", actionFigure: true },
  { key: "taxaPlataforma", label: "Taxa da plataforma", unit: "%", format: "percent" },
  { key: "impostos", label: "Impostos", unit: "%", format: "percent" },
  { key: "custoEmbalagem", label: "Custo da embalagem", format: "currency" },
  { key: "outrosCustos", label: "Outros custos", format: "currency" },
  { key: "margemLucro", label: "Margem desejada", unit: "%", format: "percent" },
];

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const decimal = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value);

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data desconhecida";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatInput(
  value: string,
  field: ParameterField,
) {
  if (value.trim() === "") return "—";

  const number = Number(value);

  if (!Number.isFinite(number)) return value;

  if (field.format === "currency") return currency(number);

  return `${decimal(number)}${field.unit ? ` ${field.unit}` : ""}`;
}

function numericValue(value: string): number | string {
  if (value.trim() === "") return "";

  const number = Number(value);

  return Number.isFinite(number) ? number : value;
}

function fileSlug(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "peca"
  );
}

function dateStamp() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getFileName(entries: PriceHistoryEntry[], extension: string) {
  const name =
    entries.length === 1
      ? `camada-${fileSlug(entries[0].name)}`
      : "camada-historico";

  return `${name}-${dateStamp()}.${extension}`;
}

function getParameterRows(entry: PriceHistoryEntry): string[][] {
  return parameterFields
    .filter((field) => !field.actionFigure || entry.isActionFigure)
    .map((field) => [
      field.label,
      formatInput(entry.values[field.key], field),
    ]);
}

async function generatePDF(entries: PriceHistoryEntry[]) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(35, 35, 35);
  doc.text("camada", 14, 19);

  doc.setTextColor(249, 115, 22);
  doc.text(".", 36, 19);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.text("Relatório do histórico de preços", 14, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(
    `${entries.length} ${entries.length === 1 ? "registro exportado" : "registros exportados"} · Gerado em ${formatDate(new Date().toISOString())}`,
    14,
    37,
  );

  const summaryRows = entries.map((entry) => [
    entry.name,
    formatDate(entry.savedAt),
    entry.isActionFigure ? "Action Figure" : "Peça comum",
    currency(entry.calculation.suggestedPrice),
    currency(entry.calculation.totalCost),
    currency(entry.calculation.profit),
    `${decimal(entry.calculation.actualMargin)}%`,
  ]);

  autoTable(doc, {
    startY: 44,
    head: [[
      "Produto",
      "Data",
      "Tipo",
      "Preço sugerido",
      "Custo total",
      "Lucro",
      "Margem",
    ]],
    body: summaryRows,
    theme: "grid",
    margin: { left: 14, right: 14 },
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 3,
      overflow: "linebreak",
      textColor: [45, 45, 45],
      lineColor: [225, 225, 225],
    },
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [247, 247, 247],
    },
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 35 },
      2: { cellWidth: 27 },
      3: { cellWidth: 39 },
      4: { cellWidth: 39 },
      5: { cellWidth: 38 },
      6: { cellWidth: 25 },
    },
  });

  for (const entry of entries) {
    doc.addPage("a4", "portrait");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(249, 115, 22);
    doc.text("camada. | DETALHAMENTO DO CÁLCULO", 14, 11);

    doc.setFontSize(15);
    doc.setTextColor(35, 35, 35);
    doc.text(
      doc.splitTextToSize(entry.name, 180),
      14,
      21,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(
      `${formatDate(entry.savedAt)} · ${entry.isActionFigure ? "Action Figure" : "Peça comum"}`,
      14,
      31,
    );

    autoTable(doc, {
      startY: 39,
      head: [["Resultado", "Valor"]],
      body: [
        ["Preço de venda sugerido", currency(entry.calculation.suggestedPrice)],
        ["Custo total", currency(entry.calculation.totalCost)],
        ["Lucro estimado", currency(entry.calculation.profit)],
        ["Margem sobre a venda", `${decimal(entry.calculation.actualMargin)}%`],
      ],
      theme: "grid",
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [45, 45, 45],
      },
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 90 },
      },
    });

    autoTable(doc, {
      startY: 91,
      head: [["Parâmetro utilizado", "Valor"]],
      body: getParameterRows(entry),
      theme: "grid",
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [45, 45, 45],
      },
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 90 },
      },
      alternateRowStyles: {
        fillColor: [247, 247, 247],
      },
    });
  }

  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);

    doc.text("camada. | Relatório de precificação", 14, pageHeight - 8);
    doc.text(
      `${page} / ${totalPages}`,
      pageWidth - 14,
      pageHeight - 8,
      { align: "right" },
    );
  }

  doc.save(getFileName(entries, "pdf"));
}

async function generateExcel(entries: PriceHistoryEntry[]) {
  const XLSX = await import("xlsx");

  const summaryHeaders = [
    "Produto",
    "Data",
    "Tipo",
    "Preço sugerido",
    "Custo total",
    "Lucro estimado",
    "Margem sobre a venda (%)",
  ];

  const summaryRows = entries.map((entry) => [
    entry.name,
    formatDate(entry.savedAt),
    entry.isActionFigure ? "Action Figure" : "Peça comum",
    entry.calculation.suggestedPrice,
    entry.calculation.totalCost,
    entry.calculation.profit,
    entry.calculation.actualMargin,
  ]);

  const summarySheet = XLSX.utils.aoa_to_sheet([
    summaryHeaders,
    ...summaryRows,
  ]);

  summarySheet["!cols"] = [
    { wch: 30 },
    { wch: 21 },
    { wch: 18 },
    { wch: 19 },
    { wch: 16 },
    { wch: 19 },
    { wch: 25 },
  ];

  summarySheet["!autofilter"] = {
    ref: summarySheet["!ref"] ?? "A1",
  };

  for (let row = 1; row <= summaryRows.length; row++) {
    for (const column of [3, 4, 5]) {
      const cell = summarySheet[
        XLSX.utils.encode_cell({ r: row, c: column })
      ];

      if (cell) cell.z = '"R$" #,##0.00';
    }

    const marginCell = summarySheet[
      XLSX.utils.encode_cell({ r: row, c: 6 })
    ];

    if (marginCell) marginCell.z = '0.00"%"';
  }

  const parameterHeaders = [
    "Produto",
    "Data",
    "Tipo",
    ...parameterFields.map((field) => field.label),
  ];

  const parameterRows = entries.map((entry) => [
    entry.name,
    formatDate(entry.savedAt),
    entry.isActionFigure ? "Action Figure" : "Peça comum",
    ...parameterFields.map((field) =>
      field.actionFigure && !entry.isActionFigure
        ? ""
        : numericValue(entry.values[field.key]),
    ),
  ]);

  const parameterSheet = XLSX.utils.aoa_to_sheet([
    parameterHeaders,
    ...parameterRows,
  ]);

  parameterSheet["!cols"] = [
    { wch: 30 },
    { wch: 21 },
    { wch: 18 },
    ...parameterFields.map(() => ({ wch: 21 })),
  ];

  parameterSheet["!autofilter"] = {
    ref: parameterSheet["!ref"] ?? "A1",
  };

  parameterFields.forEach((field, index) => {
    if (field.format !== "currency" && field.format !== "percent") return;

    for (let row = 1; row <= parameterRows.length; row++) {
      const cell = parameterSheet[
        XLSX.utils.encode_cell({ r: row, c: index + 3 })
      ];

      if (cell) {
        cell.z =
          field.format === "currency"
            ? '"R$" #,##0.00'
            : '0.00"%"';
      }
    }
  });

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");
  XLSX.utils.book_append_sheet(workbook, parameterSheet, "Parâmetros");

  XLSX.writeFileXLSX(workbook, getFileName(entries, "xlsx"), {
    compression: true,
  });
}

export default function Downloads({
  entries,
  variant = "inline",
}: DownloadsProps) {
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (entries.length === 0) return null;

  async function handleDownload(type: "pdf" | "excel") {
    if (loading) return;

    setLoading(type);
    setError(null);

    try {
      if (type === "pdf") {
        await generatePDF(entries);
      } else {
        await generateExcel(entries);
      }
    } catch {
      setError("Não foi possível gerar o arquivo. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  const isToolbar = variant === "toolbar";

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-fg transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:cursor-wait disabled:opacity-50";

  return (
    <div
      className={
        isToolbar
          ? "flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
          : "flex flex-wrap items-center gap-2"
      }
    >
      {isToolbar && (
        <div>
          <p className="text-sm font-semibold text-fg">
            Exportar histórico completo
          </p>
          <p className="mt-1 text-xs text-muted">
            Baixe todos os {entries.length}{" "}
            {entries.length === 1 ? "registro salvo" : "registros salvos"}.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleDownload("pdf")}
          disabled={loading !== null}
          aria-label="Baixar em PDF"
          className={buttonClass}
        >
          {loading === "pdf" ? (
            "Gerando PDF..."
          ) : (
            <>
              <FileDown size={16} strokeWidth={1.8} />
              PDF
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleDownload("excel")}
          disabled={loading !== null}
          aria-label="Baixar em Excel"
          className={buttonClass}
        >
          {loading === "excel" ? (
            "Gerando Excel..."
          ) : (
            <>
              <FileSpreadsheet size={16} strokeWidth={1.8} />
              Excel
            </>
          )}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="text-xs text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}
