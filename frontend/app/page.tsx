async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function Home() {
  await delay(10); // loading para test 0.1s

  return (
    <div className="flex items-center justify-center font-sans">
      <main className="flex w-full max-w-4xl flex-col items-center justify-between py-12 sm:items-start">
        <h1 className="max-w-3xl text-7xl font-semibold leading-10 tracking-tight py-10 ">Bem vindo a sua Wallet!</h1>
        <h2 className="max-w-3xl text-2xl font-semibold leading-10 tracking-tight">Onde você controla suas econômias e investimentos.</h2>
      </main>
    </div>
  );
}
