"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";

export default function OnboardingStep1() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const router = useRouter();

  const handleNext = () => {
    if (form.firstName && form.lastName && form.username) {
      // Store in sessionStorage for multi-step flow
      sessionStorage.setItem('onboarding-step1', JSON.stringify(form));
      router.push('/onboarding/step-2');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0FC2C0] via-[#0CABA8] to-[#023535]">
      <div className="max-w-md w-full p-8 bg-white/95 rounded-2xl shadow-2xl border border-[#0CABA8]/30 backdrop-blur-md">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0FC2C0] rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
            <div className="w-12 h-1 bg-gray-200"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">2</div>
            <div className="w-12 h-1 bg-gray-200"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">3</div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#0FC2C0] to-[#0CABA8] rounded-full flex items-center justify-center mb-4">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#015958] mb-2">Welcome to WorkSync!</h1>
          <p className="text-[#0CABA8]">Let's start by getting to know you</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[#015958] mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({...form, firstName: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] transition-all"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[#015958] mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({...form, lastName: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] transition-all"
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#015958] mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE] transition-all"
              placeholder="Choose a username"
            />
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!form.firstName || !form.lastName || !form.username}
          className="w-full mt-8 bg-gradient-to-r from-[#008F8C] to-[#0FC2C0] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight size={20} />
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-[#0CABA8] hover:underline text-sm">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
