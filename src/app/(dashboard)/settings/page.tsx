"use client";
import { useState, useEffect } from "react";
import { Button } from '../../../components/Button';
import { 
  User, 
  Bell, 
  Shield, 
  Save,
  Mail,
  Lock
} from 'lucide-react';
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../api";
import { useToast } from "../../../components/toast";

const tabs = [
  { name: "Profile", icon: User, description: "Manage your account information" },
  { name: "Notifications", icon: Bell, description: "Configure alert preferences" },
  { name: "Security", icon: Shield, description: "Password and security settings" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("Profile");
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    username: ""
  });
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(true);

  // Load current user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.name || "",
        email: user.email || "",
        username: user.userName || user.username || ""
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Split name into first and last name if needed
      const nameParts = profileForm.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await api.put('/users/profile', {
        name: profileForm.name,
        email: profileForm.email,
        username: profileForm.username,
        firstName,
        lastName
      });

      addToast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "success"
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      addToast({
        title: "Update Failed",
        description: error?.response?.data?.message || "Failed to update profile. Please try again.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement notification preferences API
      addToast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
        variant: "success"
      });
    } catch (error: any) {
      addToast({
        title: "Save Failed",
        description: "Failed to save notification preferences.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6FFFE] to-[#E8FFFE] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#015958] mb-2">Settings</h1>
          <p className="text-[#0CABA8] text-lg">Manage your account preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg border border-[#0CABA8]/10 p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={`w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.name
                        ? 'bg-gradient-to-r from-[#0FC2C0] to-[#0CABA8] text-white shadow-md'
                        : 'text-[#015958] hover:bg-[#F6FFFE] hover:shadow-sm'
                    }`}
                    onClick={() => setActiveTab(tab.name)}
                  >
                    <tab.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">{tab.name}</div>
                      <div className={`text-xs mt-1 ${
                        activeTab === tab.name ? 'text-white/80' : 'text-[#0CABA8]'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg border border-[#0CABA8]/10 overflow-hidden">
              {/* Tab Content Header */}
              <div className="border-b border-[#0CABA8]/10 bg-gradient-to-r from-[#F6FFFE] to-white p-6">
                <div className="flex items-center gap-3">
                  {tabs.find(tab => tab.name === activeTab)?.icon && (
                    <div className="p-2 bg-[#0FC2C0]/10 rounded-lg">
                      {(() => {
                        const IconComponent = tabs.find(tab => tab.name === activeTab)?.icon;
                        return IconComponent ? <IconComponent className="h-6 w-6 text-[#0FC2C0]" /> : null;
                      })()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-[#015958]">{activeTab}</h2>
                    <p className="text-[#0CABA8] text-sm">
                      {tabs.find(tab => tab.name === activeTab)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "Profile" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="profile-name" className="flex items-center gap-2 text-[#015958] font-semibold mb-2">
                          <User className="h-4 w-4" />
                          Display Name
                        </label>
                        <input 
                          id="profile-name" 
                          type="text"
                          placeholder="Enter your name" 
                          className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] transition-all duration-200" 
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label htmlFor="profile-email" className="flex items-center gap-2 text-[#015958] font-semibold mb-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </label>
                        <input 
                          id="profile-email" 
                          type="email"
                          placeholder="Enter your email" 
                          className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] transition-all duration-200" 
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="profile-username" className="flex items-center gap-2 text-[#015958] font-semibold mb-2">
                          <User className="h-4 w-4" />
                          Username
                        </label>
                        <input 
                          id="profile-username" 
                          type="text"
                          placeholder="Enter your username" 
                          className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] transition-all duration-200" 
                          value={profileForm.username}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-[#0CABA8]/10 pt-6">
                      <h3 className="text-lg font-semibold text-[#015958] mb-4">Profile Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#F6FFFE] rounded-lg border border-[#0CABA8]/10">
                          <div>
                            <div className="font-medium text-[#015958]">Profile Visibility</div>
                            <div className="text-sm text-[#0CABA8]">Control who can see your profile information</div>
                          </div>
                          <select 
                            className="px-3 py-2 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-white"
                            aria-label="Profile visibility setting"
                            title="Select who can view your profile"
                          >
                            <option>Workspace Members</option>
                            <option>Everyone</option>
                            <option>Private</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-gradient-to-r from-[#0FC2C0] to-[#0CABA8] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === "Notifications" && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {[
                        {
                          title: "Email Notifications",
                          description: "Receive notifications via email",
                          checked: emailNotifications,
                          onChange: setEmailNotifications
                        },
                        {
                          title: "Push Notifications",
                          description: "Get browser push notifications",
                          checked: pushNotifications,
                          onChange: setPushNotifications
                        },
                        {
                          title: "Weekly Summary",
                          description: "Get a weekly summary of your activity",
                          checked: weeklySummary,
                          onChange: setWeeklySummary
                        }
                      ].map((notification, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-[#F6FFFE] rounded-lg border border-[#0CABA8]/10 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${notification.checked ? 'bg-[#0FC2C0]/10' : 'bg-gray-100'}`}>
                              <Bell className={`h-4 w-4 ${notification.checked ? 'text-[#0FC2C0]' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <div className="font-medium text-[#015958]">{notification.title}</div>
                              <div className="text-sm text-[#0CABA8]">{notification.description}</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={notification.checked}
                              onChange={(e) => notification.onChange(e.target.checked)}
                              aria-label={`Toggle ${notification.title}`}
                              title={`Toggle ${notification.title}`}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0FC2C0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0FC2C0]"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#0CABA8]/10 pt-6">
                      <h3 className="text-lg font-semibold text-[#015958] mb-4">Notification Frequency</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#015958] font-medium mb-2">Task Updates</label>
                          <select 
                            className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-white"
                            aria-label="Task update notification frequency"
                            title="Select how often you want task update notifications"
                          >
                            <option>Immediately</option>
                            <option>Daily Digest</option>
                            <option>Weekly Digest</option>
                            <option>Never</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#015958] font-medium mb-2">Project Updates</label>
                          <select 
                            className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-white"
                            aria-label="Project update notification frequency"
                            title="Select how often you want project update notifications"
                          >
                            <option>Immediately</option>
                            <option>Daily Digest</option>
                            <option>Weekly Digest</option>
                            <option>Never</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveNotifications}
                        disabled={loading}
                        className="bg-gradient-to-r from-[#0FC2C0] to-[#0CABA8] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : "Save Preferences"}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === "Security" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#015958] mb-4">Password & Authentication</h3>
                      <div className="space-y-4">
                        <Link 
                          href="/forgot-password" 
                          className="flex items-center gap-3 p-4 bg-[#F6FFFE] rounded-lg border border-[#0CABA8]/10 hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="p-2 bg-[#0FC2C0]/10 rounded-lg group-hover:bg-[#0FC2C0]/20 transition-colors">
                            <Lock className="h-4 w-4 text-[#0FC2C0]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#015958]">Change Password</div>
                            <div className="text-sm text-[#0CABA8]">Update your account password</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div className="border-t border-[#0CABA8]/10 pt-6">
                      <h3 className="text-lg font-semibold text-[#015958] mb-4">Security Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#F6FFFE] rounded-lg border border-[#0CABA8]/10">
                          <div>
                            <div className="font-medium text-[#015958]">Two-Factor Authentication</div>
                            <div className="text-sm text-[#0CABA8]">Add an extra layer of security to your account</div>
                          </div>
                          <Button className="bg-[#0FC2C0] text-white px-4 py-2 rounded-lg hover:bg-[#0CABA8] transition-colors">
                            Enable 2FA
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#F6FFFE] rounded-lg border border-[#0CABA8]/10">
                          <div>
                            <div className="font-medium text-[#015958]">Active Sessions</div>
                            <div className="text-sm text-[#0CABA8]">Manage your active login sessions</div>
                          </div>
                          <Button className="bg-gray-100 text-[#015958] px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                            View Sessions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
