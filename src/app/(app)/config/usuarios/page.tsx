"use client";

import { useState, useEffect } from "react";
import { formatData } from "@/lib/utils";

const PERFIS: Record<string, string> = {
  DIRETORIA:    "Diretoria",
  COORDENADOR:  "Coordenador",
  LIDER:        "Líder",
  OPERADOR:     "Operador",
  CONSULTA:     "Consulta",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios]   = useState<any[]>([]);
  const [setores, setSetores]     = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modal, setModal]         = useState(false);
  const [salvando, setSalvando]   = useState(false);
  const [msg, setMsg]             = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "", email: "", senha: "",
    perfilGlobal: "OPERADOR",
    podeVerComercial: false,
    setoresSel: [] as string[],
  });

  async function carregar() {
    setCarregando(true);
    const [u, s] = await Promise.all([
      fetch("/api/usuarios").then((r) => r.json()),
      fetch("/api/setores").then((r) => r.json()),
    ]);
    setUsuarios(Array.isArray(u) ? u : []);
    setSetores(Array.isArray(s) ? s : []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function criarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        perfilGlobal: form.perfilGlobal,
        podeVerComercial: form.podeVerComercial,
        setores: form.setoresSel.map((id) => ({ setorId: id, papel: "membro" })),
      }),
    });
    if (res.ok) {
      setModal(false);
      setForm({ nome:"",email:"",senha:"",perfilGlobal:"OPERADOR",podeVerComercial:false,setoresSel:[] });
      setMsg("Usuário criado com sucesso!");
      carregar();
    } else {
      const j = await res.json();
      setMsg(j.error ?? "Erro ao criar usuário.");
    }
    setSalvando(false);
    setTimeout(() => setMsg(null), 3000);
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    carregar();
  }

  function toggleSetor(id: string) {
    setForm((p) => ({
      ...p,
      setoresSel: p.setoresSel.includes(id)
        ? p.setoresSel.filter((s) => s !== id)
        : [...p.setoresSel, id],
    }));
  }

  return (
    <div className="space-y-5">
      {msg && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-medium bg-green-600 text-white z-50">
          {msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{usuarios.length} usuários cadastrados</div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
          + Novo usuário
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="table-auto-fixed">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Setores</th>
              <th>Comercial</th>
              <th>Desde</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Carregando...</td></tr>
            ) : usuarios.map((u) => (
              <tr key={u.id}>
                <td className="font-medium text-gray-900">{u.nome}</td>
                <td className="text-gray-500 text-xs font-mono">{u.email}</td>
                <td><span className="badge badge-blue">{PERFIS[u.perfilGlobal] ?? u.perfilGlobal}</span></td>
                <td className="text-xs text-gray-500">
                  {u.setores?.map((s: any) => s.setor.nome).join(", ") || "—"}
                </td>
                <td>
                  {u.podeVerComercial
                    ? <span className="badge badge-green">Sim</span>
                    : <span className="badge badge-gray">Não</span>}
                </td>
                <td className="text-xs text-gray-400">{formatData(u.createdAt)}</td>
                <td>
                  {u.ativo
                    ? <span className="badge badge-green">Ativo</span>
                    : <span className="badge badge-gray">Inativo</span>}
                </td>
                <td>
                  <button
                    className="btn btn-sm text-xs"
                    onClick={() => toggleAtivo(u.id, u.ativo)}
                  >
                    {u.ativo ? "Desativar" : "Reativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal novo usuário */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Novo usuário</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={criarUsuario} className="p-5 space-y-4">
              <div>
                <label className="label">Nome completo</label>
                <input className="input" required value={form.nome} onChange={(e) => setForm((p) => ({...p,nome:e.target.value}))} />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => setForm((p) => ({...p,email:e.target.value}))} />
              </div>
              <div>
                <label className="label">Senha inicial</label>
                <input className="input" type="password" required minLength={6} value={form.senha} onChange={(e) => setForm((p) => ({...p,senha:e.target.value}))} />
                <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres. O usuário pode alterar depois.</p>
              </div>
              <div>
                <label className="label">Perfil</label>
                <select className="select" value={form.perfilGlobal} onChange={(e) => setForm((p) => ({...p,perfilGlobal:e.target.value}))}>
                  {Object.entries(PERFIS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Setores</label>
                <div className="flex flex-wrap gap-2">
                  {setores.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleSetor(s.id)}
                      className={`badge cursor-pointer ${form.setoresSel.includes(s.id) ? "bg-brand-100 text-brand-700" : "badge-gray"}`}
                    >
                      {s.nome}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-brand-600"
                  checked={form.podeVerComercial}
                  onChange={(e) => setForm((p) => ({...p,podeVerComercial:e.target.checked}))} />
                <span className="text-sm text-gray-700">Acesso aos dados comerciais</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button type="button" className="btn flex-1 justify-center" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" disabled={salvando} className="btn btn-primary flex-1 justify-center">
                  {salvando ? "Salvando..." : "Criar usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
