import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const packsFilePath = path.join(process.cwd(), 'public', 'data', 'packs.json');

async function readPacks() {
  try {
    const data = await fs.readFile(packsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writePacks(packs: any) {
  await fs.writeFile(packsFilePath, JSON.stringify(packs, null, 2));
}

export async function GET() {
  const packs = await readPacks();
  return NextResponse.json(packs);
}

export async function POST(request: Request) {
  const newPack = await request.json();
  const packs = await readPacks();
  const maxNumeric = packs.reduce((m: number, p: any) => {
    const n = parseInt(String(p.id), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  newPack.id = String(maxNumeric + 1);
  newPack.scenarioIds = Array.isArray(newPack.scenarioIds) ? newPack.scenarioIds : [];
  packs.push(newPack);
  await writePacks(packs);
  return NextResponse.json(newPack, { status: 201 });
}
