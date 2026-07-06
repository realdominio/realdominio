"use client";

import { useState } from "react";
import { useEmpresa } from "@/hooks/useEmpresa";
import { BadgeEmpresa, BadgeObrigacao, BadgeEvento } from "@/components/ui/StatusBadge";
import { formatCnpj, formatData, formatCompetencia, cn } from "@/lib/utils";
import { REGIME_LABEL, STATUS_EMPRESA_LABEL } from "@/types";
import Link from "next/link";

const ABAS = [
  { key: "360",          label: "Visão 360°"  },
  { key: "fiscal",       label: "Fiscal"      },
  { key: "contabil",     label: "Contábil"    },
  { key: "dp",           label: "DP"          },
  { key: "societario",   label: "Societário"  },
  { key: "relacionamento",label: "Relacionamento" },
];

export default function EmpresaPage({ params }: { params: { id: string } }) {
  const { empresa, carregando, erro, atualizarModulo, atualizarGeral } = useEmpresa(params.id);
  const [aba, setAba] = useState("360");
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function salvar(modulo: string, dados: Record<string, any>) {
    setSalvando(true);
    setMsg(null);
    const ok = modulo === "geral"
      ? await atualizarGeral(dados)
      : await atualizarModulo(modulo, dados);
    setMsg(ok
      ? { tipo: "ok",   texto: "Salvo com sucesso!" }
      : { tipo: "erro", texto: "Erro ao salvar. Tente novamente." });
    setSalvando(false);
    setTimeout(() => setMsg(null), 3000);
  }

  if (carregando) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Carregando empresa...
    </div>
  );

  if (erro || !empresa) return (
    <div className="card text-center py-12 text-red-500">
      {erro ?? "Empresa não encontrada"}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Breadcrumb + ações */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/empresas" className="hover:text-gray-900">Empresas</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{empresa.razaoSocial}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/empresas/${params.id}/editar`} className="btn btn-sm">
            Editar cadastro
          </Link>
        </div>
      </div>

      {/* Cabeçalho da empresa */}
      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{empresa.razaoSocial}</h1>
            {empresa.nomeFantasia && (
              <div className="text-sm text-gray-500 mt-0.5">{empresa.nomeFantasia}</div>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              <span className="font-mono">#{empresa.codigoInterno}</span>
              <span>·</span>
              <span className="font-mono">{formatCnpj(empresa.cnpj)}</span>
              {empresa.municipio && <><span>·</span><span>{empresa.municipio} — {empresa.estado}</span></>}
              {empresa.dataEntrada && <><span>·</span><span>Cliente desde {formatData(empresa.dataEntrada)}</span></>}
            </div>
          </div>
          <BadgeEmpresa status={empresa.status} />
        </div>

        {/* Obs. crítica */}
        {empresa.obsCritica && (
          <div className="obs-critica-bar">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <div className="text-xs font-semibold mb-0.5">Observação crítica</div>
              <div className="text-xs">{empresa.obsCritica}</div>
            </div>
          </div>
        )}

        {/* Responsáveis */}
        <div className="flex flex-wrap gap-4 pt-1">
          {[
            { label: "Fiscal",      resp: empresa.respFiscal },
            { label: "Contábil",    resp: empresa.respContabil },
            { label: "DP",          resp: empresa.respDp },
            { label: "Societário",  resp: empresa.respSocietario },
          ].map(({ label, resp }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{label}:</span>
              {resp ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-[9px] font-bold text-brand-700">
                    {resp.nome.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{resp.nome}</span>
                </div>
              ) : (
                <span className="text-xs text-red-400">Não atribuído</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toast de feedback */}
      {msg && (
        <div className={cn(
          "fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50",
          msg.tipo === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
          {msg.texto}
        </div>
      )}

      {/* Abas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {ABAS.map((a) => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                aba === a.key
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              )}
            >
              {a.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das abas */}
      <div>
        {aba === "360"          && <Aba360          empresa={empresa} />}
        {aba === "fiscal"       && <AbaFiscal       empresa={empresa} salvar={salvar} salvando={salvando} />}
        {aba === "contabil"     && <AbaContabil     empresa={empresa} salvar={salvar} salvando={salvando} />}
        {aba === "dp"           && <AbaDp           empresa={empresa} salvar={salvar} salvando={salvando} />}
        {aba === "societario"   && <AbaSocietario   empresa={empresa} salvar={salvar} salvando={salvando} />}
        {aba === "relacionamento"&&<AbaRelacionamento empresa={empresa} salvar={salvar} salvando={salvando} />}
      </div>
    </div>
  );
}

// ── Visão 360° ──────────────────────────────────────────────────
function Aba360({ empresa }: { empresa: any }) {
  const pendentes = empresa.obrigacoesCompetencia?.filter(
    (o: any) => !["CONCLUIDO", "NAO_SE_APLICA"].includes(o.status)
  ) ?? [];
  const atrasadas = empresa.obrigacoesCompetencia?.filter(
    (o: any) => o.status === "EM_ATRASO"
  ) ?? [];

  return (
    <div className="space-y-4">
      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="metric-card">
          <div className="metric-label">Obrigações {formatCompetencia(empresa.competencia ?? "")}</div>
          <div className={cn("metric-value", pendentes.length > 0 ? "text-yellow-600" : "text-green-700")}>
            {(empresa.obrigacoesCompetencia?.length ?? 0) - pendentes.length} / {empresa.obrigacoesCompetencia?.length ?? 0}
          </div>
          <div className="metric-sub">concluídas</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Em atraso</div>
          <div className={cn("metric-value", atrasadas.length > 0 ? "text-red-600" : "text-green-700")}>
            {atrasadas.length}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Eventos abertos</div>
          <div className={cn("metric-value", empresa.eventos?.length > 0 ? "text-brand-700" : "text-gray-600")}>
            {empresa.eventos?.length ?? 0}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Tarefas abertas</div>
          <div className={cn("metric-value", empresa.tarefas?.length > 0 ? "text-brand-700" : "text-gray-600")}>
            {empresa.tarefas?.length ?? 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dados setoriais resumidos */}
        <div className="card space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Resumo setorial</h3>
          {empresa.fiscal && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-500">Regime tributário</span>
              <span className="text-xs font-medium text-gray-800">
                {empresa.fiscal.regimeTributario ? REGIME_LABEL[empresa.fiscal.regimeTributario as keyof typeof REGIME_LABEL] : "—"}
              </span>
            </div>
          )}
          {empresa.fiscal?.parcelamentoAtivo && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-500">Parcelamento</span>
              <span className="badge badge-yellow text-[10px]">Ativo</span>
            </div>
          )}
          {empresa.dp && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-500">Funcionários</span>
              <span className="text-xs font-medium text-gray-800">{empresa.dp.qtdFuncionarios ?? 0}</span>
            </div>
          )}
          {empresa.societario?.vencimentoCertificado && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-500">Certificado digital</span>
              <span className="text-xs font-medium text-gray-800">
                Vence {formatData(empresa.societario.vencimentoCertificado)}
              </span>
            </div>
          )}
          {empresa.relacionamento?.ultimoContato && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-gray-500">Último contato</span>
              <span className="text-xs font-medium text-gray-800">
                {formatData(empresa.relacionamento.ultimoContato)}
              </span>
            </div>
          )}
        </div>

        {/* Obrigações do mês */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Obrigações — {formatCompetencia(empresa.competencia ?? "")}
          </h3>
          {empresa.obrigacoesCompetencia?.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhuma obrigação cadastrada.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {empresa.obrigacoesCompetencia?.map((o: any) => (
                <div key={o.id} className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                    o.status === "CONCLUIDO"         ? "bg-green-500" :
                    o.status === "EM_ATRASO"         ? "bg-red-500"   :
                    o.status === "AGUARDANDO_CLIENTE"? "bg-yellow-400": "bg-blue-400"
                  )} />
                  <span className="text-xs text-gray-700 flex-1 truncate">
                    {o.obrigacaoEmpresa.template.nome}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {o.obrigacaoEmpresa.template.setor.nome}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Eventos abertos */}
      {empresa.eventos?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Eventos abertos</h3>
          <div className="space-y-2">
            {empresa.eventos.map((ev: any) => (
              <div key={ev.id} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                <BadgeEvento status={ev.status} />
                <span className="text-sm text-gray-800 flex-1">{ev.tipoEvento?.nome ?? "Evento"}</span>
                <span className="text-xs text-gray-400">{ev.setorAtual?.nome}</span>
                {ev.prazo && (
                  <span className="text-xs text-gray-400">Prazo: {formatData(ev.prazo)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de observações */}
      {empresa.obsHistorico?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Últimas movimentações</h3>
          <div className="space-y-2">
            {empresa.obsHistorico.slice(0, 8).map((h: any) => (
              <div key={h.id} className="flex gap-3 py-1.5 border-b border-gray-100 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700">{h.texto}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatData(h.dataHora)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Aba Fiscal ──────────────────────────────────────────────────
function AbaFiscal({ empresa, salvar, salvando }: any) {
  const f = empresa.fiscal ?? {};
  const [form, setForm] = useState({ ...f });
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); salvar("fiscal", form); }} className="space-y-5">
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Regime tributário</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Regime</label>
            <select className="select" value={form.regimeTributario ?? ""} onChange={(e) => set("regimeTributario", e.target.value || null)}>
              <option value="">Selecione...</option>
              {Object.entries(REGIME_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Início do regime</label>
            <input className="input" type="date" value={form.inicioRegime?.slice(0,10) ?? ""} onChange={(e) => set("inicioRegime", e.target.value)} />
          </div>
          <div>
            <label className="label">Próxima revisão tributária</label>
            <input className="input" type="date" value={form.proximaRevisao?.slice(0,10) ?? ""} onChange={(e) => set("proximaRevisao", e.target.value)} />
          </div>
          <div>
            <label className="label">Inscrição Estadual</label>
            <input className="input" value={form.inscricaoEstadual ?? ""} onChange={(e) => set("inscricaoEstadual", e.target.value)} />
          </div>
          <div>
            <label className="label">Inscrição Municipal</label>
            <input className="input" value={form.inscricaoMunicipal ?? ""} onChange={(e) => set("inscricaoMunicipal", e.target.value)} />
          </div>
          <div>
            <label className="label">Preferência de envio de guia</label>
            <select className="select" value={form.prefEnvioGuia ?? ""} onChange={(e) => set("prefEnvioGuia", e.target.value)}>
              <option value="">Selecione...</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">E-mail</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Regularidade fiscal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.parcelamentoAtivo ?? false}
              onChange={(e) => set("parcelamentoAtivo", e.target.checked)} />
            <span className="text-sm text-gray-700">Possui parcelamento ativo</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.possuiDebitos ?? false}
              onChange={(e) => set("possuiDebitos", e.target.checked)} />
            <span className="text-sm text-gray-700">Possui débitos fiscais conhecidos</span>
          </label>
          {form.parcelamentoAtivo && (
            <>
              <div>
                <label className="label">Quantidade de parcelamentos</label>
                <input className="input" type="number" min={0} value={form.qtdParcelamentos ?? 0} onChange={(e) => set("qtdParcelamentos", Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Órgão do parcelamento</label>
                <input className="input" value={form.orgaoParcelamento ?? ""} onChange={(e) => set("orgaoParcelamento", e.target.value)} />
              </div>
              <div>
                <label className="label">Situação do parcelamento</label>
                <input className="input" value={form.situacaoParcelamento ?? ""} onChange={(e) => set("situacaoParcelamento", e.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      <BotaoSalvar salvando={salvando} />
    </form>
  );
}

// ── Aba Contábil ────────────────────────────────────────────────
function AbaContabil({ empresa, salvar, salvando }: any) {
  const c = empresa.contabil ?? {};
  const [form, setForm] = useState({ ...c });
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); salvar("contabil", form); }} className="space-y-5">
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Fechamento contábil</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Último fechamento</label>
            <input className="input" type="date" value={form.ultimoFechamento?.slice(0,10) ?? ""} onChange={(e) => set("ultimoFechamento", e.target.value)} />
          </div>
          <div>
            <label className="label">Competência do fechamento</label>
            <input className="input" placeholder="YYYY-MM" value={form.competenciaFech ?? ""} onChange={(e) => set("competenciaFech", e.target.value)} />
          </div>
          <div>
            <label className="label">Último resultado</label>
            <select className="select" value={form.ultimoResultado ?? ""} onChange={(e) => set("ultimoResultado", e.target.value)}>
              <option value="">Selecione...</option>
              <option value="LUCRO">Lucro</option>
              <option value="PREJUIZO">Prejuízo</option>
              <option value="EQUILIBRIO">Equilíbrio</option>
            </select>
          </div>
          <div>
            <label className="label">Confiabilidade da receita</label>
            <select className="select" value={form.confiabilidade ?? ""} onChange={(e) => set("confiabilidade", e.target.value)}>
              <option value="">Selecione...</option>
              <option value="TOTAL">Declara toda a receita</option>
              <option value="PARCIAL">Declara parcialmente</option>
              <option value="NAO_SABEMOS">Não sabemos</option>
              <option value="NAO">Não</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Estrutura bancária</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Quantidade de contas bancárias</label>
            <input className="input" type="number" min={0} value={form.qtdContasBancarias ?? 0} onChange={(e) => set("qtdContasBancarias", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Conta principal</label>
            <input className="input" value={form.contaPrincipal ?? ""} onChange={(e) => set("contaPrincipal", e.target.value)} />
          </div>
          <div>
            <label className="label">Pessoa para solicitar extratos</label>
            <input className="input" value={form.pessoaExtratos ?? ""} onChange={(e) => set("pessoaExtratos", e.target.value)} />
          </div>
          <div>
            <label className="label">Forma de solicitação</label>
            <input className="input" value={form.formaExtratos ?? ""} onChange={(e) => set("formaExtratos", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Observações sobre extratos</label>
            <textarea className="input min-h-[80px]" value={form.obsExtratos ?? ""} onChange={(e) => set("obsExtratos", e.target.value)} />
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.possuiEmprestimo ?? false} onChange={(e) => set("possuiEmprestimo", e.target.checked)} />
            <span className="text-sm text-gray-700">Possui empréstimo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.possuiFinanciamento ?? false} onChange={(e) => set("possuiFinanciamento", e.target.checked)} />
            <span className="text-sm text-gray-700">Possui financiamento</span>
          </label>
        </div>
      </div>

      <BotaoSalvar salvando={salvando} />
    </form>
  );
}

// ── Aba DP ──────────────────────────────────────────────────────
function AbaDp({ empresa, salvar, salvando }: any) {
  const d = empresa.dp ?? {};
  const [form, setForm] = useState({ ...d });
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); salvar("dp", form); }} className="space-y-5">
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Departamento Pessoal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer md:col-span-3">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.possuiFuncionarios ?? false} onChange={(e) => set("possuiFuncionarios", e.target.checked)} />
            <span className="text-sm text-gray-700">Possui funcionários</span>
          </label>
          {form.possuiFuncionarios && (
            <div>
              <label className="label">Quantidade de funcionários</label>
              <input className="input" type="number" min={0} value={form.qtdFuncionarios ?? 0} onChange={(e) => set("qtdFuncionarios", Number(e.target.value))} />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.possuiProlabore ?? false} onChange={(e) => set("possuiProlabore", e.target.checked)} />
            <span className="text-sm text-gray-700">Possui pró-labore</span>
          </label>
          {form.possuiProlabore && (
            <div>
              <label className="label">Quantidade de sócios na folha</label>
              <input className="input" type="number" min={0} value={form.qtdSociosfolha ?? 0} onChange={(e) => set("qtdSociosfolha", Number(e.target.value))} />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.possuiInssPatronal ?? false} onChange={(e) => set("possuiInssPatronal", e.target.checked)} />
            <span className="text-sm text-gray-700">INSS Patronal</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.possuiPisFolha ?? false} onChange={(e) => set("possuiPisFolha", e.target.checked)} />
            <span className="text-sm text-gray-700">PIS sobre folha</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.terceiros ?? false} onChange={(e) => set("terceiros", e.target.checked)} />
            <span className="text-sm text-gray-700">Terceiros</span>
          </label>
          <div>
            <label className="label">RAT (%)</label>
            <input className="input" type="number" step="0.01" min={0} value={form.rat ?? ""} onChange={(e) => set("rat", e.target.value)} />
          </div>
          <div>
            <label className="label">FAP</label>
            <input className="input" type="number" step="0.0001" min={0} value={form.fap ?? ""} onChange={(e) => set("fap", e.target.value)} />
          </div>
        </div>
      </div>
      <BotaoSalvar salvando={salvando} />
    </form>
  );
}

// ── Aba Societário ──────────────────────────────────────────────
function AbaSocietario({ empresa, salvar, salvando }: any) {
  const s = empresa.societario ?? {};
  const [form, setForm] = useState({ ...s });
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); salvar("societario", form); }} className="space-y-5">
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Contrato e certidões</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.contratoAtualizado ?? false} onChange={(e) => set("contratoAtualizado", e.target.checked)} />
            <span className="text-sm text-gray-700">Contrato social atualizado</span>
          </label>
          <div>
            <label className="label">Última alteração contratual</label>
            <input className="input" type="date" value={form.ultimaAlteracaoContr?.slice(0,10) ?? ""} onChange={(e) => set("ultimaAlteracaoContr", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Certificado digital</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
              checked={form.certificadoDigital ?? false} onChange={(e) => set("certificadoDigital", e.target.checked)} />
            <span className="text-sm text-gray-700">Possui certificado digital</span>
          </label>
          {form.certificadoDigital && (
            <>
              <div>
                <label className="label">Tipo</label>
                <select className="select" value={form.tipoCertificado ?? ""} onChange={(e) => set("tipoCertificado", e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="A1">e-CNPJ A1</option>
                  <option value="A3">e-CNPJ A3</option>
                </select>
              </div>
              <div>
                <label className="label">Vencimento</label>
                <input className="input" type="date" value={form.vencimentoCertificado?.slice(0,10) ?? ""} onChange={(e) => set("vencimentoCertificado", e.target.value)} />
              </div>
              <div>
                <label className="label">Situação</label>
                <select className="select" value={form.situacaoCertificado ?? ""} onChange={(e) => set("situacaoCertificado", e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="A_VENCER">A vencer</option>
                  <option value="VENCIDO">Vencido</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Procurações e acessos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: "procuracaoRF",       label: "Procuração Receita Federal" },
            { key: "procuracaoEstado",   label: "Procuração Estado" },
            { key: "procuracaoMunicipio",label: "Procuração Município" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
                checked={form[key] ?? false} onChange={(e) => set(key, e.target.checked)} />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
          <div>
            <label className="label">Licenças</label>
            <input className="input" value={form.licencas ?? ""} onChange={(e) => set("licencas", e.target.value)} />
          </div>
          <div>
            <label className="label">Alvarás</label>
            <input className="input" value={form.alvaras ?? ""} onChange={(e) => set("alvaras", e.target.value)} />
          </div>
        </div>
      </div>

      <BotaoSalvar salvando={salvando} />
    </form>
  );
}

// ── Aba Relacionamento ──────────────────────────────────────────
function AbaRelacionamento({ empresa, salvar, salvando }: any) {
  const r = empresa.relacionamento ?? {};
  const [form, setForm] = useState({ ...r });
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const PERFIS = ["ORGANIZADO","DESORGANIZADO","TECNICO","CONSERVADOR","QUESTIONADOR","DEMORADO","OBJETIVO"];

  return (
    <form onSubmit={(e) => { e.preventDefault(); salvar("relacionamento", form); }} className="space-y-5">
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Histórico de contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Último contato</label>
            <input className="input" type="date" value={form.ultimoContato?.slice(0,10) ?? ""} onChange={(e) => set("ultimoContato", e.target.value)} />
          </div>
          <div>
            <label className="label">Última reunião</label>
            <input className="input" type="date" value={form.ultimaReuniao?.slice(0,10) ?? ""} onChange={(e) => set("ultimaReuniao", e.target.value)} />
          </div>
          <div>
            <label className="label">Última visita</label>
            <input className="input" type="date" value={form.ultimaVisita?.slice(0,10) ?? ""} onChange={(e) => set("ultimaVisita", e.target.value)} />
          </div>
          <div>
            <label className="label">Forma preferencial de contato</label>
            <select className="select" value={form.formaPrefContato ?? ""} onChange={(e) => set("formaPrefContato", e.target.value)}>
              <option value="">Selecione...</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">E-mail</option>
              <option value="TELEFONE">Telefone</option>
              <option value="PRESENCIAL">Presencial</option>
            </select>
          </div>
          <div>
            <label className="label">Tempo de resposta</label>
            <select className="select" value={form.tempoResposta ?? ""} onChange={(e) => set("tempoResposta", e.target.value)}>
              <option value="">Selecione...</option>
              <option value="RAPIDO">Rápido</option>
              <option value="MEDIO">Médio</option>
              <option value="LENTO">Lento</option>
            </select>
          </div>
          <div>
            <label className="label">Perfil do cliente</label>
            <select className="select" value={form.perfilCliente ?? ""} onChange={(e) => set("perfilCliente", e.target.value)}>
              <option value="">Selecione...</option>
              {PERFIS.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>
      </div>
      <BotaoSalvar salvando={salvando} />
    </form>
  );
}

// ── Botão salvar reutilizável ───────────────────────────────────
function BotaoSalvar({ salvando }: { salvando: boolean }) {
  return (
    <div className="flex justify-end">
      <button type="submit" disabled={salvando} className="btn btn-primary">
        {salvando ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Salvando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            Salvar alterações
          </>
        )}
      </button>
    </div>
  );
}
