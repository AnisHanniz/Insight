import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'public', 'data', 'users.json');

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;
    
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'png';
    const filename = `${params.id}.${ext}`;
    const publicAvatarsPath = path.join(process.cwd(), 'public', 'avatars');
    
    await fs.mkdir(publicAvatarsPath, { recursive: true });
    await fs.writeFile(path.join(publicAvatarsPath, filename), buffer);

    const imageUrl = `/avatars/${filename}?t=${Date.now()}`;

    const data = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(data);
    const userIndex = users.findIndex((u: any) => String(u.id) === String(params.id));
    
    if (userIndex !== -1) {
      users[userIndex].image = imageUrl;
      await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error uploading' }, { status: 500 });
  }
}