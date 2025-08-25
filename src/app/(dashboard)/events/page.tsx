"use client";

import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/client";

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

export default function EventsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const calendarRef = useRef<FullCalendar | null>(null);

  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ["events"],
    queryFn: () => api.get("/events"),
  });

  const raw: RawEvent[] = Array.isArray(data)
    ? data
    : data?.events && Array.isArray(data.events)
    ? data.events
    : [];

  const events = raw.map(e => {
    const start = e.start ?? (e.date ? new Date(e.date).toISOString() : undefined);
    const end = e.end ?? undefined;
    const allDay = typeof e.allDay === "boolean"
      ? e.allDay
      : (typeof e.all_day === "number" ? e.all_day === 1 : false) || (!e.start && !!e.date);
    return {
      id: String(e.id),
      title: e.title,
      start,
      end,
      allDay,
    } as any;
  });

  async function handleEventDropResize(info: any) {
    const ev = info.event;
    try {
      await api.patch(`/events/${ev.id}`, {
        start: ev.start ? ev.start.toISOString() : undefined,
        end: ev.end ? ev.end.toISOString() : undefined,
        all_day: ev.allDay ? 1 : 0,
      });
      qc.invalidateQueries({ queryKey: ["events"] });
    } catch (err) {
      info.revert();
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto rounded-xl p-2 md:p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[#e6fffb]">Events</h1>
          <Link href="/events/new" className="px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold">New Event</Link>
        </div>
        {isLoading && <div className="text-[#e6fffb] p-2">Loading events…</div>}
        {isError && <div className="text-red-400 p-2">Failed to load events{(error as any)?.message ? `: ${(error as any).message}` : ""}</div>}
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
            const params = new URLSearchParams({ start: info.startStr, end: info.endStr, all_day: info.allDay ? '1' : '0' }).toString();
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
    </div>
  );
}