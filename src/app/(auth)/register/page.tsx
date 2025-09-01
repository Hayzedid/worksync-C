"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackendError } from "../../../components/BackendError";
import { useAuth } from "../../../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

// Timezone list (used in select input if enabled)
const timezones = ["UTC", "America/New_York", "Europe/London"];

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    timezone: "UTC",
  });
  // Profile picture upload support reserved for future UI
  const [profilePicture, setProfilePicture] = useState<File | null>(null); // kept intentionally
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // keep intentionally to avoid noisy eslint `assigned a value but never used` during iterative development
  void timezones;
  void profilePicture;
  void setProfilePicture;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password || !form.confirmPassword || !form.firstName || !form.lastName) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!terms) {
      setError("You must agree to the terms and conditions.");
      return;
    }
    setLoading(true);
    try {
      // Use the register function from useAuth hook
      const result = await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.username,
      });
      
      if (result.success) {
        router.push("/login");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0FC2C0] via-[#0CABA8] to-[#023535]">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-8 bg-white/90 rounded-xl shadow-2xl border border-[#0CABA8]/30 backdrop-blur-md">
        <h1 className="text-2xl font-bold mb-4 text-[#0FC2C0]">Register</h1>
        <label htmlFor="reg-username" className="sr-only">Username</label>
        <input id="reg-username" name="username" autoComplete="username" className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
        <label htmlFor="reg-first-name" className="sr-only">First Name</label>
        <input id="reg-first-name" name="firstName" autoComplete="given-name" className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
        <label htmlFor="reg-last-name" className="sr-only">Last Name</label>
        <input id="reg-last-name" name="lastName" autoComplete="family-name" className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
        <label htmlFor="reg-email" className="sr-only">Email</label>
        <input id="reg-email" name="email" autoComplete="email" className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <div className="relative mb-3">
          <label htmlFor="reg-password" className="sr-only">Password</label>
          <input
            className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] pr-10"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            id="reg-password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
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
        <div className="relative mb-3">
          <label htmlFor="reg-confirm-password" className="sr-only">Confirm Password</label>
          <input
            className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] pr-10"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            id="reg-confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0CABA8] hover:text-[#0FC2C0]"
            tabIndex={-1}
            onClick={() => setShowConfirmPassword(v => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <label htmlFor="reg-terms" className="flex items-center mb-3 text-[#015958]">
          <input id="reg-terms" name="terms" type="checkbox" className="mr-2" checked={terms} onChange={e => setTerms(e.target.checked)} />
          I agree to the <a href="/terms" className="text-[#0CABA8] hover:underline ml-1">terms and conditions</a>
        </label>
        {error && (
          error.includes('Failed to fetch') || error.includes('network') || error.includes('ECONNREFUSED') ? (
            <BackendError />
          ) : (
            <div className="text-red-500 mb-2">{error}</div>
          )
        )}
        <button className="bg-[#008F8C] text-white px-4 py-2 rounded w-full transition-colors duration-200 hover:bg-[#0FC2C0]" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-[#0CABA8] hover:underline">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
} 