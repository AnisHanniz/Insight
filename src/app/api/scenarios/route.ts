import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Scenario } from '@/types/scenario';

const scenariosFilePath = path.join(process.cwd(), 'public', 'data', 'scenarios.json');

async function readScenarios(): Promise<Scenario[]> {
  try {
    const data = await fs.readFile(scenariosFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeScenarios(scenarios: any) {
  await fs.writeFile(scenariosFilePath, JSON.stringify(scenarios, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packId = searchParams.get('packId');

  const scenarios = await readScenarios();
  if (!packId) {
    return NextResponse.json(scenarios);
  }
  return NextResponse.json(scenarios.filter((s) => String(s.packId) === String(packId)));
}

function genScenarioId(existing: Scenario[]): string {
  const base = Date.now().toString(36);
  let id = `s-${base}`;
  let n = 0;
  const has = (i: string) => existing.some((s) => String(s.id) === i);
  while (has(id)) {
    n += 1;
    id = `s-${base}-${n}`;
  }
  return id;
}

export async function POST(request: Request) {
  const newScenario = await request.json();
  const scenarios = await readScenarios();
  newScenario.id = genScenarioId(scenarios);
  scenarios.push(newScenario);
  await writeScenarios(scenarios);
  return NextResponse.json(newScenario, { status: 201 });
}
