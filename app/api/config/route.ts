import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/configStore";
import { AppConfig } from "@/lib/types";

export async function GET() {
  const cfg = await readConfig();
  return NextResponse.json(cfg);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as AppConfig;
  if (!/^\d{2}:\d{2}$/.test(body.dailyPlanningHour)) {
    return NextResponse.json({ error: "dailyPlanningHour format HH:mm" }, { status: 400 });
  }
  await writeConfig(body);
  return NextResponse.json({ ok: true });
}


