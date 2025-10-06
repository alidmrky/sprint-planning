"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import Select from "react-select";
import { useI18n } from "@/lib/i18n";

type SprintPlanningTask = {
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

type PlanningGridProps = {
  sprintId: string;
  people: { id: string; firstName: string; lastName: string; role: string }[];
  sprintHours: number;
};

export function PlanningGrid({ sprintId, people, sprintHours }: PlanningGridProps) {
  const [tasks, setTasks] = useState<SprintPlanningTask[]>([]);
  const [personLeaves, setPersonLeaves] = useState<{ id: string; personId: string; type: string; hours: number; description: string }[]>([]);
  const [components, setComponents] = useState<string[]>([]);
  const [sprintEndTargets, setSprintEndTargets] = useState<string[]>([]);
  const [currentStatuses, setCurrentStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"planning" | "leaves">("planning");
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const loadPlanningData = async () => {
      try {
        const [tasksRes, leavesRes, componentsRes, targetsRes, statusesRes] = await Promise.all([
          fetch(`/api/sprint-planning/${sprintId}`, { cache: "no-store" }),
          fetch(`/api/sprint-planning/${sprintId}/leaves`, { cache: "no-store" }),
          fetch(`/api/components`, { cache: "no-store" }),
          fetch(`/api/sprint-end-targets`, { cache: "no-store" }),
          fetch(`/api/current-statuses`, { cache: "no-store" })
        ]);
        
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        } else {
          setTasks([]);
        }
        
        if (leavesRes.ok) {
          const leavesData = await leavesRes.json();
          setPersonLeaves(leavesData);
        } else {
          setPersonLeaves([]);
        }

        if (componentsRes.ok) {
          const componentsData = await componentsRes.json();
          setComponents(componentsData);
        } else {
          setComponents([]);
        }

        if (targetsRes.ok) {
          const targetsData = await targetsRes.json();
          setSprintEndTargets(targetsData);
        } else {
          setSprintEndTargets([]);
        }

        if (statusesRes.ok) {
          const statusesData = await statusesRes.json();
          setCurrentStatuses(statusesData);
        } else {
          setCurrentStatuses([]);
        }
      } catch (error) {
        console.error("Error loading planning data:", error);
        setTasks([]);
        setPersonLeaves([]);
        setComponents([]);
        setSprintEndTargets([]);
        setCurrentStatuses([]);
      } finally {
        setLoading(false);
      }
    };
    loadPlanningData();
  }, [sprintId]);

  // Debounced autosave whenever tasks change
  useEffect(() => {
    if (loading) return; // avoid initial load save
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await fetch(`/api/sprint-planning/${sprintId}`, {
        method: "POST",
        body: JSON.stringify(tasks),
      });
      setSaving(false);
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [tasks, sprintId, loading]);

  function addTask() {
    const newTask: SprintPlanningTask = {
      id: uuidv4(),
      taskName: "",
      sp: 0,
      sprintEndTarget: "",
      currentStatus: "Başlanmadı",
      responsibleAnalyst: [],
      responsibleDeveloper: [],
      delayReason: "",
      analysisCost: 0,
      softwareCost: 0,
      analysisTaskSP: 0,
      softwareTaskSP: 0,
      testTaskSP: 0,
      component: "",
    };
    setTasks(prev => [...prev, newTask]);
  }

  function updateTask(id: string, field: keyof SprintPlanningTask, value: string | number | string[]) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  function removeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const analysts = people.filter(p => p.role === "Analist").map(p => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`
  }));
  const developers = people.filter(p => p.role === "Developer").map(p => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`
  }));

  if (loading) return <div>Yükleniyor…</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[80%_20%] gap-6">
      {/* Sol taraf - Tablar */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "planning"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("planning")}
            >
              {t("tabs.planning")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "leaves"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("leaves")}
            >
              {t("tabs.leaves")}
            </button>
        </div>

        {/* Tab Content */}
        {activeTab === "planning" && (
          <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{t("tabs.planning")}</h3>
                  <div className="flex items-center gap-3">
                    {saving && <span className="text-xs text-muted-foreground">{t("grid.saving")}</span>}
                    {!saving && <span className="text-xs text-muted-foreground">{t("grid.autoSaving")}</span>}
                    <Button onClick={addTask}>{t("grid.newTask")}</Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse min-w-[2000px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 border-r min-w-[200px]">{t("grid.taskName")}</th>
                        <th className="text-left p-2 border-r min-w-[80px]">{t("grid.sp")}</th>
                        <th className="text-left p-2 border-r min-w-[180px]">{t("grid.sprintEndTarget")}</th>
                        <th className="text-left p-2 border-r min-w-[140px]">{t("grid.currentStatus")}</th>
                        <th className="text-left p-2 border-r min-w-[250px]">{t("grid.responsibleAnalyst")}</th>
                        <th className="text-left p-2 border-r min-w-[250px]">{t("grid.responsibleDeveloper")}</th>
                        <th className="text-left p-2 border-r min-w-[180px]">{t("grid.delayReason")}</th>
                        <th className="text-left p-2 border-r min-w-[100px]">{t("grid.analysisCost")}</th>
                        <th className="text-left p-2 border-r min-w-[100px]">{t("grid.softwareCost")}</th>
                        <th className="text-left p-2 border-r min-w-[100px]">{t("grid.analysisTaskSP")}</th>
                        <th className="text-left p-2 border-r min-w-[100px]">{t("grid.softwareTaskSP")}</th>
                        <th className="text-left p-2 border-r min-w-[100px]">{t("grid.testTaskSP")}</th>
                        <th className="text-left p-2 border-r min-w-[180px]">{t("grid.component")}</th>
                        <th className="text-left p-2 min-w-[80px]">{t("grid.actions")}</th>
                      </tr>
                    </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="border-b">
                      <td className="p-2 border-r min-w-[200px]">
                        <input
                          className="w-full border rounded px-2 py-1"
                          value={task.taskName}
                          onChange={(e) => updateTask(task.id, "taskName", e.target.value)}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[80px]">
                        <input
                          type="number"
                          step="0.1"
                          className="w-full border rounded px-2 py-1"
                          value={task.sp}
                          onChange={(e) => updateTask(task.id, "sp", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[180px]">
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={task.sprintEndTarget}
                          onChange={(e) => updateTask(task.id, "sprintEndTarget", e.target.value)}
                        >
                          <option value="">{t("grid.selectTarget")}</option>
                          {sprintEndTargets.map(target => (
                            <option key={target} value={target}>{target}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 border-r min-w-[140px]">
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={task.currentStatus}
                          onChange={(e) => updateTask(task.id, "currentStatus", e.target.value)}
                        >
                          <option value="">{t("grid.selectTarget")}</option>
                          {currentStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 border-r min-w-[200px]">
                        <Select
                          isMulti
                          options={analysts}
                          value={analysts.filter(analyst => task.responsibleAnalyst.includes(analyst.value))}
                          onChange={(selectedOptions) => {
                            const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                            updateTask(task.id, "responsibleAnalyst", values);
                          }}
                          placeholder={t("grid.selectAnalyst")}
                          className="text-sm"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '32px',
                              fontSize: '14px'
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              padding: '2px 8px'
                            }),
                            input: (base) => ({
                              ...base,
                              margin: '0px'
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999
                            })
                          }}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[200px]">
                        <Select
                          isMulti
                          options={developers}
                          value={developers.filter(developer => task.responsibleDeveloper.includes(developer.value))}
                          onChange={(selectedOptions) => {
                            const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                            updateTask(task.id, "responsibleDeveloper", values);
                          }}
                          placeholder={t("grid.selectDeveloper")}
                          className="text-sm"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '32px',
                              fontSize: '14px'
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              padding: '2px 8px'
                            }),
                            input: (base) => ({
                              ...base,
                              margin: '0px'
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999
                            })
                          }}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[180px]">
                        <input
                          className="w-full border rounded px-2 py-1"
                          value={task.delayReason}
                          onChange={(e) => updateTask(task.id, "delayReason", e.target.value)}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[100px]">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full border rounded px-2 py-1"
                          value={task.analysisCost}
                          onChange={(e) => updateTask(task.id, "analysisCost", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[100px]">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full border rounded px-2 py-1"
                          value={task.softwareCost}
                          onChange={(e) => updateTask(task.id, "softwareCost", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[100px]">
                        <input
                          type="number"
                          step="0.1"
                          className="w-full border rounded px-2 py-1"
                          value={task.analysisTaskSP}
                          onChange={(e) => updateTask(task.id, "analysisTaskSP", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[100px]">
                        <input
                          type="number"
                          step="0.1"
                          className="w-full border rounded px-2 py-1"
                          value={task.softwareTaskSP}
                          onChange={(e) => updateTask(task.id, "softwareTaskSP", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[100px]">
                        <input
                          type="number"
                          step="0.1"
                          className="w-full border rounded px-2 py-1"
                          value={task.testTaskSP}
                          onChange={(e) => updateTask(task.id, "testTaskSP", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-2 border-r min-w-[180px]">
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={task.component}
                          onChange={(e) => updateTask(task.id, "component", e.target.value)}
                        >
                          <option value="">{t("grid.selectComponent")}</option>
                          {components.map(comp => (
                            <option key={comp} value={comp}>{comp}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 min-w-[80px]">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTask(task.id)}
                        >{t("grid.delete")}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "leaves" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t("leaves.title")}</h3>
              <Button onClick={() => {
                const newLeave = {
                  id: uuidv4(),
                  personId: "",
                  type: "İzin",
                  hours: 0,
                  description: ""
                };
                setPersonLeaves([...personLeaves, newLeave]);
              }} size="sm">{t("leaves.add")}</Button>
            </div>
            
            <div className="space-y-3">
              {personLeaves.map(leave => (
                <div key={leave.id} className="border rounded p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("leaves.person")}</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={leave.personId}
                        onChange={(e) => {
                          const updatedLeaves = personLeaves.map(l => 
                            l.id === leave.id ? { ...l, personId: e.target.value } : l
                          );
                          setPersonLeaves(updatedLeaves);
                        }}
                      >
                        <option value="">{t("leaves.selectPerson")}</option>
                        {people.map(person => (
                          <option key={person.id} value={person.id}>
                            {person.firstName} {person.lastName} ({person.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("leaves.type")}</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={leave.type}
                        onChange={(e) => {
                          const updatedLeaves = personLeaves.map(l => 
                            l.id === leave.id ? { ...l, type: e.target.value } : l
                          );
                          setPersonLeaves(updatedLeaves);
                        }}
                      >
                        <option value="İzin">{t("leaves.type.leave")}</option>
                        <option value="Eğitim">{t("leaves.type.training")}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("leaves.hours")}</label>
                      <input
                        type="number"
                        className="w-full border rounded px-3 py-2"
                        value={leave.hours}
                        onChange={(e) => {
                          const updatedLeaves = personLeaves.map(l => 
                            l.id === leave.id ? { ...l, hours: parseFloat(e.target.value) || 0 } : l
                          );
                          setPersonLeaves(updatedLeaves);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("leaves.description")}</label>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={leave.description}
                        onChange={(e) => {
                          const updatedLeaves = personLeaves.map(l => 
                            l.id === leave.id ? { ...l, description: e.target.value } : l
                          );
                          setPersonLeaves(updatedLeaves);
                        }}
                        placeholder={t("leaves.description")}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setPersonLeaves(personLeaves.filter(l => l.id !== leave.id));
                      }}
                    >
                      {t("grid.delete")}
                    </Button>
                  </div>
                </div>
              ))}
              
              {personLeaves.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  {t("leaves.noRecords")}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={async () => {
                await fetch(`/api/sprint-planning/${sprintId}/leaves`, {
                  method: "POST",
                  body: JSON.stringify(personLeaves),
                });
                alert(t("leaves.saved"));
              }}>{t("leaves.save")}</Button>
            </div>
          </div>
        )}
      </div>

      {/* Sağ taraf - Kalan Eforlar */}
      <div className="lg:sticky lg:top-4 h-max">
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="text-lg font-semibold mb-4">{t("remainingEfforts.title")}</h3>
          <div className="space-y-3">
            {people.map(person => {
              const assignedTasks = tasks.filter(task => 
                task.responsibleAnalyst.includes(person.id) || 
                task.responsibleDeveloper.includes(person.id)
              );
              
              const plannedHours = assignedTasks.reduce((total, task) => {
                let taskHours = 0;
                if (task.responsibleAnalyst.includes(person.id)) {
                  taskHours += task.analysisCost;
                }
                if (task.responsibleDeveloper.includes(person.id)) {
                  taskHours += task.softwareCost;
                }
                return total + taskHours;
              }, 0);
              
              // Bu kişinin izin/eğitim saatleri
              const leaveHours = personLeaves
                .filter(leave => leave.personId === person.id)
                .reduce((total, leave) => total + leave.hours, 0);
              
              const remainingHours = sprintHours - plannedHours - leaveHours;
              const progressPercentage = ((plannedHours + leaveHours) / sprintHours) * 100;
              
              return (
                <div key={person.id} className="border rounded p-3 bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">
                      {person.firstName} {person.lastName}
                    </span>
                    <span className={`text-sm font-medium ${
                      remainingHours >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {remainingHours}h
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("remainingEfforts.planned")}: {plannedHours}h</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    {leaveHours > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {t("remainingEfforts.leaveTraining")}: {leaveHours}h
                      </div>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progressPercentage > 100 ? "bg-red-500" : 
                          progressPercentage > 80 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("remainingEfforts.sprint")}: {sprintHours}h
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
