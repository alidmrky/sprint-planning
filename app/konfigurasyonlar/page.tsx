"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateRangePicker } from "@/components/ui/date-range-picker";

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  ldap: string;
};

type AppConfig = {
  dailyPlanningHour: string;
  people: Person[];
};

export default function KonfigurasyonlarPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig>({ dailyPlanningHour: "09:00", people: [] });
  const [editing, setEditing] = useState<Person | null>(null);
  const [showDelete, setShowDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const roles = ["Analist", "Developer"] as const;
  const [holidays, setHolidays] = useState<{ id: string; name: string; startDate: string; endDate: string }[]>([]);
  const [newHoliday, setNewHoliday] = useState<{ name: string; startDate: string; endDate: string }>({ name: "", startDate: "", endDate: "" });
  const [components, setComponents] = useState<string[]>([]);
  const [newComponent, setNewComponent] = useState<string>("");
  const [sprintEndTargets, setSprintEndTargets] = useState<string[]>([]);
  const [newSprintEndTarget, setNewSprintEndTarget] = useState<string>("");
  const [currentStatuses, setCurrentStatuses] = useState<string[]>([]);
  const [newCurrentStatus, setNewCurrentStatus] = useState<string>("");

  useEffect(() => {
    (async () => {
      const [cfgRes, holRes, compRes, targetsRes, statusesRes] = await Promise.all([
        fetch("/api/config", { cache: "no-store" }),
        fetch("/api/holidays", { cache: "no-store" }),
        fetch("/api/components", { cache: "no-store" }),
        fetch("/api/sprint-end-targets", { cache: "no-store" }),
        fetch("/api/current-statuses", { cache: "no-store" })
      ]);
      const data = (await cfgRes.json()) as AppConfig;
      const hol = (await holRes.json()) as { id: string; name: string; startDate: string; endDate: string }[];
      const comp = (await compRes.json()) as string[];
      const targets = (await targetsRes.json()) as string[];
      const statuses = (await statusesRes.json()) as string[];
      setConfig(data);
      setHolidays(hol);
      setComponents(comp);
      setSprintEndTargets(targets);
      setCurrentStatuses(statuses);
      setLoading(false);
    })();
  }, []);

  async function saveHour(hour: string) {
    const next = { ...config, dailyPlanningHour: hour };
    setConfig(next);
    await fetch("/api/config", { method: "PUT", body: JSON.stringify(next) });
  }

  function validate(person: Person): string | null {
    if (!person.firstName?.trim()) return "İsim zorunlu";
    if (!person.lastName?.trim()) return "Soyisim zorunlu";
    if (!roles.includes(person.role as any)) return "Rol geçersiz";
    if (!person.ldap?.trim()) return "LDAP zorunlu";
    return null;
  }

  async function createOrUpdatePerson(person: Person) {
    const error = validate(person);
    if (error) {
      alert(error);
      return;
    }
    if (config.people.some(p => p.id === person.id)) {
      await fetch("/api/people", { method: "PUT", body: JSON.stringify(person) });
    } else {
      await fetch("/api/people", { method: "POST", body: JSON.stringify(person) });
    }
    const res = await fetch("/api/people", { cache: "no-store" });
    const people = (await res.json()) as Person[];
    setConfig(prev => ({ ...prev, people }));
    setEditing(null);
  }

  async function removePerson(id: string) {
    await fetch(`/api/people?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setConfig(prev => ({ ...prev, people: prev.people.filter(p => p.id !== id) }));
  }

  async function addComponent() {
    if (!newComponent.trim()) return alert("Component adı zorunlu");
    if (components.includes(newComponent.trim())) return alert("Bu component zaten mevcut");
    
    const updatedComponents = [...components, newComponent.trim()];
    await fetch("/api/components", { method: "POST", body: JSON.stringify(updatedComponents) });
    setComponents(updatedComponents);
    setNewComponent("");
  }

  async function removeComponent(component: string) {
    const updatedComponents = components.filter(c => c !== component);
    await fetch("/api/components", { method: "POST", body: JSON.stringify(updatedComponents) });
    setComponents(updatedComponents);
  }

  async function addSprintEndTarget() {
    if (!newSprintEndTarget.trim()) return alert("Sprint End Target adı zorunlu");
    if (sprintEndTargets.includes(newSprintEndTarget.trim())) return alert("Bu Sprint End Target zaten mevcut");
    
    const updatedTargets = [...sprintEndTargets, newSprintEndTarget.trim()];
    await fetch("/api/sprint-end-targets", { method: "POST", body: JSON.stringify(updatedTargets) });
    setSprintEndTargets(updatedTargets);
    setNewSprintEndTarget("");
  }

  async function removeSprintEndTarget(target: string) {
    const updatedTargets = sprintEndTargets.filter(t => t !== target);
    await fetch("/api/sprint-end-targets", { method: "POST", body: JSON.stringify(updatedTargets) });
    setSprintEndTargets(updatedTargets);
  }

  async function addCurrentStatus() {
    if (!newCurrentStatus.trim()) return alert("Current Status adı zorunlu");
    if (currentStatuses.includes(newCurrentStatus.trim())) return alert("Bu Current Status zaten mevcut");
    
    const updatedStatuses = [...currentStatuses, newCurrentStatus.trim()];
    await fetch("/api/current-statuses", { method: "POST", body: JSON.stringify(updatedStatuses) });
    setCurrentStatuses(updatedStatuses);
    setNewCurrentStatus("");
  }

  async function removeCurrentStatus(status: string) {
    const updatedStatuses = currentStatuses.filter(s => s !== status);
    await fetch("/api/current-statuses", { method: "POST", body: JSON.stringify(updatedStatuses) });
    setCurrentStatuses(updatedStatuses);
  }

  if (loading) return <div>Yükleniyor…</div>;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Konfigürasyonlar</h1>
        <p className="text-sm text-muted-foreground">Takım ve proje ayarlarını düzenleyin.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol taraf - Günlük Planlama Saati */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3">Günlük Planlama Saati</h2>
            <input
              type="time"
              className="border rounded-md px-3 py-2"
              value={config.dailyPlanningHour}
              onChange={(e) => saveHour(e.target.value)}
            />
          </div>

          {/* Resmi Tatiller */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Resmi Tatiller</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm">Şablondan Ekle</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {[
                    { label: "Yılbaşı (1 Ocak)", range: { name: "Yılbaşı", startDate: "2025-01-01", endDate: "2025-01-01" } },
                    { label: "23 Nisan", range: { name: "23 Nisan", startDate: "2025-04-23", endDate: "2025-04-23" } },
                    { label: "1 Mayıs", range: { name: "1 Mayıs", startDate: "2025-05-01", endDate: "2025-05-01" } },
                    { label: "19 Mayıs", range: { name: "19 Mayıs", startDate: "2025-05-19", endDate: "2025-05-19" } },
                    { label: "30 Ağustos", range: { name: "30 Ağustos", startDate: "2025-08-30", endDate: "2025-08-30" } },
                    { label: "29 Ekim", range: { name: "29 Ekim", startDate: "2025-10-29", endDate: "2025-10-29" } },
                  ].map((tpl) => (
                    <DropdownMenuCheckboxItem
                      key={tpl.label}
                      checked={holidays.some(h => h.name === tpl.range.name && h.startDate === tpl.range.startDate)}
                      onCheckedChange={async (checked) => {
                        if (checked) {
                          const list = await (await fetch("/api/holidays", { method: "POST", body: JSON.stringify({ id: uuidv4(), ...tpl.range }) })).json();
                          setHolidays(list);
                        } else {
                          const toRemove = holidays.find(h => h.name === tpl.range.name && h.startDate === tpl.range.startDate);
                          if (toRemove) {
                            const list = await (await fetch(`/api/holidays?id=${encodeURIComponent(toRemove.id)}`, { method: "DELETE" })).json();
                            setHolidays(list);
                          }
                        }
                      }}
                    >
                      {tpl.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-3">
              <input
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Tatil adı"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              />
              <div className="border rounded-md p-2">
                <DateRangePicker
                  value={{ startDate: newHoliday.startDate || "", endDate: newHoliday.endDate || "" }}
                  onChange={(r) => setNewHoliday({ ...newHoliday, startDate: r.startDate, endDate: r.endDate })}
                />
              </div>
              <Button onClick={async () => {
                if (!newHoliday.startDate || !newHoliday.endDate || !newHoliday.name.trim()) return alert("İsim ve tarihler zorunlu");
                const list = await (await fetch("/api/holidays", { method: "POST", body: JSON.stringify({ id: uuidv4(), ...newHoliday }) })).json();
                setHolidays(list);
                setNewHoliday({ name: "", startDate: "", endDate: "" });
              }}>Tatil Ekle</Button>
            </div>

            <div className="mt-4 max-h-48 overflow-y-auto">
              {holidays.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">Henüz tatil eklenmedi.</div>
              ) : (
                <div className="space-y-2">
                  {holidays.map(h => (
                    <div key={h.id} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                      <span className="truncate">{h.startDate} → {h.endDate} — {h.name}</span>
                      <Button variant="destructive" size="sm" onClick={async () => {
                        const list = await (await fetch(`/api/holidays?id=${encodeURIComponent(h.id)}`, { method: "DELETE" })).json();
                        setHolidays(list);
                      }}>Sil</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ taraf - Kişi Listesi ve Component Yönetimi */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Kişi Listesi</h2>
              <Button onClick={() => setEditing({ id: uuidv4(), firstName: "", lastName: "", role: roles[0], ldap: "" })} size="sm">Yeni Kişi</Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {config.people.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Henüz kişi eklenmedi.</div>
              ) : (
                <div className="space-y-2">
                  {config.people.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{p.firstName} {p.lastName}</div>
                        <div className="text-xs text-muted-foreground">{p.role} • {p.ldap}</div>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <Button variant="secondary" size="sm" onClick={() => setEditing(p)}>Düzenle</Button>
                        <Button variant="destructive" size="sm" onClick={() => setShowDelete({ open: true, id: p.id })}>Sil</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Component Yönetimi */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Component Yönetimi</h2>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-md px-3 py-2"
                  placeholder="Component adı"
                  value={newComponent}
                  onChange={(e) => setNewComponent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addComponent()}
                />
                <Button onClick={addComponent} size="sm">Ekle</Button>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {components.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">Henüz component eklenmedi.</div>
                ) : (
                  <div className="space-y-2">
                    {components.map((component) => (
                      <div key={component} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{component}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeComponent(component)}
                        >
                          Sil
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sprint End Targets Yönetimi */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Sprint End Targets</h2>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-md px-3 py-2"
                  placeholder="Sprint End Target adı"
                  value={newSprintEndTarget}
                  onChange={(e) => setNewSprintEndTarget(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSprintEndTarget()}
                />
                <Button onClick={addSprintEndTarget} size="sm">Ekle</Button>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {sprintEndTargets.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">Henüz Sprint End Target eklenmedi.</div>
                ) : (
                  <div className="space-y-2">
                    {sprintEndTargets.map((target) => (
                      <div key={target} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{target}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSprintEndTarget(target)}
                        >
                          Sil
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Statuses Yönetimi */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Current Statuses</h2>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-md px-3 py-2"
                  placeholder="Current Status adı"
                  value={newCurrentStatus}
                  onChange={(e) => setNewCurrentStatus(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCurrentStatus()}
                />
                <Button onClick={addCurrentStatus} size="sm">Ekle</Button>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {currentStatuses.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">Henüz Current Status eklenmedi.</div>
                ) : (
                  <div className="space-y-2">
                    {currentStatuses.map((status) => (
                      <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{status}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCurrentStatus(status)}
                        >
                          Sil
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? (config.people.some(p => p.id === editing.id) ? "Kişiyi Düzenle" : "Yeni Kişi") : undefined}>
        {editing && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border rounded-md px-3 py-2"
                placeholder="İsim"
                value={editing.firstName}
                onChange={(e) => setEditing({ ...editing, firstName: e.target.value })}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Soyisim"
                value={editing.lastName}
                onChange={(e) => setEditing({ ...editing, lastName: e.target.value })}
              />
              <select
                className="border rounded-md px-3 py-2"
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <input
                className="border rounded-md px-3 py-2"
                placeholder="LDAP"
                value={editing.ldap}
                onChange={(e) => setEditing({ ...editing, ldap: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setEditing(null)}>İptal</Button>
              <Button onClick={() => editing && createOrUpdatePerson(editing)}>Kaydet</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={showDelete.open}
        onCancel={() => setShowDelete({ open: false })}
        onConfirm={() => {
          if (showDelete.id) removePerson(showDelete.id);
          setShowDelete({ open: false });
        }}
        title="Kişiyi Sil"
        description={<span>Bu kişiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</span>}
        confirmText="Sil"
        cancelText="Vazgeç"
      />
    </div>
  );
}


