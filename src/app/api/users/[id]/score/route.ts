export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { scorePct, difficulty, packId, qualities } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const difficultyFactors: Record<string, number> = {
      beginner: 0.6,
      intermediate: 0.9,
      advanced: 1.3,
    };

    const factor = difficultyFactors[difficulty] ?? 0.9;

    const PER_QUALITY: Record<string, number> = {
      perfect: 10,
      excellent: 2,
      good: -6,
      blunder: -18,
    };

    let delta: number;
    if (qualities && typeof qualities === "object") {
      const raw = Object.entries(qualities as Record<string, number>).reduce(
        (sum, [q, n]) => sum + (PER_QUALITY[q] ?? 0) * n,
        0
      );
      delta = Math.round(raw * factor);
    } else {
      delta = Math.round((scorePct - 70) * factor);
    }
    
    const newElo = (user.elo || 1000) + delta;

    // Update history
    const history = Array.isArray(user.history) ? [...user.history] : [];
    history.push({
      packId,
      scorePct,
      delta,
      date: new Date().toISOString()
    });

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        elo: newElo,
        history: history
      }
    });

    return NextResponse.json({ delta, newElo: updatedUser.elo });
  } catch (error: any) {
    console.error("Error updating score:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
