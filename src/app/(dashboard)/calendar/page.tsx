"use client";

import React, { useState } from "react";

const mockEvents = [
  { date: "2025-07-18", title: "Team Standup" },
  { date: "2025-07-20", title: "Project Deadline" },
  { date: "2025-07-22", title: "1:1 Meeting" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const monthNames = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
  };

  const eventsForDay = (day: number) =>
    mockEvents.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-light via-teal-medium to-teal-deepest p-8">
      <div className="max-w-4xl mx-auto bg-white/80 rounded-xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handlePrevMonth} className="text-[#0FC2C0] font-bold text-lg">&lt;</button>
          <h1 className="text-3xl font-bold text-teal-deepest">{monthNames[currentMonth]} {currentYear}</h1>
          <button onClick={handleNextMonth} className="text-[#0FC2C0] font-bold text-lg">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {[...Array(firstDayOfWeek)].map((_, i) => (
            <div key={"empty-" + i} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            const hasEvent = eventsForDay(day).length > 0;
            return (
              <button
                key={day}
                className={`aspect-square flex flex-col items-center justify-center rounded border border-teal-light/20 transition-all duration-150 ${isToday ? 'bg-[#0FC2C0] text-white font-bold' : 'bg-teal-light/10 text-teal-deepest'} ${hasEvent ? 'ring-2 ring-[#0CABA8]' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <span>{day}</span>
                {hasEvent && <span className="text-xs bg-teal-light text-white rounded px-2 mt-1">{eventsForDay(day)[0].title}</span>}
              </button>
            );
          })}
        </div>
        {selectedDay && (
          <div className="mb-6 p-4 bg-[#F6FFFE] rounded shadow border border-[#0CABA8]/20">
            <h2 className="text-lg font-semibold mb-2">Events for {monthNames[currentMonth]} {selectedDay}, {currentYear}</h2>
            <ul className="space-y-2">
              {eventsForDay(selectedDay).length === 0 ? (
                <li className="text-[#015958]">No events for this day.</li>
              ) : (
                eventsForDay(selectedDay).map((event, idx) => (
                  <li key={idx} className="bg-teal-light/10 rounded p-2">
                    <span className="font-semibold">{event.title}</span> <span className="text-xs">({event.date})</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
        <div className="text-teal-deepest">
          <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
          <ul className="space-y-2">
            {mockEvents.map((event, idx) => (
              <li key={idx} className="bg-teal-light/10 rounded p-2">
                <span className="font-semibold">{event.title}</span> <span className="text-xs">({event.date})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
} 