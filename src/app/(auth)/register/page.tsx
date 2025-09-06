"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BackendError } from "../../../components/BackendError";
import { useAuth } from "../../../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

// Timezone list (used in select input if enabled)
const timezones = ["UTC", "America/New_York", "Europe/London"];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { register } = useAuth();
  
  // Pre-fill email from URL params (for invitations)
  const prefilledEmail = searchParams?.get('email') || '';
  const returnUrl = searchParams?.get('returnUrl') || '';

  const [form, setForm] = useState({
    username: "",
    email: prefilledEmail,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update email when URL params change (for invitation flow)
  useEffect(() => {
    if (prefilledEmail && prefilledEmail !== form.email) {
      setForm(prev => ({ ...prev, email: prefilledEmail }));
    }
  }, [prefilledEmail, form.email]);

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
        // If there's a return URL (from invitation), redirect there after successful registration
        if (returnUrl) {
          router.push(decodeURIComponent(returnUrl));
        } else {
          router.push("/login");
        }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0FC2C0] via-[#0CABA8] to-[#023535] p-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join WorkSync</h1>
          <p className="text-white/80">Create your account and start collaborating</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-white/95 rounded-2xl shadow-2xl border border-[#0CABA8]/30 backdrop-blur-md space-y-4">
          
          {/* Name Fields Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-first-name" className="block text-sm font-medium text-[#015958] mb-2">
                First Name
              </label>
              <input 
                id="reg-first-name" 
                name="firstName" 
                autoComplete="given-name" 
                className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] transition-all" 
                placeholder="First Name" 
                value={form.firstName} 
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} 
                required 
              />
            </div>
            <div>
              <label htmlFor="reg-last-name" className="block text-sm font-medium text-[#015958] mb-2">
                Last Name
              </label>
              <input 
                id="reg-last-name" 
                name="lastName" 
                autoComplete="family-name" 
                className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] transition-all" 
                placeholder="Last Name" 
                value={form.lastName} 
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} 
                required 
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-[#015958] mb-2">
              Username
            </label>
            <input 
              id="reg-username" 
              name="username" 
              autoComplete="username" 
              className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] transition-all" 
              placeholder="Choose a username" 
              value={form.username} 
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
              required 
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-[#015958] mb-2">
              Email Address
            </label>
            <input 
              id="reg-email" 
              name="email" 
              autoComplete="email" 
              className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] transition-all" 
              placeholder="Enter your email" 
              type="email" 
              value={form.email} 
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
              required 
            />
          </div>

          <div className="relative">
            <label htmlFor="reg-password" className="block text-sm font-medium text-[#015958] mb-2">
              Password
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] pr-12 transition-all"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              id="reg-password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-11 text-[#0CABA8] hover:text-[#0FC2C0] transition-colors"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-[#015958] mb-2">
              Confirm Password
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] pr-12 transition-all"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              id="reg-confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-11 text-[#0CABA8] hover:text-[#0FC2C0] transition-colors"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword(v => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <label htmlFor="reg-terms" className="flex items-start gap-3 text-[#015958] cursor-pointer">
            <input 
              id="reg-terms" 
              name="terms" 
              type="checkbox" 
              className="mt-1 h-4 w-4 text-[#0FC2C0] border-[#0CABA8]/30 rounded focus:ring-[#0FC2C0]" 
              checked={terms} 
              onChange={e => setTerms(e.target.checked)} 
            />
            <span className="text-sm leading-relaxed">
              I agree to the{" "}
              <a href="/terms" className="text-[#0CABA8] hover:underline font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-[#0CABA8] hover:underline font-medium">
                Privacy Policy
              </a>
            </span>
          </label>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              {error.includes('Failed to fetch') || error.includes('network') || error.includes('ECONNREFUSED') ? (
                <BackendError />
              ) : (
                <div className="text-red-600 text-sm">{error}</div>
              )}
            </div>
          )}

          <button 
            className="w-full bg-gradient-to-r from-[#008F8C] to-[#0FC2C0] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center pt-4 border-t border-[#0CABA8]/20">
            <Link href="/login" className="text-[#0CABA8] hover:underline font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 