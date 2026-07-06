import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

interface LinhaImport {
  codigo_interno?: string;
  cnpj?: string;
  nome_empresarial?: string;
  razao_social?: string;
  // aliases flexíveis
  codigo?: string;
  nome?: string;
}

function limparCnpj(v: string): string {
  return String(v).replace(/\D/g, "");
}

function validarCnpj(cnpj: string): boolean {
  const c = limparCnpj(cnpj);
  return c.length === 14;
}

// POST /api/empresas/importar
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;
  if (!["DIRETORIA", "COORDENADOR"].includes(user.perfilGlobal))
    return NextResponse.json({ error: "Sem permissão para importar empresas" }, { status: 403 });

  const formData = await req.formData();
  const arquivo = formData.get("arquivo") as File | null;

  if (!arquivo)
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const linhas: LinhaImport[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

  const resultado = {
    criadas:    0,
    atualizadas: 0,
    ignoradas:  0,
    erros:      [] as { linha: number; cnpj: string; motivo: string }[],
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const numLinha = i + 2; // +2 porque linha 1 é cabeçalho

    // Normalizar campos (aceita variações de nome)
    const cnpjRaw  = String(linha.cnpj || "").trim();
    const codigo   = String(linha.codigo_interno || linha.codigo || "").trim();
    const nome     = String(linha.nome_empresarial || linha.razao_social || linha.nome || "").trim();

    // Validações
    if (!cnpjRaw) {
      resultado.erros.push({ linha: numLinha, cnpj: "-", motivo: "CNPJ não informado" });
      continue;
    }

    const cnpj = limparCnpj(cnpjRaw);

    if (!validarCnpj(cnpj)) {
      resultado.erros.push({ linha: numLinha, cnpj: cnpjRaw, motivo: "CNPJ inválido (precisa ter 14 dígitos)" });
      continue;
    }

    if (!nome) {
      resultado.erros.push({ linha: numLinha, cnpj: cnpjRaw, motivo: "Nome da empresa não informado" });
      continue;
    }

    try {
      const existente = await prisma.empresa.findUnique({ where: { cnpj } });

      if (existente) {
        // Já existe: atualizar apenas campos que estavam vazios
        await prisma.empresa.update({
          where: { cnpj },
          data: {
            ...(codigo && !existente.codigoInterno ? { codigoInterno: codigo } : {}),
          },
        });
        resultado.atualizadas++;
        continue;
      }

      // Criar nova empresa com módulos setoriais vazios
      await prisma.empresa.create({
        data: {
          cnpj,
          codigoInterno: codigo || `IMP-${Date.now()}-${i}`,
          razaoSocial:   nome,
          status:        "CADASTRO_INCOMPLETO",
          fiscal:        { create: {} },
          contabil:      { create: {} },
          dp:            { create: {} },
          societario:    { create: {} },
          relacionamento:{ create: {} },
        },
      });

      resultado.criadas++;
    } catch (e: any) {
      resultado.erros.push({
        linha: numLinha,
        cnpj:  cnpjRaw,
        motivo: e?.message?.includes("Unique") ? "CNPJ ou código duplicado" : "Erro interno",
      });
    }
  }

  // Auditoria da importação
  await prisma.auditoria.create({
    data: {
      usuarioId:    user.id,
      entidadeTipo: "importacao",
      entidadeId:   "batch",
      acao:         "create",
      valorNovo:    JSON.stringify(resultado),
    },
  });

  return NextResponse.json(resultado);
}
