
"use client";

import { useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import {
  Lightbulb,
  Bug,
  MessageCircle,
  Heart,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

const isConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

const categories = [
  {
    value: "Sugestão",
    description: "Tenho uma ideia para o Camada",
    icon: Lightbulb,
  },
  {
    value: "Problema",
    description: "Encontrei um erro ou dificuldade",
    icon: Bug,
  },
  {
    value: "Dúvida",
    description: "Preciso de ajuda ou esclarecimento",
    icon: MessageCircle,
  },
  {
    value: "Elogio",
    description: "Quero compartilhar minha experiência",
    icon: Heart,
  },
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20";

const labelClass = "block text-sm font-medium text-fg";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfigured || status === "sending") return;

    const form = event.currentTarget;

    setStatus("sending");
    setErrorMessage("");

    try {
      await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        form,
        {
          publicKey: PUBLIC_KEY,
        },
      );

      form.reset();
      setRating(0);
      setStatus("success");
    } catch (error: unknown) {
      const emailError = error as {
        text?: string;
        message?: string;
      };

      setErrorMessage(
        emailError.text ||
          emailError.message ||
          "Não foi possível enviar seu feedback. Tente novamente.",
      );

      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setErrorMessage("");
    setRating(0);
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-emerald-400/20 bg-zinc-900/80 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
          <CheckCircle2 size={32} />
        </div>

        <h2 className="mt-6 text-2xl font-bold">
          Feedback enviado!
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Obrigado por compartilhar sua opinião. Sua mensagem
          foi enviada com sucesso e contribuirá para melhorar
          cada vez mais o Camada.
        </p>

        <button
          type="button"
          onClick={handleReset}
          className="mt-8 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          Enviar outro feedback
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8"
    >
      <div className="mb-7">
        <p className="text-sm text-muted">
          Queremos ouvir você
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Enviar feedback
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          Preencha os campos abaixo e compartilhe sua experiência
          com o Camada.
        </p>
      </div>

      {!isConfigured && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200"
        >
          O serviço de envio ainda não foi configurado.
        </div>
      )}

      <input
        type="hidden"
        name="avaliacao"
        value={rating ? `${rating}/5 estrelas` : "Não informada"}
      />

      <div>
        <label className={labelClass}>
          O que você gostaria de compartilhar?
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <label
                key={category.value}
                className="cursor-pointer"
              >
                <input
                  type="radio"
                  name="tipo"
                  value={category.value}
                  required
                  className="peer sr-only"
                />

                <span className="flex h-full items-start gap-3 rounded-xl border border-white/10 bg-zinc-950/50 p-4 transition hover:border-white/20 peer-checked:border-primary/60 peer-checked:bg-primary/10">
                  <Icon
                    size={20}
                    className="mt-0.5 shrink-0 text-primary"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-fg">
                      {category.value}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {category.description}
                    </span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-7">
        <label className={labelClass}>
          Como você avalia o Camada?
        </label>

        <div
          className="mt-3 flex items-center gap-2"
          role="group"
          aria-label="Avaliação de uma a cinco estrelas"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
              aria-pressed={rating === value}
              className="rounded-lg p-1 transition hover:scale-110"
            >
              <Star
                size={26}
                className={
                  value <= rating
                    ? "fill-primary text-primary"
                    : "text-muted"
                }
              />
            </button>
          ))}

          <span className="ml-2 text-xs text-muted">
            {rating > 0
              ? `${rating} de 5 estrelas`
              : "Opcional"}
          </span>
        </div>
      </div>

      <div className="mt-7 space-y-5">
        <div>
          <label htmlFor="feedbackSubject" className={labelClass}>
            Assunto
          </label>

          <input
            id="feedbackSubject"
            name="assunto"
            type="text"
            required
            maxLength={100}
            placeholder="Ex.: Sugestão para o histórico"
            className={`${inputClass} mt-2`}
          />
        </div>

        <div>
          <label htmlFor="feedbackMessage" className={labelClass}>
            Sua mensagem
          </label>

          <textarea
            id="feedbackMessage"
            name="mensagem"
            rows={6}
            required
            minLength={10}
            maxLength={3000}
            placeholder="Conte sua sugestão, experiência ou problema..."
            className={`${inputClass} mt-2 resize-y`}
          />
        </div>

        <div>
          <label htmlFor="feedbackEmail" className={labelClass}>
            Seu e-mail <span className="text-muted">(opcional)</span>
          </label>

          <input
            id="feedbackEmail"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="seuemail@exemplo.com"
            className={`${inputClass} mt-2`}
          />

          <p className="mt-2 text-xs leading-5 text-muted">
            Informe seu e-mail caso queira receber uma resposta.
          </p>
        </div>
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-300"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !isConfigured}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-fg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? (
          "Enviando feedback..."
        ) : (
          <>
            Enviar feedback
            <Send size={17} />
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-muted">
        Obrigado por ajudar a construir um Camada cada vez melhor.
      </p>
    </form>
  );
}
