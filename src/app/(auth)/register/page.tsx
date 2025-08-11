"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../api";
import { Eye, EyeOff } from "lucide-react";

const timezones = [
  "UTC", "America/New_York", "Europe/London", "Asia/Tokyo", "Africa/Lagos", "Asia/Kolkata"
];

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
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const data = new FormData();
      data.append("username", form.username);
      data.append("email", form.email);
      data.append("password", form.password);
      data.append("first_name", form.firstName);
      data.append("last_name", form.lastName);
      data.append("timezone", form.timezone);
      if (profilePicture) data.append("profile_picture", profilePicture);
      await api.post("/auth/register", data);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0FC2C0] via-[#0CABA8] to-[#023535]">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-8 bg-white/90 rounded-xl shadow-2xl border border-[#0CABA8]/30 backdrop-blur-md" encType="multipart/form-data">
        <h1 className="text-2xl font-bold mb-4 text-[#0FC2C0]">Register</h1>
        <input className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
        <input className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
        <input className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
        <input className="w-full mb-3 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <div className="relative mb-3">
          <input
            className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] pr-10"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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
          <input
            className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] pr-10"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
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
        <label className="flex items-center mb-3 text-[#015958]">
          <input type="checkbox" className="mr-2" checked={terms} onChange={e => setTerms(e.target.checked)} />
          I agree to the <a href="/terms" className="text-[#0CABA8] hover:underline ml-1">terms and conditions</a>
        </label>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button className="bg-[#008F8C] text-white px-4 py-2 rounded w-full transition-colors duration-200 hover:bg-[#0FC2C0]" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-[#0CABA8] hover:underline">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
} 