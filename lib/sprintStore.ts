import { promises as fs } from "fs";
import path from "path";
import { Sprint } from "./types";

const SPRINTS_PATH = path.join(process.cwd(), "data", "sprints.json");

export async function readSprints(): Promise<Sprint[]> {
  const content = await fs.readFile(SPRINTS_PATH, "utf8");
  return JSON.parse(content) as Sprint[];
}

export async function writeSprints(sprints: Sprint[]): Promise<void> {
  await fs.writeFile(SPRINTS_PATH, JSON.stringify(sprints, null, 2), "utf8");
}

export async function upsertSprint(sprint: Sprint): Promise<Sprint[]> {
  const list = await readSprints();
  const idx = list.findIndex(s => s.id === sprint.id);
  const withStatus: Sprint = { status: "Kaydedildi", ...sprint };
  if (idx >= 0) list[idx] = { ...list[idx], ...withStatus }; else list.push(withStatus);
  await writeSprints(list);
  return list;
}

export async function deleteSprint(id: string): Promise<Sprint[]> {
  const list = await readSprints();
  const next = list.filter(s => s.id !== id);
  await writeSprints(next);
  return next;
}


