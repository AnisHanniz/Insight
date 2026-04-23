export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const withdrawals = await prisma.withdrawal.findMany({
    where: status ? { status } : undefined,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(withdrawals);
}
