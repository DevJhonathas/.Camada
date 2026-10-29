import Link from "next/link";
import Navbar from "../components/Navbar";
import CalcPriceForm from "./calcPriceForm";
import CalcPriceHistory from "./calcPriceHistory";

export const metadata = {
  title: "Calcular preço | Camada",
  description:
    "Calcule os custos e prepare a precificação das suas peças impressas em 3D.",
};

export default function CalcPricePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-fg">
      <header className="border-b border-border">
          <Navbar />
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="mb-10 rise">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Precificação
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Calcule o preço da sua impressão
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Informe os custos da sua produção, os materiais utilizados e as despesas de venda.
            Organize todos os dados necessários para definir um preço justo para suas peças.
          </p>
        </div>

        <CalcPriceForm historySlot={<CalcPriceHistory />} />
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-fg">
              camada<span className="text-primary">.</span>
            </span>{" "}
            — Impressão 3D com inteligência.
          </p>
          <p>Precificação para makers e empreendedores.</p>
        </div>
      </footer>
    </main>
  );
}
