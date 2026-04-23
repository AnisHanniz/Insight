export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, canEditPack } from "@/lib/packAuth";

async function loadAndAuthorize(scenarioId: string) {
  const s = await requireSession();
  if ("error" in s) return s;

  const scenario = await prisma.scenario.findUnique({
    where: { id: scenarioId },
    include: { pack: { select: { id: true, creatorId: true, status: true, isCommunity: true } } },
  });
  if (!scenario) return { error: "Not found", status: 404 as const };

  const isAdmin = s.role === "admin";
  if (!isAdmin && scenario.pack.creatorId !== s.userId) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { scenario, role: s.role, userId: s.userId };
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const r = await loadAndAuthorize(params.id);
  if ("error" in r) return NextResponse.json({ message: r.error }, { status: r.status });

  if (!canEditPack(r.scenario.pack.status)) {
    return NextResponse.json(
      { message: `Cannot edit: pack status is ${r.scenario.pack.status}` },
      { status: 400 }
    );
  }

  const data = await request.json();
  const updated = await prisma.scenario.update({
    where: { id: params.id },
    data: {
      title: data.title,
      description: data.description,
      map: data.map || "Any",
      image: data.image ?? null,
      videoUrl: data.video ?? data.videoUrl ?? null,
      theme: data.theme ?? null,
      subcategory: data.subcategory ?? null,
      overlay: data.overlay ?? null,
      macro: data.macro || {},
      micro: data.micro || {},
      communication: data.communication || {},
      options: data.options || [],
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const r = await loadAndAuthorize(params.id);
  if ("error" in r) return NextResponse.json({ message: r.error }, { status: r.status });

  if (!canEditPack(r.scenario.pack.status)) {
    return NextResponse.json(
      { message: `Cannot delete: pack status is ${r.scenario.pack.status}` },
      { status: 400 }
    );
  }

  await prisma.scenario.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
