"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";

type Sprint = {
  id: string;
  name: string;
  startDate: string; // yyyy-mm-dd
  endDate: string;   // yyyy-mm-dd
  status?: "Kaydedildi";
};

type AppConfig = {
  dailyPlanningHour: string; // HH:mm
};

function parseHours(hourStr: string): number {
  const [h, m] = hourStr.split(":" ).map(Number);
  return h + (m || 0) / 60;
}

function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6; // Sun=0, Sat=6
}

function eachBusinessDayInclusive(startISO: string, endISO: string): number {
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  if (end < start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (!isWeekend(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function businessDaysExcludingHolidays(startISO: string, endISO: string, holidayDates: Set<string>): number {
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  if (end < start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    if (!isWeekend(cur) && !holidayDates.has(iso)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function SprintlerPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [configHour, setConfigHour] = useState<string>("08:00");
  const [draft, setDraft] = useState<Sprint>({ id: uuidv4(), name: "", startDate: "", endDate: "" });
  const [holidays, setHolidays] = useState<{ id: string; name: string; startDate: string; endDate: string }[]>([]);
  const [includeHolidays, setIncludeHolidays] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const [sRes, cRes, hRes] = await Promise.all([
        fetch("/api/sprints", { cache: "no-store" }),
        fetch("/api/config", { cache: "no-store" }),
        fetch("/api/holidays", { cache: "no-store" })
      ]);
      const list = (await sRes.json()) as Sprint[];
      const cfg = (await cRes.json()) as { dailyPlanningHour: string };
      const hol = (await hRes.json()) as { id: string; name: string; startDate: string; endDate: string }[];
      setSprints(list);
      setConfigHour(cfg.dailyPlanningHour);
      setHolidays(hol);
    })();
  }, []);

  const hoursPerDay = useMemo(() => parseHours(configHour), [configHour]);

  async function addSprint() {
    if (!draft.name.trim() || !draft.startDate || !draft.endDate) return alert("Tüm alanlar zorunlu");
    const list = (await (await fetch("/api/sprints", { method: "POST", body: JSON.stringify(draft) })).json()) as Sprint[];
    setSprints(list);
    setDraft({ id: uuidv4(), name: "", startDate: "", endDate: "" });
  }

  function expandHolidayDates(hs: { startDate: string; endDate: string }[]): string[] {
    const dates: string[] = [];
    for (const h of hs) {
      const start = new Date(h.startDate + "T00:00:00");
      const end = new Date(h.endDate + "T00:00:00");
      const cur = new Date(start);
      while (cur <= end) {
        // Hafta sonları zaten iş günü hesabından çıkarıldığı için SET'e eklemiyoruz
        if (!isWeekend(cur)) {
          const iso = new Date(Date.UTC(cur.getFullYear(), cur.getMonth(), cur.getDate())).toISOString().slice(0,10);
          dates.push(iso);
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return dates;
  }

  function plannedHoursForSprint(s: Sprint): number {
    const holidaySet = new Set(includeHolidays ? [] : expandHolidayDates(holidays));
    const businessDays = includeHolidays
      ? eachBusinessDayInclusive(s.startDate, s.endDate)
      : businessDaysExcludingHolidays(s.startDate, s.endDate, holidaySet);
    return businessDays * hoursPerDay;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Sprintler</h1>
        <p className="text-sm text-muted-foreground">Tarih aralığına göre iş günü sayısı ve planlama saati hesaplanır.</p>
      </header>

      <section className="border rounded-md p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="border rounded-md px-3 py-2" placeholder="Sprint adı" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input className="border rounded-md px-3 py-2" type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
          <input className="border rounded-md px-3 py-2" type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
          <Button onClick={addSprint}>Ekle</Button>
        </div>
        <div className="text-xs text-muted-foreground">Günlük planlama saati: {configHour} (Konfigürasyonlar sayfasından değiştirilebilir)</div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[80%_20%] gap-6">
        <div className="w-full">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_.8fr_1fr_.8fr_.6fr] text-xs font-medium text-muted-foreground px-2">
            <div>Ad</div>
            <div>Başlangıç</div>
            <div>Bitiş</div>
            <div>İş Günü</div>
            <div>Planlanan Saat</div>
            <div>Statü</div>
            <div className="text-right pr-2">İşlemler</div>
          </div>
          <div className="mt-2 divide-y rounded-md border bg-card">
            {sprints.map(s => {
            const holidaySet = new Set(includeHolidays ? [] : expandHolidayDates(holidays));
            const businessDays = includeHolidays
              ? eachBusinessDayInclusive(s.startDate, s.endDate)
              : businessDaysExcludingHolidays(s.startDate, s.endDate, holidaySet);
            const hours = plannedHoursForSprint(s);
              return (
                <div key={s.id} className="grid grid-cols-[1.2fr_1fr_1fr_.8fr_1fr_.8fr_.6fr] items-center px-2 py-3 text-sm">
                  <div className="font-medium">{s.name}</div>
                  <div>{s.startDate}</div>
                  <div>{s.endDate}</div>
                  <div>{businessDays}</div>
                  <div>{hours}</div>
                  <div>{s.status ?? "Kaydedildi"}</div>
                  <div className="text-right pr-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={(s.status ?? "Kaydedildi") !== "Kaydedildi"}
                      onClick={async () => {
                        const res = await fetch(`/api/sprints?id=${encodeURIComponent(s.id)}`, { method: "DELETE" });
                        if (!res.ok) return alert("Sadece Kaydedildi durumunda silinebilir.");
                        const list = await res.json();
                        setSprints(list);
                      }}
                    >Sil</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="lg:sticky lg:top-4 h-max border rounded-md p-4 space-y-4 bg-card/50">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Resmi Tatiller (Yalnızca Görüntüleme)</h3>
            <label className="text-xs flex items-center gap-2">
              <input type="checkbox" checked={includeHolidays} onChange={(e) => setIncludeHolidays(e.target.checked)} />
              Tatilleri iş gününden çıkarma
            </label>
          </div>
          <div className="rounded-md border overflow-hidden">
            <div className="grid grid-cols-7 text-xs font-medium bg-muted/60">
              {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(d => (
                <div key={d} className="px-2 py-1 text-center">{d}</div>
              ))}
            </div>
            <div className="p-2 grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }).map((_, i) => {
                const today = new Date();
                const first = new Date(today.getFullYear(), today.getMonth(), 1);
                const startIdx = (first.getDay() + 6) % 7;
                const date = new Date(today.getFullYear(), today.getMonth(), i - startIdx + 1);
                // Yerel saat farklarından kaynaklı 1 gün kaymayı önlemek için UTC normalize ediyoruz
                const iso = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0,10);
                const isCurrentMonth = date.getMonth() === today.getMonth();
                const isHoliday = holidays.some(h => {
                  const start = h.startDate;
                  const end = h.endDate;
                  return iso >= start && iso <= end;
                });
                return (
                  <div key={i} className={`h-9 rounded-md flex items-center justify-center text-xs border ${isCurrentMonth ? '' : 'opacity-40'} ${isHoliday ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200' : ''}`}>
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Tatil ekleme/silme Konfigürasyonlar sayfasından yapılır.</div>
        </aside>
      </section>
    </div>
  );
}


