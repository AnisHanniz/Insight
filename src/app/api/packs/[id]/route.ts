export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const pack = await prisma.pack.findUnique({
      where: { id: params.id },
      include: {
        scenarios: {
          select: { id: true }
        }
      }
    });

    if (!pack) {
      return NextResponse.json({ message: 'Pack not found' }, { status: 404 });
    }

    // Include scenarioIds for backward compatibility
    const formattedPack = {
      ...pack,
      scenarioIds: pack.scenarios.map(s => s.id)
    };

    return NextResponse.json(formattedPack);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    
    // Remove relation fields if they exist in payload
    const { scenarios, scenarioIds, ...updateData } = data;

    const updatedPack = await prisma.pack.update({
      where: { id: params.id },
      data: {
        ...updateData,
        tier: data.tier ? parseInt(String(data.tier)) : undefined,
      }
    });

    return NextResponse.json(updatedPack);
  } catch (error: any) {
    console.error("Error updating pack:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.pack.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}