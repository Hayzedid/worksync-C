"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../api";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Mock login logic for demo
      if (form.email === "demo@worksync.com" && form.password === "password123") {
        router.push("/dashboard");
        return;
      } else {
        throw new Error("Invalid email or password");
      }
      // await api.post("/auth/login", form);
      // router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0FC2C0] via-[#0CABA8] to-[#023535]">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-8 bg-white/90 rounded-xl shadow-2xl border border-[#0CABA8]/30 backdrop-blur-md">
        <h1 className="text-2xl font-bold mb-4 text-[#0FC2C0]">Login</h1>
        <input className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <div className="relative mb-3">
          <input
            className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] pr-10"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0CABA8] hover:text-[#0FC2C0]"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button className="bg-[#0FC2C0] text-white px-4 py-2 rounded w-full transition-colors duration-200 hover:bg-[#0CABA8]" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <div className="mt-4 text-center">
          <a href="/register" className="text-[#0CABA8] hover:underline">Don't have an account? Register</a>
        </div>
      </form>
    </div>
  );
} 