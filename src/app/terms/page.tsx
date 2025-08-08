import React from "react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-light via-teal-medium to-teal-deepest p-8">
      <div className="max-w-3xl mx-auto bg-white/80 rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-teal-deepest mb-6">Terms of Service</h1>
        <p className="text-teal-deepest mb-4">These are the placeholder terms of service for WorkSync. Please replace with your actual terms.</p>
        <ul className="list-disc pl-6 text-teal-deepest space-y-2">
          <li>Use WorkSync responsibly and respectfully.</li>
          <li>Your data is yours; we do not sell your information.</li>
          <li>Do not use WorkSync for illegal activities.</li>
          <li>We reserve the right to update these terms at any time.</li>
        </ul>
      </div>
    </main>
  );
} 