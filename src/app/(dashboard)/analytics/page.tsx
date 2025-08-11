"use client";
import { AnalyticsDashboard } from "../../../components/analytics/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0FC2C0] mb-6">Analytics</h1>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}


