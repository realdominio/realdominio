import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PerfilGlobal } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;
  // Diretoria pode editar qualquer um; usuário pode editar a si mesmo (só nome/senha)
  const ehProprioUsuario = user.id === params.id;
  if (user.perfilGlobal !== "DIRETORIA" && !ehProprioUsuario)
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const dados: any = {};

  if (body.nome)  dados.nome  = body.nome;
  if (body.email && user.perfilGlobal === "DIRETORIA")
    dados.email = body.email.toLowerCase();
  if (body.senha) dados.senhaHash = await bcrypt.hash(body.senha, 12);

  // Somente Diretoria pode alterar perfil e permissões
  if (user.perfilGlobal === "DIRETORIA") {
    if (body.perfilGlobal)            dados.perfilGlobal    = body.perfilGlobal as PerfilGlobal;
    if (body.podeVerComercial != null) dados.podeVerComercial = body.podeVerComercial;
    if (body.ativo != null)           dados.ativo           = body.ativo;

    // Atualizar setores se informado
    if (body.setores) {
      await prisma.usuarioSetor.deleteMany({ where: { usuarioId: params.id } });
      if (body.setores.length > 0) {
        await prisma.usuarioSetor.createMany({
          data: body.setores.map((s: { setorId: string; papel: string }) => ({
            usuarioId: params.id,
            setorId:   s.setorId,
            papel:     s.papel || "membro",
          })),
        });
      }
    }
  }

  const atualizado = await prisma.usuario.update({
    where: { id: params.id },
    data: dados,
    select: { id: true, nome: true, email: true, perfilGlobal: true, ativo: true },
  });

  return NextResponse.json(atualizado);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;
  if (user.perfilGlobal !== "DIRETORIA")
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  if (user.id === params.id)
    return NextResponse.json({ error: "Não é possível desativar o próprio usuário" }, { status: 400 });

  // Soft delete
  await prisma.usuario.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), ativo: false },
  });

  return NextResponse.json({ ok: true });
}
