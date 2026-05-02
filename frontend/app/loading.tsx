export default function Loading(){
  return (
    <div className="flex items-center justify-center h-full min-h-[calc(100vh-64px)] overflow-hidden">
      <p className="animate-pulse text-gray-500 text-2xl">
        Carregando...
      </p>
    </div>
  );
}
