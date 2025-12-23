import { ProblemManager } from "@/components/ProblemManager";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Python WebAssembly Editor
          </h1>
          <div className="text-sm text-gray-500">
            Powered by Pyodide & Monaco
          </div>
        </header>

        <ProblemManager />
      </div>
    </main>
  );
}
