"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { BackendError } from "../../../components/BackendError";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '';
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Clean data - convert undefined to null
    const cleanData = {
      email: form.email || null,
      password: form.password || null,
    };

    if (!cleanData.email || !cleanData.password) {
      setError(new Error('Email and password are required'));
      setLoading(false);
      return;
    }

    try {
      const result = await auth.login(cleanData.email, cleanData.password);
      if (result.success) {
        // If there's a return URL (from invitation), redirect there after successful login
        if (returnUrl) {
          router.replace(decodeURIComponent(returnUrl));
        } else {
          router.replace("/dashboard");
        }
      } else {
        // Create a specific error based on the message to trigger proper error component
        const errorMessage = result.message || "Login failed";
        setError(new Error(errorMessage));
      }
    } catch (err: unknown) {
      // This catch should rarely be reached now, as useAuth handles most errors
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An unexpected error occurred. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0FC2C0] via-[#0CABA8] to-[#023535]">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-8 bg-white/90 rounded-xl shadow-2xl border border-[#0CABA8]/30 backdrop-blur-md">
        <h1 className="text-2xl font-bold mb-4 text-[#0FC2C0]">Login</h1>
        <label htmlFor="login-email" className="sr-only">Email</label>
        <input id="login-email" name="email" autoComplete="email" className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <div className="relative mb-3">
          <label htmlFor="login-password" className="sr-only">Password</label>
          <input
            className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] pr-10"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            id="login-password"
            name="password"
            autoComplete="current-password"
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
        {error && (
          <div className="mb-4">
            <BackendError error={error} retry={handleRetry} />
          </div>
        )}
        <button className="bg-[#0FC2C0] text-white px-4 py-2 rounded w-full transition-colors duration-200 hover:bg-[#0CABA8]" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-[#0CABA8] hover:underline">Forgot password?</Link>
          <Link href="/register" className="text-[#0CABA8] hover:underline">Do not have an account? Register</Link>
        </div>
      </form>
    </div>
  );
} 