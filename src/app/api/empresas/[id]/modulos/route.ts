import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Modulo = "fiscal" | "contabil" | "dp" | "societario" | "relacionamento" | "comercial";

// PATCH /api/empresas/[id]/modulos?modulo=fiscal
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;
  if (user.perfilGlobal === "CONSULTA")
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const modulo = req.nextUrl.searchParams.get("modulo") as Modulo;
  if (!modulo)
    return NextResponse.json({ error: "Parâmetro 'modulo' obrigatório" }, { status: 400 });

  // Bloquear comercial para quem não tem acesso
  if (modulo === "comercial" && user.perfilGlobal !== "DIRETORIA" && !user.podeVerComercial)
    return NextResponse.json({ error: "Sem permissão para dados comerciais" }, { status: 403 });

  const body = await req.json();

  const upsertData = { where: { empresaId: params.id }, update: body, create: { ...body, empresaId: params.id } };

  let resultado;
  switch (modulo) {
    case "fiscal":
      resultado = await prisma.fiscal.upsert(upsertData);
      break;
    case "contabil":
      resultado = await prisma.contabil.upsert(upsertData);
      break;
    case "dp":
      resultado = await prisma.dp.upsert(upsertData);
      break;
    case "societario":
      resultado = await prisma.societario.upsert(upsertData);
      break;
    case "relacionamento":
      resultado = await prisma.relacionamento.upsert(upsertData);
      break;
    case "comercial":
      resultado = await prisma.comercial.upsert(upsertData);
      // Auditoria obrigatória para dados comerciais
      await prisma.auditoria.create({
        data: {
          usuarioId:    user.id,
          entidadeTipo: "comercial",
          entidadeId:   params.id,
          acao:         "update",
          valorNovo:    JSON.stringify(body),
        },
      });
      break;
    default:
      return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
  }

  return NextResponse.json(resultado);
}
