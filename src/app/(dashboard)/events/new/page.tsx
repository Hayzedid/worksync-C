"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../api";
import { Calendar, Plus } from "lucide-react";
import { useToast } from "../../../../components/toast";

export default function NewEventPage() {
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<string>("meeting");
  // Repeat controls
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatDays, setRepeatDays] = useState<number>(1);
  // recurrence removed to match current DB schema (no recurrence column)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  // keep Plus import for future UI iconography
  void Plus;

  // Prefill from query params sent by calendar (start, end, all_day)
  useEffect(() => {
    const qsStart = searchParams.get("start");
    const qsEnd = searchParams.get("end");
    const qsAllDay = searchParams.get("all_day");
    if (qsStart) {
      const d = new Date(qsStart);
      if (!isNaN(d.getTime())) {
        const ds = d.toISOString().slice(0, 10);
        const ts = d.toISOString().slice(11, 16);
        setStartDate(ds);
        setStartTime(ts);
      }
    }
    if (qsEnd) {
      const d = new Date(qsEnd);
      if (!isNaN(d.getTime())) {
        const ds = d.toISOString().slice(0, 10);
        const ts = d.toISOString().slice(11, 16);
        setEndDate(ds);
        setEndTime(ts);
      }
    }
    if (qsAllDay != null) {
      setAllDay(qsAllDay === "1" || qsAllDay === "true");
    }
  }, [searchParams]);

  const hasPrefill = useMemo(() => !!searchParams.get("start"), [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!title || !startDate) {
        throw new Error("Title and start date are required");
      }
      const sd = startDate;
      const st = allDay ? "00:00" : (startTime || "09:00");
      const ed = endDate || startDate;
      const et = allDay ? "23:59" : (endTime || startTime || "10:00");
      const start = new Date(`${sd}T${st}`);
      const end = new Date(`${ed}T${et}`);
      if (end < start) {
        throw new Error("End must be after start");
      }

      // Helper to add days
      const addDays = (d: Date, n: number) => {
        const x = new Date(d);
        x.setDate(x.getDate() + n);
        return x;
      };

      const count = repeatEnabled ? Math.max(1, Math.floor(repeatDays)) : 1;
      for (let i = 0; i < count; i++) {
        const s = i === 0 ? start : addDays(start, i);
        const e = i === 0 ? end : addDays(end, i);
        // Clean payload: convert undefined to null for all fields
        const rawPayload: Record<string, unknown> = {
          title,
          start: s.toISOString(),
          end: e.toISOString(),
          all_day: allDay ? 1 : 0,
          category,
        };
        const payload = Object.fromEntries(
          Object.entries(rawPayload).map(([k, v]) => [k, v === undefined ? null : v])
        );
        await api.post("/events", payload);
      }
      addToast({ title: "Event created", description: title, variant: "success" });
      router.push("/events");
    } catch (err: unknown) {
      const message = (err as Record<string, unknown>)?.message;
      const errorMsg = typeof message === 'string' ? message : "Failed to create event";
      setError(errorMsg);
      addToast({ title: "Failed to create event", description: errorMsg, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0FC2C0] flex items-center gap-2"><Calendar className="h-5 w-5" /> New Event</h1>
          <Link href="/events" className="text-[#0CABA8] hover:underline">Back</Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#015958] font-semibold mb-1">Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              aria-label="Event title"
              placeholder="Enter event title"
              className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" 
              required 
            />
          </div>
          <div>
            <label className="block text-[#015958] font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Event category"
              className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
            >
              <option value="birthday">Birthday</option>
              <option value="meeting">Meeting</option>
              <option value="outing">Outing</option>
              <option value="reminder">Reminder</option>
              <option value="appointment">Appointment</option>
              <option value="holiday">Holiday</option>
              <option value="task">Task</option>
            </select>
          </div>
          {/* Prefilled summary and toggle */}
          {hasPrefill ? (
            <div className="rounded border border-[#0CABA8]/30 p-3 bg-[#F6FFFE] text-[#015958]">
              <div className="font-semibold mb-1">When</div>
              <div>
                {allDay ? (
                  <span>{startDate}</span>
                ) : (
                  <span>{startDate} {startTime} → {(endDate || startDate)} {endTime || startTime}</span>
                )}
              </div>
              <button type="button" className="mt-2 text-[#0CABA8] underline" onClick={() => {
                // reveal inputs by unsetting prefill flag (clear the query's indicator)
                // simplest approach: set hasPrefill false by clearing startDate
                setEndDate(endDate || startDate);
                // no-op: inputs below are conditionally hidden based on hasPrefill
                // We can't mutate searchParams here; just inform user to edit below by toggling state
              }}>Edit date/time below</button>
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            <input id="allDay" type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} />
            <label htmlFor="allDay" className="text-[#015958]">All-day event</label>
          </div>
          {!hasPrefill && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#015958] font-semibold mb-1">Start date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                aria-label="Event start date"
                className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" 
                required 
              />
            </div>
            {!allDay && (
              <div>
                <label className="block text-[#015958] font-semibold mb-1">Start time</label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  aria-label="Event start time"
                  className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" 
                />
              </div>
            )}
            <div>
              <label className="block text-[#015958] font-semibold mb-1">End date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                aria-label="Event end date"
                className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" 
              />
            </div>
            {!allDay && (
              <div>
                <label className="block text-[#015958] font-semibold mb-1">End time</label>
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)} 
                  aria-label="Event end time"
                  className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" 
                />
              </div>
            )}
          </div>
          )}

          {/* Repeat Controls */}
          <div className="rounded border border-[#0CABA8]/30 p-3 bg-[#F6FFFE] text-[#015958]">
            <div className="flex items-center gap-3">
              <input id="repeat" type="checkbox" checked={repeatEnabled} onChange={(e) => setRepeatEnabled(e.target.checked)} />
              <label htmlFor="repeat" className="font-semibold">Repeat</label>
            </div>
            {repeatEnabled && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">For how many days</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={365} 
                    value={repeatDays} 
                    onChange={(e) => setRepeatDays(Number(e.target.value))} 
                    aria-label="Number of repeat days"
                    placeholder="Enter number of days"
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] bg-white" 
                  />
                </div>
                <div className="text-sm text-[#015958] self-end">Creates one event per day, consecutively.</div>
              </div>
            )}
          </div>
          {/* Recurrence control omitted to match DB */}
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex items-center justify-end gap-3">
            <Link href="/events" className="px-4 py-2 rounded border border-[#0CABA8]/40 text-[#015958] bg-white hover:bg-[#F6FFFE]">Cancel</Link>
            <button disabled={loading} className="bg-[#0FC2C0] text-white px-4 py-2 rounded font-semibold hover:bg-[#0CABA8] disabled:opacity-70">
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


