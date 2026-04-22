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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const users = await readUsers();
  const user = users.find((u: any) => u.id === params.id);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const updatedUserData = await request.json();
  const users = await readUsers();
  const userIndex = users.findIndex((u: any) => u.id === params.id);

  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  users[userIndex] = { ...users[userIndex], ...updatedUserData };
  await writeUsers(users);

  return NextResponse.json(users[userIndex]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  let users = await readUsers();
  const userIndex = users.findIndex((u: any) => u.id === params.id);

  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  users.splice(userIndex, 1);
  await writeUsers(users);

  return new NextResponse(null, { status: 204 });
}
