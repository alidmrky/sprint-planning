import { promises as fs } from "fs";
import path from "path";
import { Holiday } from "./types";

const HOLIDAYS_PATH = path.join(process.cwd(), "data", "holidays.json");

export async function readHolidays(): Promise<Holiday[]> {
  const content = await fs.readFile(HOLIDAYS_PATH, "utf8");
  return JSON.parse(content) as Holiday[];
}

export async function writeHolidays(items: Holiday[]): Promise<void> {
  await fs.writeFile(HOLIDAYS_PATH, JSON.stringify(items, null, 2), "utf8");
}

export async function upsertHoliday(item: Holiday): Promise<Holiday[]> {
  const list = await readHolidays();
  const idx = list.findIndex(h => h.id === item.id);
  if (idx >= 0) list[idx] = item; else list.push(item);
  await writeHolidays(list);
  return list;
}

export async function deleteHoliday(id: string): Promise<Holiday[]> {
  const list = await readHolidays();
  const next = list.filter(h => h.id !== id);
  await writeHolidays(next);
  return next;
}


