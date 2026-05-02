async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function wallet() {
  await delay(10); // loading para test 1s
  return (
    <div>
      <main>
        <h1 className="text-3xl font-semibold leading-10 tracking-tight px-3 py-10 text-black">Veja como está sua Carteira!</h1>
      </main>
    </div>
  );
}

export const metadata = {
  title: "Carteira",
};
