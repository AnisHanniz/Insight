import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const scenario = await prisma.scenario.findUnique({
      where: { id: params.id }
    });

    if (!scenario) {
      return NextResponse.json({ message: 'Scenario not found' }, { status: 404 });
    }
    return NextResponse.json(scenario);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    
    // Remove relation fields if they exist in payload
    const { pack, ...updateData } = data;

    const updatedScenario = await prisma.scenario.update({
      where: { id: params.id },
      data: {
        ...updateData,
        videoUrl: data.video || data.videoUrl || undefined
      }
    });

    return NextResponse.json(updatedScenario);
  } catch (error: any) {
    console.error("Error updating scenario:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.scenario.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}