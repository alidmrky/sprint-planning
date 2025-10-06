"use client";

import { useMemo, useState } from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  value: { startDate: string; endDate: string };
  onChange: (next: { startDate: string; endDate: string }) => void;
};

function toISO(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
}

export function DateRangePicker({ value, onChange }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [draft, setDraft] = useState<{ start?: string; end?: string }>({ start: value.startDate, end: value.endDate });

  const months = useMemo(() => [
    new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
  ], [cursor]);

  function pick(dayISO: string) {
    const { start, end } = draft;
    if (!start || (start && end)) {
      setDraft({ start: dayISO, end: undefined });
    } else if (start && !end) {
      if (dayISO < start) setDraft({ start: dayISO, end: start }); else setDraft({ start, end: dayISO });
    }
  }

  function commit() {
    if (draft.start && draft.end) onChange({ startDate: draft.start, endDate: draft.end });
  }

  function renderMonth(date: Date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const startIdx = (first.getDay() + 6) % 7; // Monday start
    return (
      <div className="space-y-2">
        <div className="text-[13px] font-medium text-center">
          {date.toLocaleString("tr-TR", { month: "long", year: "numeric" })}
        </div>
        <div className="grid grid-cols-7 text-[10px] font-medium text-muted-foreground">
          {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map(d => <div key={d} className="text-center py-0.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => {
            const dateCell = new Date(date.getFullYear(), date.getMonth(), i - startIdx + 1);
            const iso = toISO(dateCell);
            const inMonth = dateCell.getMonth() === date.getMonth();
            const active = draft.start && draft.end && iso >= draft.start && iso <= draft.end;
            const isStart = draft.start === iso;
            const isEnd = draft.end === iso;
            return (
              <button
                type="button"
                key={i}
                onClick={() => pick(iso)}
                className={`h-8 w-8 rounded-full text-[11px] flex items-center justify-center transition-colors
                  ${inMonth ? "" : "opacity-40"}
                  ${active ? "bg-primary/15" : "hover:bg-accent"}
                  ${isStart || isEnd ? "!bg-primary text-primary-foreground" : ""}`}
              >
                {dateCell.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button size="icon" variant="ghost" aria-label="Önceki ay" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {months.map((m, idx) => <div key={idx}>{renderMonth(m)}</div>)}
        </div>
        <Button size="icon" variant="ghost" aria-label="Sonraki ay" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {[1,2,3,7,14].map(n => (
          <Button key={n} variant="secondary" size="sm" onClick={() => {
            const start = draft.start || toISO(new Date());
            const d = new Date(start + "T00:00:00");
            d.setDate(d.getDate() + (n - 1));
            setDraft({ start, end: toISO(d) });
          }}>± {n} gün</Button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setDraft({ start: undefined, end: undefined })}>Temizle</Button>
        <Button onClick={commit}>Uygula</Button>
      </div>
    </div>
  );
}


