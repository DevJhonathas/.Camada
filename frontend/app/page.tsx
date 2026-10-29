import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Navegação */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-bold tracking-tight">
            camada<span className="text-orange-500">.</span>
          </a>

          <nav className="hidden items-center gap-4 text-sm text-zinc-400 sm:flex">
            <Navbar />
            <a href="#recursos" className="transition hover:text-white">
              Recursos
            </a>
            <a href="#sobre" className="transition hover:text-white">
              Sobre
            </a>
          </nav>

          <a
            href="#calculadora"
            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Começar agora
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Feito para quem trabalha com impressão 3D
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Sua impressão 3D merece
              <span className="text-orange-500"> lucro de verdade.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
              Calcule o preço ideal das suas peças, descubra seus custos e
              saiba quanto você realmente ganha em cada venda.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#calculadora"
                className="rounded-xl bg-orange-500 px-7 py-4 text-center font-semibold text-white transition hover:bg-orange-400"
              >
                Calcular meu preço →
              </a>

              <a
                href="#recursos"
                className="rounded-xl border border-white/10 px-7 py-4 text-center font-semibold text-zinc-300 transition hover:bg-white/5"
              >
                Conhecer recursos
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
              <span>✓ Controle de custos</span>
              <span>✓ Cálculo de lucro</span>
              <span>✓ Fácil de usar</span>
            </div>
          </div>

          {/* Prévia do painel */}
          <div
            id="calculadora"
            className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Visão geral</p>
                <h2 className="mt-1 text-xl font-semibold">
                  Resumo da sua peça
                </h2>
              </div>
              <div className="rounded-xl bg-orange-500/10 p-3 text-2xl">
                🖨️
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/5 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Preço de venda sugerido</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-orange-400">
                R$ 85,00
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Exemplo ilustrativo de uma peça impressa em 3D
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-zinc-800/70 p-5">
                <p className="text-sm text-zinc-400">Custo total</p>
                <p className="mt-2 text-2xl font-bold">R$ 35,00</p>
              </div>

              <div className="rounded-2xl bg-emerald-500/10 p-5">
                <p className="text-sm text-emerald-400">Lucro estimado</p>
                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  R$ 50,00
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5 text-sm">
              <span className="text-zinc-400">Margem sobre a venda</span>
              <span className="font-semibold text-emerald-400">58,8%</span>
            </div>

            <p className="mt-4 text-xs leading-5 text-zinc-600">
              Valores demonstrativos. O cálculo real depende dos custos,
              impostos e demais despesas informados.
            </p>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="border-t border-white/10 bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
              Mais controle
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Produza melhor. Precifique com inteligência.
            </h2>
            <p className="mt-4 leading-7 text-zinc-400">
              Tenha mais clareza sobre os números por trás de cada impressão.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
              <div className="text-3xl">🧵</div>
              <h3 className="mt-5 text-xl font-semibold">Custo de material</h3>
              <p className="mt-3 leading-7 text-zinc-400">
                Considere o filamento utilizado e os gastos com matéria-prima
                em cada peça.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
              <div className="text-3xl">⚡</div>
              <h3 className="mt-5 text-xl font-semibold">Custos de produção</h3>
              <p className="mt-3 leading-7 text-zinc-400">
                Organize despesas como energia elétrica, tempo de máquina e
                acabamento.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
              <div className="text-3xl">📈</div>
              <h3 className="mt-5 text-xl font-semibold">Lucro por peça</h3>
              <p className="mt-3 leading-7 text-zinc-400">
                Compare o preço de venda com seus custos para tomar decisões
                melhores.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section id="sobre" className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-orange-500/20 bg-orange-500/5 px-6 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Chega de definir preços no chute.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-400">
            Organize seus custos e tenha mais segurança para transformar sua
            impressora 3D em um negócio rentável.
          </p>
          <a
            href="#calculadora"
            className="mt-8 inline-flex rounded-xl bg-orange-500 px-7 py-4 font-semibold transition hover:bg-orange-400"
          >
            Quero calcular meus preços →
          </a>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-white">
              camada<span className="text-orange-500">.</span>
            </span>{" "}
            © {new Date().getFullYear()} — Impressão 3D com inteligência.
          </p>
          <p>Feito para makers e empreendedores.</p>
        </div>
      </footer>
    </main>
  );
}
