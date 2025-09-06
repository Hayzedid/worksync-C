"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../api";
import { useAuth } from "../../../../hooks/useAuth";
import { UserPlus, Clock, CheckCircle, XCircle, RotateCw } from "lucide-react";
import { useToast } from "../../../../components/toast";

interface InvitationDetails {
  workspaceName: string;
  inviterName: string;
  email: string;
  expiresAt: string;
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, login } = useAuth();
  const { addToast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [loginMode, setLoginMode] = useState(false);
  const [signupMode, setSignupMode] = useState(false);
  
  // Login/Signup form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");

  const token = params?.token as string;

  // Fetch invitation details
  useEffect(() => {
    if (!token) return;
    
    const fetchInvitation = async () => {
      try {
        const response = await api.get(`/workspaces/invite/${token}`);
        setInvitation(response);
        setEmail(response.email); // Pre-fill email
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invitation not found or expired');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  // Accept invitation (for logged-in users)
  const handleAcceptInvitation = async () => {
    if (!user) {
      setError("You must be logged in to accept this invitation");
      return;
    }

    setAccepting(true);
    try {
      const response = await api.post(`/workspaces/invite/${token}/accept`);
      addToast({ 
        title: "Invitation accepted!", 
        description: "You've been added to the workspace", 
        variant: "success" 
      });
      
      // Redirect to the workspace
      router.push(`/workspace?ws=${response.workspaceId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const result = await login(email, password);
      if (result.success) {
        // After login, automatically accept the invitation
        setTimeout(() => handleAcceptInvitation(), 500);
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err: any) {
      setError("Login failed");
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        userName
      });

      if (response.success) {
        // Auto-login after successful signup
        const loginResult = await login(email, password);
        if (loginResult.success) {
          // After login, automatically accept the invitation
          setTimeout(() => handleAcceptInvitation(), 500);
        }
      } else {
        setError(response.message || "Signup failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center">
        <div className="text-center">
          <RotateCw className="h-8 w-8 animate-spin text-[#0FC2C0] mx-auto mb-4" />
          <p className="text-[#015958]">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8 border border-red-200">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-700 text-center mb-4">Invitation Invalid</h1>
          <p className="text-red-600 text-center mb-6">{error}</p>
          <div className="text-center">
            <Link href="/login" className="text-[#0FC2C0] hover:underline">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8 border border-[#0CABA8]/20">
        <div className="text-center mb-6">
          <UserPlus className="h-12 w-12 text-[#0FC2C0] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#015958] mb-2">Workspace Invitation</h1>
          
          {invitation && (
            <div className="bg-[#F6FFFE] rounded-lg p-4 mb-4">
              <p className="text-[#015958] mb-2">
                <strong>{invitation.inviterName}</strong> has invited you to join
              </p>
              <p className="text-xl font-semibold text-[#0FC2C0] mb-2">
                "{invitation.workspaceName}"
              </p>
              <p className="text-sm text-gray-600 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1" />
                Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {user ? (
          // User is logged in - show accept button
          <div className="text-center">
            <p className="text-[#015958] mb-4">
              Welcome back, <strong>{user.firstName}</strong>!
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Click below to join the workspace
            </p>
            <button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full bg-[#0FC2C0] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0CABA8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {accepting ? (
                <>
                  <RotateCw className="h-5 w-5 animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Accept Invitation
                </>
              )}
            </button>
          </div>
        ) : (
          // User not logged in - show login/signup options
          <div>
            {!loginMode && !signupMode && (
              <div className="space-y-4">
                <p className="text-center text-[#015958] mb-6">
                  To join this workspace, you need to sign in or create an account
                </p>
                <button
                  onClick={() => setLoginMode(true)}
                  className="w-full bg-[#0FC2C0] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0CABA8]"
                >
                  I have an account - Sign In
                </button>
                <button
                  onClick={() => setSignupMode(true)}
                  className="w-full bg-white text-[#0FC2C0] py-3 px-4 rounded-lg font-semibold border-2 border-[#0FC2C0] hover:bg-[#F6FFFE]"
                >
                  I'm new - Create Account
                </button>
              </div>
            )}

            {loginMode && (
              <form onSubmit={handleLogin} className="space-y-4">
                <h2 className="text-xl font-bold text-[#015958] mb-4">Sign In</h2>
                <div>
                  <label className="block text-[#015958] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#015958] font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0FC2C0] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0CABA8]"
                >
                  Sign In & Join Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode(false)}
                  className="w-full text-[#0CABA8] hover:underline"
                >
                  Back
                </button>
              </form>
            )}

            {signupMode && (
              <form onSubmit={handleSignup} className="space-y-4">
                <h2 className="text-xl font-bold text-[#015958] mb-4">Create Account</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#015958] font-semibold mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#015958] font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#015958] font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#015958] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#015958] font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0FC2C0] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0CABA8]"
                >
                  Create Account & Join Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setSignupMode(false)}
                  className="w-full text-[#0CABA8] hover:underline"
                >
                  Back
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
