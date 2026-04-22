import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { scorePct, difficulty, packId } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const difficultyFactors: Record<string, number> = {
      beginner: 0.3,
      intermediate: 0.6,
      advanced: 1.0,
    };

    const factor = difficultyFactors[difficulty] ?? 0.6;
    const delta = Math.round((scorePct - 50) * factor);
    
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
