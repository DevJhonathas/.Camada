
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Camada | Calculadora de Impressão 3D",
  description:
    "Calcule os custos, defina preços de venda e acompanhe o lucro das suas peças impressas em 3D.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
