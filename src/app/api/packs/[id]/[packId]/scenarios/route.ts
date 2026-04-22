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

export async function GET(request: Request, { params }: { params: { packId: string } }) {
  const scenarios = await readScenarios();
  const packScenarios = scenarios.filter(s => s.packId === params.packId);
  
  if (!packScenarios.length) {
    return NextResponse.json({ message: 'No scenarios found for this pack' }, { status: 404 });
  }

  return NextResponse.json(packScenarios);
}

export async function POST(request: Request, { params }: { params: { packId: string } }) {
  const newScenario = await request.json();
  const scenarios = await readScenarios();
  newScenario.id = scenarios.length > 0 ? Math.max(...scenarios.map((s: any) => s.id)) + 1 : 1;
  newScenario.packId = parseInt(params.packId, 10);
  scenarios.push(newScenario);
  await writeScenarios(scenarios);
  return NextResponse.json(newScenario, { status: 201 });
}
