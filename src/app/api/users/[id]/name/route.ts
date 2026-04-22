export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ message: 'Name cannot be empty' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { name: name.trim() }
    });

    return NextResponse.json({ name: updatedUser.name });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Error updating name' }, { status: 500 });
  }
}
