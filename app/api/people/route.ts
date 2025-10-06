import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/configStore";
import { Person } from "@/lib/types";

export async function GET() {
  const cfg = await readConfig();
  return NextResponse.json(cfg.people);
}

export async function POST(request: Request) {
  const person = (await request.json()) as Person;
  const cfg = await readConfig();
  if (cfg.people.some(p => p.id === person.id)) {
    return NextResponse.json({ error: "Person already exists" }, { status: 409 });
  }
  cfg.people.push(person);
  await writeConfig(cfg);
  return NextResponse.json(person, { status: 201 });
}

export async function PUT(request: Request) {
  const person = (await request.json()) as Person;
  const cfg = await readConfig();
  const idx = cfg.people.findIndex(p => p.id === person.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  cfg.people[idx] = person;
  await writeConfig(cfg);
  return NextResponse.json(person);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const cfg = await readConfig();
  const next = { ...cfg, people: cfg.people.filter(p => p.id !== id) };
  await writeConfig(next);
  return NextResponse.json({ ok: true });
}


