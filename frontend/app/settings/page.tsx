async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function settings() {
  await delay(10); // loading para test 1s

  return (
    <div className="">
      <main className="">
        <h1>Configurações</h1>
      </main>
    </div>
  );
}

export const metadata = {
  title: "Configurações",
};