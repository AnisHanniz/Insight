import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const packsFilePath = path.join(process.cwd(), 'public', 'data', 'packs.json');

async function readPacks() {
  try {
    const data = await fs.readFile(packsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writePacks(packs: any) {
  await fs.writeFile(packsFilePath, JSON.stringify(packs, null, 2));
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const packs = await readPacks();
  const pack = packs.find((p: any) => String(p.id) === String(params.id));
  if (!pack) {
    return NextResponse.json({ message: 'Pack not found' }, { status: 404 });
  }
  return NextResponse.json(pack);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const updatedPackData = await request.json();
  const packs = await readPacks();
  const packIndex = packs.findIndex((p: any) => String(p.id) === String(params.id));

  if (packIndex === -1) {
    return NextResponse.json({ message: 'Pack not found' }, { status: 404 });
  }

  packs[packIndex] = { ...packs[packIndex], ...updatedPackData };
  await writePacks(packs);

  return NextResponse.json(packs[packIndex]);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  let packs = await readPacks();
  const packIndex = packs.findIndex((p: any) => String(p.id) === String(params.id));

  if (packIndex === -1) {
    return NextResponse.json({ message: 'Pack not found' }, { status: 404 });
  }

  packs.splice(packIndex, 1);
  await writePacks(packs);

  return new NextResponse(null, { status: 204 });
}
