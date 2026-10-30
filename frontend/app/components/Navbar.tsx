
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={closeMenu}
            className="text-2xl font-bold tracking-tight text-white"
          >
            camada<span className="text-orange-500">.</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
            <Link href="/" className="transition hover:text-white">
              Início
            </Link>

            <Link
              href="/calc_price"
              className="transition hover:text-white"
            >
              Calcular preço
            </Link>

            <Link
              href="/#recursos"
              className="transition hover:text-white"
            >
              Recursos
            </Link>

            <Link
              href="/#sobre"
              className="transition hover:text-white"
            >
              Sobre
            </Link>

            <Link
              href="/calc_price"
              className="rounded-full bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-400"
            >
              Começar agora
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white transition hover:bg-white/5 sm:hidden"
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5 sm:hidden"
          >
            <Link
              href="/"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Início
            </Link>

            <Link
              href="/calc_price"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Calcular preço
            </Link>

            <Link
              href="/#recursos"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Recursos
            </Link>

            <Link
              href="/#sobre"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Sobre
            </Link>

            <Link
              href="/calc_price"
              onClick={closeMenu}
              className="mt-2 rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              Começar agora →
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
