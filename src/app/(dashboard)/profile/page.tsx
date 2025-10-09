"use client";
import Link from "next/link";
import { User, Edit } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 border border-[#0CABA8]/20 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-[#0FC2C0]/20 flex items-center justify-center mb-4">
          <User className="h-16 w-16 text-[#0FC2C0]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0FC2C0] mb-1">
          {user?.name || `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim() || 'User'}
        </h1>
        <p className="text-[#015958] mb-4">{user?.email || 'No email'}</p>
        <div className="flex gap-6 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-[#0FC2C0]">12</div>
            <div className="text-[#015958] text-sm">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#0FC2C0]">34</div>
            <div className="text-[#015958] text-sm">Tasks Completed</div>
          </div>
        </div>
        <Link href="/profile/edit" className="flex items-center gap-2 px-6 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><Edit className="h-4 w-4" /> Edit Profile</Link>
      </div>
    </div>
  );
} 