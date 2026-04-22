export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(" ", "_");
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads");

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicPath = `/images/uploads/${filename}`;

    return NextResponse.json({ url: publicPath });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
