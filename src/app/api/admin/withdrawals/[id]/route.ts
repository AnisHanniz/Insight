export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { action, reason } = await request.json();
  if (action !== "paid" && action !== "reject") {
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  const wd = await prisma.withdrawal.findUnique({ where: { id: params.id } });
  if (!wd) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (wd.status !== "pending") {
    return NextResponse.json({ message: `Already ${wd.status}` }, { status: 400 });
  }

  if (action === "paid") {
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.withdrawal.update({
        where: { id: params.id },
        data: { status: "paid", paidAt: new Date() },
      });
      await tx.transaction.updateMany({
        where: { meta: { path: ["withdrawalId"], equals: params.id } },
        data: { status: "completed" },
      });
      return u;
    });
    return NextResponse.json(updated);
  }

  // Reject: refund balance.
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.withdrawal.update({
      where: { id: params.id },
      data: { status: "rejected", rejectionReason: reason || null },
    });
    await tx.user.update({
      where: { id: wd.userId },
      data: { balance: { increment: wd.amountIP } },
    });
    await tx.transaction.create({
      data: {
        userId: wd.userId,
        type: "refund",
        amountIP: wd.amountIP,
        status: "completed",
        meta: { withdrawalId: wd.id, reason: reason || null },
      },
    });
    return u;
  });
  return NextResponse.json(updated);
}
