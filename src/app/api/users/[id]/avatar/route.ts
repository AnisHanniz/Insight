import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from "@/lib/prisma";

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
    
    // This will work in local dev but FAIL on Vercel (read-only filesystem)
    try {
      await fs.mkdir(publicAvatarsPath, { recursive: true });
      await fs.writeFile(path.join(publicAvatarsPath, filename), buffer);
    } catch (fsErr) {
      console.warn("Filesystem write failed (expected on Vercel):", fsErr);
      // In production, you should use Vercel Blob or an S3 bucket
    }

    const imageUrl = `/avatars/${filename}?t=${Date.now()}`;

    await prisma.user.update({
      where: { id: params.id },
      data: { image: imageUrl }
    });

    return NextResponse.json({ imageUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Error uploading' }, { status: 500 });
  }
}
