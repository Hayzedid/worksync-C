"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../api";

export default function ResetPasswordPage() {
  const params = useParams() as { token?: string } | null;
  const token = params?.token ?? '';
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess("Password updated. You can now login.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <h1 className="text-2xl font-bold text-[#0FC2C0] mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-new-password" className="block text-[#015958] font-semibold mb-1">New password</label>
            <input
              id="reset-new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="reset-confirm-password" className="block text-[#015958] font-semibold mb-1">Confirm password</label>
            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
              placeholder="••••••••"
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
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
