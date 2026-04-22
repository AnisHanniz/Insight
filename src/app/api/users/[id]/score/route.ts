import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'public', 'data', 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: any) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { scorePct, difficulty, packId } = await request.json();
  const users = await readUsers();
  const userIndex = users.findIndex((u: any) => String(u.id) === String(params.id));

  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const difficultyFactors: Record<string, number> = {
    beginner: 0.3,
    intermediate: 0.6,
    advanced: 1.0,
  };

  const factor = difficultyFactors[difficulty] ?? 0.6;
  const delta = Math.round((scorePct - 50) * factor);
  
  users[userIndex].elo = (users[userIndex].elo || 1000) + delta;

  // Add pack to history
  if (!users[userIndex].history) users[userIndex].history = [];
  users[userIndex].history.push({
    packId,
    scorePct,
    delta,
    date: new Date().toISOString()
  });

  await writeUsers(users);

  return NextResponse.json({ delta, newElo: users[userIndex].elo });
}