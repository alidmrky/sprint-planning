import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { SprintPlanningTask, SprintPlanningData, PersonLeave } from "@/lib/types";

const fileFor = (sprintId: string) => path.join(process.cwd(), "data", `sprintPlanning${sprintId}.json`);

export async function GET(request: Request, { params }: { params: { sprintId: string } }) {
  const filePath = fileFor(params.sprintId);
  try {
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content);
    
    // Eğer data.tasks array'i varsa ve dolu ise onu döndür
    if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
      return NextResponse.json(data.tasks);
    }
    
    // Eğer task'lar "0", "1", "2" gibi key'ler altında saklanmışsa onları array'e çevir
    const tasks = [];
    for (const key in data) {
      if (key !== "tasks" && key !== "personLeaves" && typeof data[key] === "object" && data[key].id) {
        tasks.push(data[key]);
      }
    }
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error reading sprint planning file:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request, { params }: { params: { sprintId: string } }) {
  const tasks = (await request.json()) as SprintPlanningTask[];
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
    tasks
  };
  
  await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), "utf8");
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: { sprintId: string } }) {
  const filePath = fileFor(params.sprintId);
  try {
    await fs.access(filePath);
  } catch {
    // initialize with empty data structure
    const initialData: SprintPlanningData = { tasks: [], personLeaves: [] };
    await fs.writeFile(filePath, JSON.stringify(initialData, null, 2), "utf8");
  }
  return NextResponse.json({ initialized: true });
}
