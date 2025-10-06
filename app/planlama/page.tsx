"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { PlanningGrid } from "@/components/PlanningGrid";

type Sprint = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: "Kaydedildi" | "Planlanıyor" | "Tamamlandı";
};

export default function PlanlamaPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showPlanningGrid, setShowPlanningGrid] = useState(false);
  const [people, setPeople] = useState<{ id: string; firstName: string; lastName: string; role: string }[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    (async () => {
      const [sRes, pRes] = await Promise.all([
        fetch("/api/sprints", { cache: "no-store" }),
        fetch("/api/people", { cache: "no-store" })
      ]);
      const all = (await sRes.json()) as Sprint[];
      const peopleData = (await pRes.json()) as { id: string; firstName: string; lastName: string; role: string }[];
      // Tamamlandı olmayanlar
      const filtered = all.filter(s => s.status !== "Tamamlandı");
      setSprints(filtered);
      setPeople(peopleData);
      setLoading(false);
    })();
  }, []);

  async function startPlanning() {
    if (!selectedId) return alert("Önce bir sprint seçin");
    
    // Sprint statüsünü "Planlanıyor" olarak güncelle
    const selectedSprint = sprints.find(s => s.id === selectedId);
    if (!selectedSprint) return;
    
    const updatedSprint = { ...selectedSprint, status: "Planlanıyor" as const };
    await fetch("/api/sprints", { method: "PUT", body: JSON.stringify(updatedSprint) });

    // Planlama JSON dosyasını başlat (yoksa oluştur)
    await fetch(`/api/sprint-planning/${selectedId}`, { method: "PUT" });
    
    // Sprint listesini güncelle
    const res = await fetch("/api/sprints", { cache: "no-store" });
    const all = (await res.json()) as Sprint[];
    const filtered = all.filter(s => s.status !== "Tamamlandı");
    setSprints(filtered);
    
    // Planlama grid'ini göster
    setShowPlanningGrid(true);
  }

  if (loading) return <div>Yükleniyor…</div>;

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("planning.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("planning.subtitle")}</p>
      </header>

      <section className="flex items-center gap-3">
        <select
          className="border rounded-md px-3 py-2 min-w-64"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">{t("planning.selectSprint")}</option>
          {sprints.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.startDate} → {s.endDate})</option>
          ))}
        </select>
        <Button onClick={startPlanning} disabled={!selectedId}>{t("planning.start")}</Button>
      </section>

      {showPlanningGrid && selectedId && (
        <PlanningGrid
          sprintId={selectedId}
          people={people}
          sprintEndTargets={["Geliştirme", "Tamamlama", "Test Tamamlama", "Analiz Tamamlama"]}
          components={["Roadmap_Torus", "Teknik RoadMap_Torus", "Kaizen_Torus", "Problem_Torus"]}
          sprintHours={120} // Bu değer sprint hesaplamasından gelecek
        />
      )}
    </div>
  );
}


