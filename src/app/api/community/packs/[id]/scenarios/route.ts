export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePackOwner, canEditPack } from "@/lib/packAuth";

function genScenarioId(): string {
  return `cs-${Date.now().toString(36)}`;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await requirePackOwner(params.id);
  if ("error" in s) return NextResponse.json({ message: s.error }, { status: s.status });

  const list = await prisma.scenario.findMany({
    where: { packId: params.id },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(list);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const s = await requirePackOwner(params.id);
  if ("error" in s) return NextResponse.json({ message: s.error }, { status: s.status });

  if (!canEditPack(s.pack.status)) {
    return NextResponse.json(
      { message: `Cannot add scenario: pack status is ${s.pack.status}` },
      { status: 400 }
    );
  }

  const data = await request.json();
  if (!data.title || !data.description) {
    return NextResponse.json({ message: "Title and description required" }, { status: 400 });
  }
  if (!Array.isArray(data.options) || data.options.length < 2) {
    return NextResponse.json({ message: "At least 2 options required" }, { status: 400 });
  }

  const scenario = await prisma.scenario.create({
    data: {
      id: data.id || genScenarioId(),
      packId: params.id,
      title: data.title,
      description: data.description,
      map: data.map || "Any",
      image: data.image || null,
      videoUrl: data.video || data.videoUrl || null,
      theme: data.theme || null,
      subcategory: data.subcategory || null,
      overlay: data.overlay || null,
      macro: data.macro || {},
      micro: data.micro || {},
      communication: data.communication || {},
      options: data.options,
    },
  });

  return NextResponse.json(scenario, { status: 201 });
}
