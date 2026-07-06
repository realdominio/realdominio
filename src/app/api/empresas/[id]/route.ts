import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, podeVerComercial } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/empresas/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;

  const empresa = await prisma.empresa.findUnique({
    where: { id: params.id, deletedAt: null },
    include: {
      respFiscal:     { select: { id: true, nome: true } },
      respContabil:   { select: { id: true, nome: true } },
      respDp:         { select: { id: true, nome: true } },
      respSocietario: { select: { id: true, nome: true } },
      respCarteira:   { select: { id: true, nome: true } },
      fiscal:         true,
      contabil:       true,
      dp:             true,
      societario:     true,
      relacionamento: true,
      // Comercial: só para quem tem permissão
      comercial: podeVerComercial(user.perfilGlobal, user.podeVerComercial)
        ? true
        : false,
      socios: {
        include: { pessoa: { select: { id: true, nome: true, cpf: true } } },
        where: { dataFim: null },
      },
      eventos: {
        where: { deletedAt: null, status: { notIn: ["CONCLUIDO", "CANCELADO"] } },
        orderBy: { dataAbertura: "desc" },
        take: 10,
        include: {
          tipoEvento: { select: { nome: true } },
          setorAtual: { select: { nome: true } },
          respAtual:  { select: { id: true, nome: true } },
        },
      },
      tarefas: {
        where: { deletedAt: null, status: { notIn: ["CONCLUIDO", "CANCELADO"] } },
        orderBy: { prazo: "asc" },
        take: 10,
        include: {
          setor:       { select: { nome: true } },
          responsavel: { select: { id: true, nome: true } },
        },
      },
      obsHistorico: {
        orderBy: { dataHora: "desc" },
        take: 20,
      },
    },
  });

  if (!empresa)
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

  // Obrigações da competência atual
  const hoje = new Date();
  const competencia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

  const obrigacoes = await prisma.obrigacaoInstancia.findMany({
    where: {
      competencia,
      obrigacaoEmpresa: { empresaId: params.id, ativa: true },
    },
    include: {
      responsavel: { select: { id: true, nome: true } },
      obrigacaoEmpresa: {
        include: {
          template: {
            include: { setor: { select: { id: true, nome: true } } },
          },
        },
      },
    },
    orderBy: [
      { obrigacaoEmpresa: { template: { setor: { ordem: "asc" } } } },
      { obrigacaoEmpresa: { template: { ordem: "asc" } } },
    ],
  });

  // Auditoria de visualização (para dados sensíveis)
  await prisma.auditoria.create({
    data: {
      usuarioId:    user.id,
      entidadeTipo: "empresa",
      entidadeId:   params.id,
      acao:         "view",
    },
  });

  return NextResponse.json({ ...empresa, obrigacoesCompetencia: obrigacoes, competencia });
}

// PUT /api/empresas/[id] — atualizar dados gerais
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;
  if (user.perfilGlobal === "CONSULTA")
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();

  // Campos gerais da empresa
  const empresa = await prisma.empresa.update({
    where: { id: params.id },
    data: {
      razaoSocial:   body.razaoSocial,
      nomeFantasia:  body.nomeFantasia,
      municipio:     body.municipio,
      bairro:        body.bairro,
      estado:        body.estado,
      dataAbertura:  body.dataAbertura  ? new Date(body.dataAbertura)  : undefined,
      dataEntrada:   body.dataEntrada   ? new Date(body.dataEntrada)   : undefined,
      status:        body.status,
      obsAtual:      body.obsAtual,
      obsCritica:    body.obsCritica,
      respFiscalId:  body.respFiscalId  || null,
      respContabilId:body.respContabilId|| null,
      respDpId:      body.respDpId      || null,
      respSocietId:  body.respSocietId  || null,
      respCarteiraId:body.respCarteiraId|| null,
    },
  });

  // Gravar histórico se obs. crítica mudou
  if (body.obsCritica !== undefined) {
    const anterior = await prisma.auditoria.findFirst({
      where: { entidadeId: params.id, campo: "obsCritica" },
      orderBy: { dataHora: "desc" },
    });
    await prisma.auditoria.create({
      data: {
        usuarioId:     user.id,
        entidadeTipo:  "empresa",
        entidadeId:    params.id,
        campo:         "obsCritica",
        valorAnterior: anterior?.valorNovo ?? null,
        valorNovo:     body.obsCritica,
        acao:          "update",
      },
    });
  }

  return NextResponse.json(empresa);
}

// DELETE /api/empresas/[id] — soft delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;
  if (user.perfilGlobal !== "DIRETORIA")
    return NextResponse.json({ error: "Somente Diretoria pode excluir empresas" }, { status: 403 });

  await prisma.empresa.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), ativo: false },
  });

  await prisma.auditoria.create({
    data: {
      usuarioId:    user.id,
      entidadeTipo: "empresa",
      entidadeId:   params.id,
      acao:         "delete",
    },
  });

  return NextResponse.json({ ok: true });
}
