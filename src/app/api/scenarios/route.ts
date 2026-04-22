import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const packId = searchParams.get('packId');

    const where = packId ? { packId } : {};
    const scenarios = await prisma.scenario.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(scenarios);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

function genScenarioId(): string {
  const base = Date.now().toString(36);
  return `s-${base}`;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      data.id = genScenarioId();
    }

    const newScenario = await prisma.scenario.create({
      data: {
        id: data.id,
        packId: data.packId,
        title: data.title,
        description: data.description,
        map: data.map || 'Any',
        image: data.image || null,
        videoUrl: data.video || data.videoUrl || null,
        theme: data.theme,
        subcategory: data.subcategory,
        overlay: data.overlay || null,
        macro: data.macro || {},
        micro: data.micro || {},
        communication: data.communication || {},
        options: data.options || []
      }
    });

    return NextResponse.json(newScenario, { status: 201 });
  } catch (error: any) {
    console.error("Error creating scenario:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}