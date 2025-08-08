import React from 'react';

export function AnalyticsDashboard() {
  // Replace with real chart library (e.g., Chart.js, Recharts)
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
      <h3 className="text-lg font-bold text-[#0FC2C0] mb-4">Analytics</h3>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#0FC2C0] via-[#0CABA8] to-[#015958] flex items-center justify-center text-white text-2xl font-bold">75%</div>
          <div className="text-[#015958] mt-2">Task Completion</div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#0CABA8] via-[#0FC2C0] to-[#008F8C] flex items-center justify-center text-white text-2xl font-bold">12</div>
          <div className="text-[#015958] mt-2">Active Projects</div>
        </div>
      </div>
      <div className="mt-6 text-[#0CABA8] text-center">(Charts go here)</div>
    </div>
  );
} 