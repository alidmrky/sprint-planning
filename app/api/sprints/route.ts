import { NextResponse } from "next/server";
import { readSprints, writeSprints, upsertSprint, deleteSprint } from "@/lib/sprintStore";
import { Sprint } from "@/lib/types";

export async function GET() {
  const list = await readSprints();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Sprint;
  const list = await upsertSprint(body);
  return NextResponse.json(list, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Sprint;
  const list = await upsertSprint(body);
  return NextResponse.json(list);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  // Yalnızca Kaydedildi durumundaki sprintler silinebilir
  const current = (await readSprints()).find(s => s.id === id);
  if (current && current.status !== "Kaydedildi") {
    return NextResponse.json({ error: "Sadece Kaydedildi durumundaki sprint silinebilir" }, { status: 409 });
  }
  const list = await deleteSprint(id);
  return NextResponse.json(list);
}


