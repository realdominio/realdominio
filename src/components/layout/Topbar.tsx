"use client";

import { usePathname } from "next/navigation";

const TITULOS: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/empresas":   "Empresas",
  "/pessoas":    "Pessoas",
  "/obrigacoes": "Obrigações mensais",
  "/eventos":    "Eventos",
  "/tarefas":    "Tarefas",
  "/backup":     "Backup e exportação",
  "/config":     "Configurações",
};

export function Topbar() {
  const pathname = usePathname();
  const base = "/" + pathname.split("/")[1];
  const titulo = TITULOS[base] ?? "Real Domínio";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="text-base font-semibold text-gray-900 flex-1">{titulo}</h1>

      {/* Busca global */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar empresa, CNPJ, pessoa..."
          className="input pl-9 w-72 text-sm"
        />
      </div>

      {/* Notificações */}
      <button className="btn-icon relative">
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Badge de não lidas — será dinâmico */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
          3
        </span>
      </button>
    </header>
  );
}
