"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { SprintPlanningTask, PersonLeave } from "@/lib/types";

type PlanningCardsProps = {
  sprintId: string;
  sprintHours: number; // Sprint toplam saat
  people: { id: string; firstName: string; lastName: string; role: string }[];
};

export function PlanningCards({ sprintId, sprintHours, people }: PlanningCardsProps) {
  const [tasks, setTasks] = useState<SprintPlanningTask[]>([]);
  const [personLeaves, setPersonLeaves] = useState<PersonLeave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlanningData();
  }, [sprintId]);

  async function loadPlanningData() {
    try {
      const res = await fetch(`/api/sprint-planning/${sprintId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setPersonLeaves(data.personLeaves || []);
      }
    } catch (error) {
      console.error("Error loading planning data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function savePersonLeaves() {
    await fetch(`/api/sprint-planning/${sprintId}/leaves`, {
      method: "POST",
      body: JSON.stringify(personLeaves),
    });
  }

  function addPersonLeave() {
    const newLeave: PersonLeave = {
      id: uuidv4(),
      personId: "",
      type: "İzin",
      hours: 0,
      description: "",
    };
    setPersonLeaves([...personLeaves, newLeave]);
  }

  function updatePersonLeave(id: string, field: keyof PersonLeave, value: string | number) {
    setPersonLeaves(personLeaves.map(l => l.id === id ? { ...l, [field]: value } : l));
  }

  function removePersonLeave(id: string) {
    setPersonLeaves(personLeaves.filter(l => l.id !== id));
  }

  // Hesaplamalar
  const activeTasks = tasks.filter(t => t.currentStatus !== "HOLD");
  
  // Her kişi için hesaplama
  const personCalculations = people.map(person => {
    // Bu kişiye atanmış task'lar
    const assignedTasks = activeTasks.filter(task => 
      task.responsibleAnalyst.includes(person.id) || 
      task.responsibleDeveloper.includes(person.id)
    );
    
    // Bu kişinin planlanan saatleri
    const plannedHours = assignedTasks.reduce((total, task) => {
      let taskHours = 0;
      
      // Analist olarak atanmışsa analiz maliyeti
      if (task.responsibleAnalyst.includes(person.id)) {
        taskHours += task.analysisCost;
      }
      
      // Developer olarak atanmışsa yazılım maliyeti
      if (task.responsibleDeveloper.includes(person.id)) {
        taskHours += task.softwareCost;
      }
      
      return total + taskHours;
    }, 0);
    
    // Bu kişinin izin/eğitim saatleri
    const leaveHours = personLeaves
      .filter(leave => leave.personId === person.id)
      .reduce((total, leave) => total + leave.hours, 0);
    
    // Bu kişinin kalan saatleri
    const remainingHours = sprintHours - plannedHours - leaveHours;
    
    return {
      person,
      plannedHours,
      leaveHours,
      remainingHours
    };
  });


  if (loading) return <div>Yükleniyor…</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Kalan Eforlar Card */}
      <div className="border rounded-lg p-6 bg-card">
        <h3 className="text-lg font-semibold mb-4">Kalan Eforlar</h3>
        <div className="space-y-4">
          {/* Kişi Bazında Detay */}
          <div>
            <h4 className="text-sm font-medium mb-3">Kişi Bazında Detay</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {personCalculations.map(calc => (
                <div key={calc.person.id} className="border rounded p-3 bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">
                      {calc.person.firstName} {calc.person.lastName} ({calc.person.role})
                    </span>
                    <span className={`text-sm font-medium ${
                      calc.remainingHours >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {calc.remainingHours} saat kaldı
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Planlanan: {calc.plannedHours}h</div>
                    <div>İzin/Eğitim: {calc.leaveHours}h</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* İzin/Eğitim Card */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">İzin/Eğitim Yönetimi</h3>
          <Button onClick={addPersonLeave} size="sm">Ekle</Button>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {personLeaves.map(leave => (
            <div key={leave.id} className="border rounded p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={leave.personId}
                  onChange={(e) => updatePersonLeave(leave.id, "personId", e.target.value)}
                >
                  <option value="">Kişi Seçin</option>
                  {people.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName} ({person.role})
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={leave.type}
                  onChange={(e) => updatePersonLeave(leave.id, "type", e.target.value)}
                >
                  <option value="İzin">İzin</option>
                  <option value="Eğitim">Eğitim</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="Saat"
                  value={leave.hours}
                  onChange={(e) => updatePersonLeave(leave.id, "hours", parseFloat(e.target.value) || 0)}
                />
                <input
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="Açıklama"
                  value={leave.description}
                  onChange={(e) => updatePersonLeave(leave.id, "description", e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removePersonLeave(leave.id)}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={savePersonLeaves} size="sm">Kaydet</Button>
        </div>
      </div>
    </div>
  );
}
