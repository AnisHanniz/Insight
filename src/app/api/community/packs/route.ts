export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/packAuth";
import { MAX_ACTIVE_PACKS_PER_USER } from "@/lib/pricing";

export async function GET() {
  const s = await requireSession();
  if ("error" in s) return NextResponse.json({ message: s.error }, { status: s.status });

  const packs = await prisma.pack.findMany({
    where: { creatorId: s.userId, isCommunity: true },
    include: { _count: { select: { scenarios: true } } },
    orderBy: { createdAt: "desc" },
  });
  const formatted = packs.map((p) => ({ ...p, scenarios: p._count.scenarios }));
  return NextResponse.json(formatted);
}

function genPackId(): string {
  return `c-${Date.now().toString(36)}`;
}

export async function POST(request: Request) {
  const s = await requireSession();
  if ("error" in s) return NextResponse.json({ message: s.error }, { status: s.status });

  const active = await prisma.pack.count({
    where: {
      creatorId: s.userId,
      isCommunity: true,
      status: { in: ["draft", "pending"] },
    },
  });
  if (active >= MAX_ACTIVE_PACKS_PER_USER) {
    return NextResponse.json(
      { message: `Limit reached: max ${MAX_ACTIVE_PACKS_PER_USER} active packs (draft or pending).` },
      { status: 400 }
    );
  }

  const data = await request.json();
  if (!data.name || typeof data.name !== "string") {
    return NextResponse.json({ message: "Name required" }, { status: 400 });
  }

  const pack = await prisma.pack.create({
    data: {
      id: genPackId(),
      name: data.name,
      theme: data.theme || "decision",
      subtitle: data.subtitle || null,
      description: data.description || null,
      difficulty: data.difficulty || "intermediate",
      tier: 2,
      price: "Community",
      imageUrl: data.imageUrl || "",
      isPremium: false,
      isCommunity: true,
      status: "draft",
      creatorId: s.userId,
    },
  });

  return NextResponse.json(pack, { status: 201 });
}
