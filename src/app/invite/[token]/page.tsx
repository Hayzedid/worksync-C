"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../api";
import { UserPlus, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "../../../components/toast";
import { useAuth } from "../../../hooks/useAuth";

interface InvitationDetails {
  workspaceName: string;
  inviterName: string;
  email: string;
  expiresAt: string;
}

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  const token = params?.token as string;

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/workspaces/invite/${token}`);
        setInvitationDetails(response);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.error || err?.message || "Failed to load invitation";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  // Auto-accept if user is logged in and email matches
  useEffect(() => {
    const autoAccept = async () => {
      if (!user || !invitationDetails || accepted || accepting) return;
      
      if (user.email?.toLowerCase() === invitationDetails.email?.toLowerCase()) {
        await handleAcceptInvitation();
      }
    };

    if (!authLoading) {
      autoAccept();
    }
  }, [user, invitationDetails, authLoading, accepted, accepting]);

  const handleAcceptInvitation = async () => {
    if (!user) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/invite/${token}`);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    setAccepting(true);
    try {
      const response = await api.post(`/workspaces/invite/${token}/accept`);
      setAccepted(true);
      addToast({
        title: "Invitation Accepted!",
        description: `Welcome to ${invitationDetails?.workspaceName}`,
        variant: "success"
      });
      
      // Redirect to workspace after a short delay
      setTimeout(() => {
        router.push(`/workspace?ws=${response.workspaceId}`);
      }, 2000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || "Failed to accept invitation";
      setError(errorMsg);
    } finally {
      setAccepting(false);
    }
  };

  const isExpired = invitationDetails && new Date(invitationDetails.expiresAt) < new Date();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0FC2C0] mx-auto mb-4"></div>
          <p className="text-[#015958]">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#015958] mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-block bg-[#0FC2C0] text-white px-6 py-2 rounded-lg hover:bg-[#0CABA8] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#015958] mb-4">Welcome!</h1>
          <p className="text-gray-600 mb-6">
            You've successfully joined <strong>{invitationDetails?.workspaceName}</strong>
          </p>
          <p className="text-sm text-gray-500">Redirecting to workspace...</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#015958] mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation to join <strong>{invitationDetails?.workspaceName}</strong> has expired.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact {invitationDetails?.inviterName} for a new invitation.
          </p>
          <Link 
            href="/"
            className="inline-block bg-[#0FC2C0] text-white px-6 py-2 rounded-lg hover:bg-[#0CABA8] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <UserPlus className="h-16 w-16 text-[#0FC2C0] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#015958] mb-2">You're Invited!</h1>
          <p className="text-gray-600">
            <strong>{invitationDetails?.inviterName}</strong> has invited you to join
          </p>
          <h2 className="text-xl font-semibold text-[#0FC2C0] mt-2">
            {invitationDetails?.workspaceName}
          </h2>
        </div>

        {!user ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-center mb-6">
              You need to sign in or create an account to accept this invitation.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const returnUrl = encodeURIComponent(`/invite/${token}`);
                  router.push(`/login?returnUrl=${returnUrl}`);
                }}
                className="w-full bg-[#0FC2C0] text-white py-3 px-4 rounded-lg hover:bg-[#0CABA8] transition-colors font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  const returnUrl = encodeURIComponent(`/invite/${token}`);
                  router.push(`/register?returnUrl=${returnUrl}&email=${encodeURIComponent(invitationDetails?.email || '')}`);
                }}
                className="w-full border-2 border-[#0FC2C0] text-[#0FC2C0] py-3 px-4 rounded-lg hover:bg-[#0FC2C0] hover:text-white transition-colors font-medium"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : user.email?.toLowerCase() !== invitationDetails?.email?.toLowerCase() ? (
          <div className="text-center">
            <p className="text-red-600 mb-4">
              This invitation is for <strong>{invitationDetails?.email}</strong>, 
              but you're signed in as <strong>{user.email}</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              Please sign in with the correct account or contact the person who invited you.
            </p>
            <button
              onClick={() => router.push('/logout')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Sign Out & Try Again
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Click below to accept the invitation and join the workspace.
            </p>
            <button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full bg-[#0FC2C0] text-white py-3 px-4 rounded-lg hover:bg-[#0CABA8] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? "Accepting..." : "Accept Invitation"}
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Invitation expires: {new Date(invitationDetails?.expiresAt || '').toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
