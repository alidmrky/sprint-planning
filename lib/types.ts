export type Person = {
  id: string; // GUID/UUID
  firstName: string;
  lastName: string;
  role: string;
  ldap: string;
};

export type AppConfig = {
  dailyPlanningHour: string; // HH:mm
  people: Person[];
};

export type Sprint = {
  id: string;
  name: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;   // ISO yyyy-mm-dd
  status?: "Kaydedildi" | "Planlanıyor" | "Tamamlandı";
};

export type Holiday = {
  id: string;
  name: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;   // ISO yyyy-mm-dd
};

export type SprintPlanningTask = {
  id: string;
  taskName: string;
  sp: number;
  sprintEndTarget: string;
  currentStatus: string;
  responsibleAnalyst: string[];
  responsibleDeveloper: string[];
  delayReason: string;
  analysisCost: number;
  softwareCost: number;
  analysisTaskSP: number;
  softwareTaskSP: number;
  testTaskSP: number;
  component: string;
};

export type PersonLeave = {
  id: string;
  personId: string;
  type: string; // "İzin" | "Eğitim"
  hours: number;
  description: string;
};

export type SprintPlanningData = {
  tasks: SprintPlanningTask[];
  personLeaves: PersonLeave[];
};


