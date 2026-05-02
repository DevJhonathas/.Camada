import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <nav className="flex gap-4 px-2 py-2">
        <Link href="/">Home</Link>
        <Link href="/wallet">Wallet</Link>
        <Link href="/settings">Configurações</Link>
      </nav>
  </>
  );
}
