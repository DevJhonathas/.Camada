
import Link from "next/link";
import Navbar from "../components/Navbar";
import FeedbackForm from "./FeedbackForm";
import { ArrowLeft, Mail } from "lucide-react";


export const metadata = {
  title: "Feedback | Camada",
  description:
    "Envie sugestões, avaliações e relatos para ajudar a melhorar o Camada.",
};

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-fg">
      <header className="border-b border-border">
        <Navbar />
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="mb-8">
          <Link
            href="/calc_price"
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary"
          >
            <ArrowLeft size={16} />
            Voltar para a calculadora
          </Link>
        </div>

        <div className="mb-10 rise">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Sua opinião importa
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Vamos melhorar juntos.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-muted">
            O Camada está em constante evolução. Compartilhe suas ideias,
            relate problemas ou conte como a ferramenta está ajudando
            no seu trabalho.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
          <FeedbackForm />

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                ✦
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                O que você pode compartilhar?
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-fg">
                    Novas funcionalidades
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted">
                    Tem alguma ferramenta que gostaria de encontrar
                    no Camada?
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-fg">
                    Problemas encontrados
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted">
                    Encontrou algum erro nos cálculos ou dificuldade
                    ao utilizar a plataforma?
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-fg">
                    Sua experiência
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted">
                    Conte como o Camada está ajudando na precificação
                    das suas peças.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6">
              <h2 className="font-semibold text-fg">
                Feito para makers.
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Cada sugestão contribui para tornar a ferramenta
                mais útil, prática e completa para quem trabalha
                com impressão 3D.
              </p>

              <p className="mt-4 text-sm font-semibold text-primary">
                camada.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
              <div className="flex items-center gap-3">
                <Mail size={19} className="text-primary" />

                <h3 className="text-sm font-semibold">
                  Como funciona o envio?
                </h3>
              </div>

              <p className="mt-2 text-sm leading-6 text-muted">
                Ao enviar o formulário, abriremos seu aplicativo
                de e-mail com a mensagem pronta. Basta conferir
                e confirmar o envio.
              </p>
            </div>
          </aside>
        </div>
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
