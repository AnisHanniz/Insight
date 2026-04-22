export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { packId: string } }) {
  try {
    const scenarios = await prisma.scenario.findMany({
      where: { packId: params.packId },
      orderBy: { id: 'asc' }
    });
    
    if (!scenarios.length) {
      return NextResponse.json({ message: 'No scenarios found for this pack' }, { status: 404 });
    }

    return NextResponse.json(scenarios);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { packId: string } }) {
  try {
    const data = await request.json();
    
    const newScenario = await prisma.scenario.create({
      data: {
        ...data,
        packId: params.packId
      }
    });
    
    return NextResponse.json(newScenario, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}