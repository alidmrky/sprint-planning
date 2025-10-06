import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { SprintPlanningData, PersonLeave } from "@/lib/types";

const fileFor = (sprintId: string) => path.join(process.cwd(), "data", `sprintPlanning${sprintId}.json`);

export async function GET(request: Request, { params }: { params: { sprintId: string } }) {
  const filePath = fileFor(params.sprintId);
  try {
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content) as SprintPlanningData;
    return NextResponse.json(data.personLeaves || []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request, { params }: { params: { sprintId: string } }) {
  const personLeaves = (await request.json()) as PersonLeave[];
  const filePath = fileFor(params.sprintId);
  
  // Load existing data or create new
  let existingData: SprintPlanningData = { tasks: [], personLeaves: [] };
  try {
    const content = await fs.readFile(filePath, "utf8");
    existingData = JSON.parse(content) as SprintPlanningData;
  } catch {
    // File doesn't exist, use default
  }
  
  const updatedData: SprintPlanningData = {
    ...existingData,
    personLeaves
  };
  
  await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), "utf8");
  return NextResponse.json({ success: true });
}
