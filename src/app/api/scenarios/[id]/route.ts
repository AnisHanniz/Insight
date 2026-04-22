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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const scenarios = await readScenarios();
  const scenario = scenarios.find((s) => String(s.id) === String(params.id));
  if (!scenario) {
    return NextResponse.json({ message: 'Scenario not found' }, { status: 404 });
  }
  return NextResponse.json(scenario);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const updatedScenarioData = await request.json();
  const scenarios = await readScenarios();
  const scenarioIndex = scenarios.findIndex((s) => String(s.id) === String(params.id));

  if (scenarioIndex === -1) {
    return NextResponse.json({ message: 'Scenario not found' }, { status: 404 });
  }

  scenarios[scenarioIndex] = { ...scenarios[scenarioIndex], ...updatedScenarioData, id: scenarios[scenarioIndex].id };
  await writeScenarios(scenarios);

  return NextResponse.json(scenarios[scenarioIndex]);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const scenarios = await readScenarios();
  const scenarioIndex = scenarios.findIndex((s) => String(s.id) === String(params.id));

  if (scenarioIndex === -1) {
    return NextResponse.json({ message: 'Scenario not found' }, { status: 404 });
  }

  scenarios.splice(scenarioIndex, 1);
  await writeScenarios(scenarios);

  return new NextResponse(null, { status: 204 });
}
