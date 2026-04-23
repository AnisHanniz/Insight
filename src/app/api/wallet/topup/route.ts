export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { usdToIP } from "@/lib/pricing";

// TODO Stripe: replace stub with real Stripe Checkout session creation.
// Current behavior: immediately credits balance (dev-only stub).
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amountUSD } = await request.json();
    const usd = Number(amountUSD);
    if (!Number.isFinite(usd) || usd < 1 || usd > 500) {
      return NextResponse.json(
        { message: "Amount must be between $1 and $500" },
        { status: 400 }
      );
    }

    const amountIP = usdToIP(usd);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId: session.user!.id!,
          type: "topup",
          amountIP,
          status: "completed",
          stripeRef: `stub_${Date.now()}`,
          meta: { amountUSD: usd, stub: true },
        },
      });
      return tx.user.update({
        where: { id: session.user!.id! },
        data: { balance: { increment: amountIP } },
        select: { balance: true },
      });
    });

    return NextResponse.json({
      success: true,
      balance: updated.balance,
      credited: amountIP,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
