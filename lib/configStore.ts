import { promises as fs } from "fs";
import path from "path";
import { AppConfig, Person } from "./types";

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json");

export async function readConfig(): Promise<AppConfig> {
  const content = await fs.readFile(CONFIG_PATH, "utf8");
  return JSON.parse(content) as AppConfig;
}

export async function writeConfig(config: AppConfig): Promise<void> {
  const json = JSON.stringify(config, null, 2);
  await fs.writeFile(CONFIG_PATH, json, "utf8");
}

export async function upsertPerson(person: Person): Promise<AppConfig> {
  const config = await readConfig();
  const idx = config.people.findIndex(p => p.id === person.id);
  if (idx >= 0) {
    config.people[idx] = person;
  } else {
    config.people.push(person);
  }
  await writeConfig(config);
  return config;
}

export async function deletePerson(id: string): Promise<AppConfig> {
  const config = await readConfig();
  const next = { ...config, people: config.people.filter(p => p.id !== id) };
  await writeConfig(next);
  return next;
}


