export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const packs = await prisma.pack.findMany({
    where: { isCommunity: true, status: "approved" },
    include: {
      creator: { select: { id: true, name: true, image: true, creatorBadge: true } },
      _count: { select: { scenarios: true } },
    },
    orderBy: { approvedAt: "desc" },
  });

  const formatted = packs.map((p) => ({ ...p, scenarios: p._count.scenarios }));
  return NextResponse.json(formatted);
}
