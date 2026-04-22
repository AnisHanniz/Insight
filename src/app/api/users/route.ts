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

export async function GET() {
  const users = await readUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const newUser = await request.json();
  const users = await readUsers();
  newUser.id = (users.length > 0 ? Math.max(...users.map((u: any) => parseInt(u.id, 10))) + 1 : 1).toString();
  users.push(newUser);
  await writeUsers(users);
  return NextResponse.json(newUser, { status: 201 });
}
