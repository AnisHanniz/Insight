export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MIN_WITHDRAW_IP, ipToUSD } from "@/lib/pricing";

// TODO Stripe: replace with Stripe Connect payout. Current behavior: creates
// pending Withdrawal row, debits balance. Admin marks as paid manually.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amountIP, payoutMethod, payoutDetails } = await request.json();
    const amt = Number(amountIP);

    if (!Number.isFinite(amt) || amt < MIN_WITHDRAW_IP) {
      return NextResponse.json(
        { message: `Minimum withdrawal is ${MIN_WITHDRAW_IP} IP ($${ipToUSD(MIN_WITHDRAW_IP).toFixed(2)})` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user!.id! },
        select: { balance: true },
      });
      if (!user) throw new Error("User not found");
      if (user.balance < amt) {
        throw new Error("Insufficient balance");
      }

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: session.user!.id!,
          amountIP: amt,
          amountUSD: ipToUSD(amt),
          status: "pending",
          payoutMethod: payoutMethod || "manual",
          payoutDetails: payoutDetails || null,
        },
      });

      await tx.transaction.create({
        data: {
          userId: session.user!.id!,
          type: "withdraw",
          amountIP: -amt,
          status: "pending",
          meta: { withdrawalId: withdrawal.id },
        },
      });

      const updated = await tx.user.update({
        where: { id: session.user!.id! },
        data: { balance: { decrement: amt } },
        select: { balance: true },
      });

      return { withdrawal, balance: updated.balance };
    });

    return NextResponse.json({
      success: true,
      withdrawalId: result.withdrawal.id,
      balance: result.balance,
    });
  } catch (error: any) {
    const msg = error.message || "Withdraw failed";
    const status = msg === "Insufficient balance" ? 400 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}
