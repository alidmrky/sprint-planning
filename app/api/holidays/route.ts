import { NextResponse } from "next/server";
import { readHolidays, upsertHoliday, deleteHoliday } from "@/lib/holidayStore";
import { Holiday } from "@/lib/types";

export async function GET() {
  const list = await readHolidays();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Holiday;
  // basic validation
  if (!body.name?.trim() || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: "name, startDate, endDate required" }, { status: 400 });
  }
  const list = await upsertHoliday(body);
  return NextResponse.json(list, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Holiday;
  if (!body.name?.trim() || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: "name, startDate, endDate required" }, { status: 400 });
  }
  const list = await upsertHoliday(body);
  return NextResponse.json(list);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const list = await deleteHoliday(id);
  return NextResponse.json(list);
}


