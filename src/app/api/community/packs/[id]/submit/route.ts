export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePackOwner, canEditPack } from "@/lib/packAuth";
import { tierForScenarioCount } from "@/lib/pricing";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const s = await requirePackOwner(params.id);
  if ("error" in s) return NextResponse.json({ message: s.error }, { status: s.status });

  if (!canEditPack(s.pack.status)) {
    return NextResponse.json(
      { message: `Cannot submit: status is ${s.pack.status}` },
      { status: 400 }
    );
  }

  const count = await prisma.scenario.count({ where: { packId: params.id } });
  if (count < 1) {
    return NextResponse.json({ message: "Add at least one scenario before submitting" }, { status: 400 });
  }

  const tier = tierForScenarioCount(count);

  const pack = await prisma.pack.update({
    where: { id: params.id },
    data: {
      status: "pending",
      submittedAt: new Date(),
      priceIP: tier.priceIP,
      creatorShareIP: tier.creatorShareIP,
      price: `$${tier.priceUSD.toFixed(2)}`,
      rejectionReason: null,
    },
  });

  return NextResponse.json({
    pack,
    tier: {
      priceUSD: tier.priceUSD,
      priceIP: tier.priceIP,
      creatorShareIP: tier.creatorShareIP,
      scenarioCount: count,
    },
  });
}
