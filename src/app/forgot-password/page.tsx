"use client";

import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-light via-teal-medium to-teal-deepest p-8">
      <div className="max-w-md w-full bg-white/90 rounded-xl shadow-2xl p-8 border border-teal-light/30 backdrop-blur-md">
        <h1 className="text-3xl font-bold text-teal-deepest mb-6 text-center">Forgot Password</h1>
        {submitted ? (
          <div className="text-center text-teal-deep font-medium">Check your email for a password reset link.</div>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-teal-deep mb-1">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded border border-teal-light bg-white p-3 text-teal-deepest focus:outline-none focus:ring-2 focus:ring-teal-light focus:border-teal-light transition"
                placeholder="Enter your email"
              />
            </div>
            <button type="submit" className="w-full px-6 py-2 rounded bg-teal-light text-white font-semibold hover:bg-teal-medium transition">Send Reset Link</button>
          </form>
        )}
      </div>
    </main>
  );
} 