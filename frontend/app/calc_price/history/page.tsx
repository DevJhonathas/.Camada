import Link from "next/link";
import Navbar from "../../components/Navbar";
import CalcPriceHistory from "../calcPriceHistory";

export const metadata = {
  title: "Histórico de preços | Camada",
  description:
    "Consulte, pesquise e compare os cálculos de precificação das suas peças impressas em 3D.",
};

export default function CalcPriceHistoryPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            camada<span className="text-primary">.</span>
          </Link>
          <Navbar />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Seus registros
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Histórico de preços
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Consulte seus cálculos salvos, encontre uma peça pelo nome e compare margem de lucro, custo total e lucro estimado.
          </p>
        </div>

        <CalcPriceHistory view="all" />
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
