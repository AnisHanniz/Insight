import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

async function getFiles(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const imagesDir = path.join(publicDir, "images");
    
    // Check if directory exists
    try {
      await fs.access(imagesDir);
    } catch {
      return NextResponse.json([]);
    }

    const allFiles = await getFiles(imagesDir);
    
    // Filter for images and convert to web paths
    const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"];
    const imagePaths = allFiles
      .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => {
        const relativePath = path.relative(publicDir, file);
        // Ensure forward slashes for web paths
        return "/" + relativePath.split(path.sep).join("/");
      });

    return NextResponse.json(imagePaths);
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 });
  }
}
