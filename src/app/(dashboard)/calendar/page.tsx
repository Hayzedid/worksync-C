"use client";

import React, { useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "../../../api";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

type RawEvent = {
  id: number | string;
  title: string;
  start?: string;
  end?: string;
  all_day?: number | boolean;
  allDay?: boolean;
  date?: string; // legacy
  workspace_id?: number;
  project_id?: number;
};

type EventInput = {
  id: string;
  title: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
};

export default function CalendarPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const calendarRef = useRef<FullCalendar | null>(null);

  const { data, isLoading, isError, error } = useQuery<unknown>({
    queryKey: ["events"],
    queryFn: () => api.get("/events"),
  });

  const raw: RawEvent[] = (() => {
    if (Array.isArray(data)) return data as RawEvent[];
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (Array.isArray(d['events'])) return d['events'] as RawEvent[];
    }
    return [];
  })();

  const colorMap = useMemo(() => {
    const palette = [
      "#0FC2C0", "#0CABA8", "#015958", "#13C4A3", "#86E7B8",
      "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981"
    ];
    const map = new Map<number, string>();
    let i = 0;
    for (const e of raw) {
      const key = e.project_id ?? e.workspace_id;
      if (key != null && !map.has(key)) {
        map.set(key, palette[i % palette.length]);
        i++;
      }
    }
    return map;
  }, [raw]);

  const events = useMemo((): EventInput[] => {
    return raw.map(e => {
      const start = e.start ?? (e.date ? new Date(e.date).toISOString() : undefined);
      const end = e.end ?? undefined;
      const allDay = typeof e.allDay === "boolean"
        ? e.allDay
        : (typeof e.all_day === "number" ? e.all_day === 1 : false) || (!e.start && !!e.date);
      const color = colorMap.get((e.project_id ?? e.workspace_id) as number);
      return {
        id: String(e.id),
        title: e.title,
        start,
        end,
        allDay,
        backgroundColor: color,
        borderColor: color,
      };
    });
  }, [raw, colorMap]);

  async function handleEventDropResize(info: { event: { id: string | number; start?: Date | null; end?: Date | null; allDay?: boolean }; revert: () => void }) {
    const ev = info.event;
    try {
      await api.patch(`/events/${ev.id}`, {
        start: ev.start ? ev.start.toISOString() : undefined,
        end: ev.end ? ev.end.toISOString() : undefined,
        all_day: ev.allDay ? 1 : 0,
      });
      qc.invalidateQueries({ queryKey: ["events"] });
    } catch {
      // revert on failure
      info.revert();
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto rounded-xl p-2 md:p-4">
        {isLoading && <div className="text-[#e6fffb] p-2">Loading events…</div>}
  {isError && <div className="text-red-400 p-2">Failed to load events{(error && typeof (error as unknown as Record<string, unknown>)['message'] === 'string') ? `: ${String((error as unknown as Record<string, unknown>)['message'])}` : ""}</div>}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          customButtons={{
            myToday: {
              text: "Today",
              click: () => {
                const api = calendarRef.current?.getApi();
                if (!api) return;
                api.today();
                api.changeView("timeGridDay");
              },
            },
          }}
          headerToolbar={{
            left: "prev,next myToday",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          nowIndicator
          navLinks
          stickyHeaderDates
          events={events}
          selectable
          selectMirror
          editable
          dayMaxEvents
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          select={(info) => {
            const startISO = info.startStr;
            const endISO = info.endStr;
            const allDay = info.allDay ? 1 : 0;
            // Navigate to new event page with prefilled params
            const params = new URLSearchParams({ start: startISO, end: endISO, all_day: String(allDay) }).toString();
            router.push(`/events/new?${params}`);
          }}
          dateClick={(info) => {
            const params = new URLSearchParams({ start: info.dateStr, all_day: info.allDay ? '1' : '0' }).toString();
            router.push(`/events/new?${params}`);
          }}
          eventDrop={handleEventDropResize}
          eventResize={handleEventDropResize}
          height="auto"
        />
      </div>
    </main>
  );
}