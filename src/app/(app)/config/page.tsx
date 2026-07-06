import Link from "next/link";

const itens = [
  {
    href: "/config/usuarios",
    icon: "👥",
    titulo: "Usuários",
    desc: "Criar, editar, desativar usuários e definir permissões",
  },
  {
    href: "/config/setores",
    icon: "🏢",
    titulo: "Setores",
    desc: "Gerenciar setores do escritório",
  },
  {
    href: "/config/obrigacoes",
    icon: "✅",
    titulo: "Templates de obrigações",
    desc: "Configurar obrigações mensais por setor",
  },
];

export default function ConfigPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-gray-500">
        Configurações do sistema. Somente a Diretoria tem acesso.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {itens.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card hover:border-brand-300 transition-colors group flex items-start gap-4"
          >
            <div className="text-2xl">{item.icon}</div>
            <div>
              <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-700">
                {item.titulo}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
