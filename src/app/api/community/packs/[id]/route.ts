export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePackOwner, canEditPack } from "@/lib/packAuth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await requirePackOwner(params.id);
  if ("error" in s) return NextResponse.json({ message: s.error }, { status: s.status });

  const pack = await prisma.pack.findUnique({
    where: { id: params.id },
    include: {
      scenarios: { orderBy: { id: "asc" } },
      creator: { select: { id: true, name: true, image: true, creatorBadge: true } },
    },
  });
  if (!pack) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({ ...pack, scenarioIds: pack.scenarios.map((x) => x.id) });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const s = await requirePackOwner(params.id);
  if ("error" in s) return NextResponse.json({ message: s.error }, { status: s.status });

  if (!canEditPack(s.pack.status)) {
    return NextResponse.json(
      { message: `Cannot edit: pack status is ${s.pack.status}` },
      { status: 400 }
    );
  }

  const data = await request.json();
  const { scenarios, scenarioIds, id, creatorId, status, priceIP, creatorShareIP, isCommunity, ...rest } = data;

  const updated = await prisma.pack.update({
    where: { id: params.id },
    data: {
      name: rest.name,
      theme: rest.theme,
      subtitle: rest.subtitle ?? null,
      description: rest.description ?? null,
      difficulty: rest.difficulty,
      imageUrl: rest.imageUrl ?? "",
      // Transition rejected -> draft on re-edit so creator can re-submit after fixing.
      status: s.pack.status === "rejected" ? "draft" : s.pack.status,
      rejectionReason: s.pack.status === "rejected" ? null : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await requirePackOwner(params.id);
  if ("error" in s) return NextResponse.json({ message: s.error }, { status: s.status });

  if (s.pack.status !== "draft" && s.pack.status !== "rejected") {
    return NextResponse.json(
      { message: "Only draft or rejected packs can be deleted" },
      { status: 400 }
    );
  }

  await prisma.pack.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
