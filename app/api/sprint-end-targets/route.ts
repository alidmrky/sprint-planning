import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "sprintEndTargets.json");

export async function GET() {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const targets = JSON.parse(content);
    return NextResponse.json(targets);
  } catch {
    // Default targets if file doesn't exist
    const defaultTargets = [
      "Geliştirme",
      "Tamamlama", 
      "Test Tamamlama",
      "Analiz Tamamlama"
    ];
    return NextResponse.json(defaultTargets);
  }
}

export async function POST(request: Request) {
  const targets = await request.json();
  await fs.writeFile(filePath, JSON.stringify(targets, null, 2), "utf8");
  return NextResponse.json(targets);
}
