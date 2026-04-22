import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'public', 'data', 'users.json');

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ message: 'Name cannot be empty' }, { status: 400 });
    }

    const data = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(data);
    const userIndex = users.findIndex((u: any) => String(u.id) === String(params.id));
    
    if (userIndex !== -1) {
      users[userIndex].name = name.trim();
      await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
      return NextResponse.json({ name: users[userIndex].name });
    }

    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error updating name' }, { status: 500 });
  }
}