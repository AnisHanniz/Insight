export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packs = await prisma.pack.findMany({
      include: {
        _count: {
          select: { scenarios: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Map to include scenarioIds for backward compatibility if needed, 
    // or just return the count as 'scenarios'
    const formattedPacks = packs.map(pack => ({
      ...pack,
      scenarios: pack._count.scenarios
    }));

    return NextResponse.json(formattedPacks);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Auto-increment string ID if not provided
    if (!data.id) {
      const allPacks = await prisma.pack.findMany({ select: { id: true } });
      const maxNumeric = allPacks.reduce((m: number, p: any) => {
        const n = parseInt(String(p.id), 10);
        return Number.isFinite(n) && n > m ? n : m;
      }, 0);
      data.id = String(maxNumeric + 1);
    }

    const newPack = await prisma.pack.create({
      data: {
        id: data.id,
        name: data.name,
        theme: data.theme || 'training',
        subtitle: data.subtitle,
        description: data.description,
        tier: data.tier || 1,
        difficulty: data.difficulty || 'intermediate',
        price: data.price || 'Free',
        imageUrl: data.imageUrl || '',
        isPremium: data.isPremium || false,
        tournament: data.tournament,
        creatorId: data.creatorId || null
      }
    });

    return NextResponse.json(newPack, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}