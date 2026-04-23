export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const pack = await tx.pack.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          isCommunity: true,
          status: true,
          priceIP: true,
          creatorShareIP: true,
          creatorId: true,
        },
      });
      if (!pack || !pack.isCommunity || pack.status !== "approved") {
        throw new Error("PACK_NOT_AVAILABLE");
      }
      if (!pack.priceIP || !pack.creatorShareIP) {
        throw new Error("PACK_NOT_PRICED");
      }
      if (pack.creatorId === userId) {
        throw new Error("CANNOT_BUY_OWN_PACK");
      }

      const existing = await tx.packPurchase.findUnique({
        where: { userId_packId: { userId, packId: params.id } },
      });
      if (existing) throw new Error("ALREADY_OWNED");

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true, packsUnlocked: true },
      });
      if (!user) throw new Error("USER_NOT_FOUND");
      if (user.balance < pack.priceIP) throw new Error("INSUFFICIENT_BALANCE");

      // Debit buyer.
      const newUnlocked = Array.isArray(user.packsUnlocked)
        ? [...(user.packsUnlocked as string[]), pack.id]
        : [pack.id];
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: pack.priceIP },
          packsUnlocked: newUnlocked,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "purchase",
          amountIP: -pack.priceIP,
          status: "completed",
          packId: pack.id,
        },
      });

      // Credit creator.
      if (pack.creatorId) {
        await tx.user.update({
          where: { id: pack.creatorId },
          data: { balance: { increment: pack.creatorShareIP } },
        });
        await tx.transaction.create({
          data: {
            userId: pack.creatorId,
            type: "payout",
            amountIP: pack.creatorShareIP,
            status: "completed",
            packId: pack.id,
            meta: { buyerId: userId },
          },
        });
      }

      const purchase = await tx.packPurchase.create({
        data: {
          userId,
          packId: pack.id,
          amountIP: pack.priceIP,
        },
      });

      return { purchase, priceIP: pack.priceIP, creatorShareIP: pack.creatorShareIP };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    const code = error?.message || "";
    const map: Record<string, { msg: string; status: number }> = {
      PACK_NOT_AVAILABLE: { msg: "Pack not available for purchase", status: 404 },
      PACK_NOT_PRICED: { msg: "Pack pricing missing — contact support", status: 500 },
      CANNOT_BUY_OWN_PACK: { msg: "You can't purchase your own pack", status: 400 },
      ALREADY_OWNED: { msg: "You already own this pack", status: 400 },
      USER_NOT_FOUND: { msg: "User not found", status: 404 },
      INSUFFICIENT_BALANCE: { msg: "Insufficient IP — top up your wallet", status: 400 },
    };
    const e = map[code] || { msg: error?.message || "Purchase failed", status: 500 };
    return NextResponse.json({ message: e.msg, code }, { status: e.status });
  }
}
