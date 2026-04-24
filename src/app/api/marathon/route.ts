export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const themesParam = searchParams.get("themes");
    const count = Math.min(100, Math.max(1, parseInt(searchParams.get("count") || "20")));
    const themes = themesParam ? themesParam.split(",").filter(Boolean) : null;

    const packs = await prisma.pack.findMany({
      where: {
        isPremium: false,
        isCommunity: false,
        ...(themes ? { theme: { in: themes } } : {}),
      },
      include: { scenarios: true },
    });

    const allScenarios = packs.flatMap((p) =>
      p.scenarios.map((s) => ({
        ...s,
        video: s.videoUrl ?? undefined,
        videoUrl: undefined,
        macro: s.macro as { title: string; description: string },
        micro: s.micro as { title: string; description: string },
        communication: s.communication as { title: string; description: string },
        options: s.options as { id: number; text: string; quality?: string; isCorrect?: boolean; feedback: string }[],
      }))
    );

    if (allScenarios.length === 0) {
      return NextResponse.json([]);
    }

    const picked = shuffle(allScenarios).slice(0, count);
    return NextResponse.json(picked);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
