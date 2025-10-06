import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "currentStatuses.json");

export async function GET() {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const statuses = JSON.parse(content);
    return NextResponse.json(statuses);
  } catch {
    // Default statuses if file doesn't exist
    const defaultStatuses = [
      "Başlanmadı",
      "Geliştirme",
      "HOLD",
      "Tamamlandı"
    ];
    return NextResponse.json(defaultStatuses);
  }
}

export async function POST(request: Request) {
  const statuses = await request.json();
  await fs.writeFile(filePath, JSON.stringify(statuses, null, 2), "utf8");
  return NextResponse.json(statuses);
}
