"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { CheckCircle, ArrowRight, Rocket, Users, FolderPlus, Calendar } from "lucide-react";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  completed: boolean;
}

export default function WelcomePage() {
  const { user } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: "workspace",
      title: "Create your first workspace",
      description: "Set up a workspace to organize your team and projects",
      icon: <Users size={24} />,
      href: "/dashboard/workspaces",
      completed: completedSteps.includes("workspace")
    },
    {
      id: "project",
      title: "Start your first project",
      description: "Create a project to track tasks and collaborate with your team",
      icon: <FolderPlus size={24} />,
      href: "/dashboard/projects/new",
      completed: completedSteps.includes("project")
    },
    {
      id: "calendar",
      title: "Set up your calendar",
      description: "Schedule events and deadlines to stay organized",
      icon: <Calendar size={24} />,
      href: "/dashboard/calendar",
      completed: completedSteps.includes("calendar")
    }
  ];

  const completionPercentage = Math.round((completedSteps.length / onboardingSteps.length) * 100);

  useEffect(() => {
    // Check if user has completed any steps (you'd fetch this from your API)
    // For now, we'll use localStorage to persist progress
    const saved = localStorage.getItem('onboarding-progress');
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  const markStepCompleted = (stepId: string) => {
    const updated = [...completedSteps, stepId];
    setCompletedSteps(updated);
    localStorage.setItem('onboarding-progress', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6FFFE] to-[#E6FDFC] p-6">
      <style jsx>{`
        .progress-bar {
          width: ${completionPercentage}%;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#0FC2C0] to-[#0CABA8] rounded-full flex items-center justify-center mb-6">
            <Rocket size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#015958] mb-4">
            Welcome to WorkSync, {user?.firstName || 'there'}! 🎉
          </h1>
          <p className="text-xl text-[#0CABA8] max-w-2xl mx-auto">
            Let's get you set up with everything you need to manage your projects and collaborate with your team.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-[#0CABA8]/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[#015958]">Getting Started</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#0FC2C0]">{completionPercentage}%</div>
              <div className="text-sm text-[#0CABA8]">Complete</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div className="progress-bar bg-gradient-to-r from-[#008F8C] to-[#0FC2C0] h-3 rounded-full transition-all duration-500"></div>
          </div>

          {/* Onboarding Steps */}
          <div className="space-y-4">
            {onboardingSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  step.completed 
                    ? 'border-[#0FC2C0] bg-[#0FC2C0]/5' 
                    : 'border-gray-200 hover:border-[#0CABA8]/30 hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  step.completed 
                    ? 'bg-[#0FC2C0] text-white' 
                    : 'bg-[#F6FFFE] text-[#0CABA8] border-2 border-[#0CABA8]/20'
                }`}>
                  {step.completed ? <CheckCircle size={24} /> : step.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold ${step.completed ? 'text-[#015958]' : 'text-[#015958]'}`}>
                    {step.title}
                  </h3>
                  <p className="text-[#0CABA8] text-sm">{step.description}</p>
                </div>

                {!step.completed && (
                  <Link 
                    href={step.href}
                    className="ml-4 bg-[#008F8C] text-white px-4 py-2 rounded-lg hover:bg-[#0FC2C0] transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                    onClick={() => markStepCompleted(step.id)}
                  >
                    Start
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Skip Option */}
          <div className="mt-8 text-center">
            <Link 
              href="/dashboard/dashboard"
              className="text-[#0CABA8] hover:underline text-sm"
            >
              Skip setup and go to dashboard →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-[#0CABA8]/10 hover:shadow-xl transition-shadow">
            <h3 className="font-semibold text-[#015958] mb-2">Need Help?</h3>
            <p className="text-[#0CABA8] text-sm mb-4">Check out our guides and tutorials</p>
            <Link href="/help" className="text-[#0FC2C0] hover:underline text-sm font-medium">
              View Documentation →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-[#0CABA8]/10 hover:shadow-xl transition-shadow">
            <h3 className="font-semibold text-[#015958] mb-2">Invite Team</h3>
            <p className="text-[#0CABA8] text-sm mb-4">Collaborate with your colleagues</p>
            <Link href="/dashboard/workspace/invite" className="text-[#0FC2C0] hover:underline text-sm font-medium">
              Send Invites →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-[#0CABA8]/10 hover:shadow-xl transition-shadow">
            <h3 className="font-semibold text-[#015958] mb-2">Mobile App</h3>
            <p className="text-[#0CABA8] text-sm mb-4">Take WorkSync on the go</p>
            <Link href="/mobile" className="text-[#0FC2C0] hover:underline text-sm font-medium">
              Download App →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
