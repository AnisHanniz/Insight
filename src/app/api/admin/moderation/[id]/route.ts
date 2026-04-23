export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function canModerate(role: string | undefined): boolean {
  return role === "admin" || role === "reviewer";
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!canModerate(session?.user?.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const pack = await prisma.pack.findUnique({
    where: { id: params.id },
    include: {
      scenarios: { orderBy: { id: "asc" } },
      creator: { select: { id: true, name: true, email: true, creatorBadge: true } },
    },
  });
  if (!pack) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({ ...pack, scenarioIds: pack.scenarios.map((s) => s.id) });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!canModerate(session?.user?.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { action, reason } = await request.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  const pack = await prisma.pack.findUnique({
    where: { id: params.id },
    select: { id: true, creatorId: true, status: true, isCommunity: true },
  });
  if (!pack || !pack.isCommunity) {
    return NextResponse.json({ message: "Not a community pack" }, { status: 404 });
  }
  if (pack.status !== "pending") {
    return NextResponse.json(
      { message: `Can only moderate pending packs (current: ${pack.status})` },
      { status: 400 }
    );
  }

  if (action === "reject") {
    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json({ message: "Rejection reason required" }, { status: 400 });
    }
    const updated = await prisma.pack.update({
      where: { id: params.id },
      data: { status: "rejected", rejectionReason: reason.trim() },
    });
    return NextResponse.json(updated);
  }

  // Approve: grant creator badge on first approval.
  const updated = await prisma.$transaction(async (tx) => {
    const pk = await tx.pack.update({
      where: { id: params.id },
      data: { status: "approved", approvedAt: new Date(), rejectionReason: null },
    });
    if (pack.creatorId) {
      await tx.user.update({
        where: { id: pack.creatorId },
        data: { creatorBadge: true },
      });
    }
    return pk;
  });

  return NextResponse.json(updated);
}
