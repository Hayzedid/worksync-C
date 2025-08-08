import React from "react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-light via-teal-medium to-teal-deepest p-8">
      <div className="max-w-3xl mx-auto bg-white/80 rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-teal-deepest mb-6">Privacy Policy</h1>
        <p className="text-teal-deepest mb-4">This is the placeholder privacy policy for WorkSync. Please replace with your actual privacy policy.</p>
        <ul className="list-disc pl-6 text-teal-deepest space-y-2">
          <li>We value your privacy and protect your data.</li>
          <li>We use cookies to improve your experience.</li>
          <li>Your information is never sold to third parties.</li>
          <li>Contact us for any privacy-related questions.</li>
        </ul>
      </div>
    </main>
  );
} 