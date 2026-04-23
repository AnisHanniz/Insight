export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function canModerate(role: string | undefined): boolean {
  return role === "admin" || role === "reviewer";
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!canModerate(session?.user?.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const packs = await prisma.pack.findMany({
    where: { isCommunity: true, status },
    include: {
      creator: { select: { id: true, name: true, email: true, creatorBadge: true } },
      _count: { select: { scenarios: true } },
    },
    orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(
    packs.map((p) => ({ ...p, scenarios: p._count.scenarios }))
  );
}
