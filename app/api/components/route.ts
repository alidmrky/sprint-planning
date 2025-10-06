import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "components.json");

export async function GET() {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const components = JSON.parse(content);
    return NextResponse.json(components);
  } catch {
    // Default components if file doesn't exist
    const defaultComponents = [
      "Roadmap_Torus",
      "Teknik RoadMap_Torus", 
      "Kaizen_Torus",
      "Problem_Torus"
    ];
    return NextResponse.json(defaultComponents);
  }
}

export async function POST(request: Request) {
  const components = await request.json();
  await fs.writeFile(filePath, JSON.stringify(components, null, 2), "utf8");
  return NextResponse.json(components);
}
