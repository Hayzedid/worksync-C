"use client";
import { useState } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { api } from "../../../api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // router not used here, keep for future navigation if needed
  // const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("If an account exists for that email, a reset link has been sent.");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <h1 className="text-2xl font-bold text-[#0FC2C0] mb-4">Forgot Password</h1>
  <p className="text-sm text-[#015958] mb-6">Enter your email address and we will send you a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#015958] font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
              placeholder="you@example.com"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex items-center justify-between">
            <Link href="/login" className="text-[#0CABA8] hover:underline">Back to login</Link>
            <button
              disabled={loading}
              className="bg-[#0FC2C0] text-white px-4 py-2 rounded font-semibold hover:bg-[#0CABA8] disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
