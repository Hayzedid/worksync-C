"use client";
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { api } from "../api";

interface User {
  id: string; // Changed from number to string for consistency
  email: string;
  firstName: string;
  lastName: string;
  userName?: string;
  username?: string; // Backend field name
  name?: string; // Computed field
  avatar?: string; // Added avatar property for time tracking and other features
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      const data = response as any;
      
      if (data.success && data.user) {
        const userData = data.user;
        
        // Ensure all required fields are present with fallbacks
        const processedUser = {
          id: String(userData.id || ''),
          email: userData.email || '',
          firstName: userData.firstName || userData.first_name || 'User',
          lastName: userData.lastName || userData.last_name || '',
          userName: userData.userName || userData.username || '',
          username: userData.username || userData.userName || '',
          name: userData.name || `${userData.firstName || userData.first_name || 'User'} ${userData.lastName || userData.last_name || ''}`.trim(),
          avatar: userData.avatar || null
        };
        
        setUser(processedUser);
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('access_token');
        }
      }
    } catch (error: any) {
      // Don't log network errors in refresh - backend might not be available
      if (!error.message?.includes('Backend server not running') && 
          !error.message?.includes('Failed to fetch') && 
          !error.message?.includes('Unable to connect')) {
        console.error('Auth refresh error:', error);
      }
      setUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('access_token');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response as any;
      
      if (data.success && data.token) {
        // Store token in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('access_token', data.token);
          // Trigger a custom event to notify socket provider of authentication change
          window.dispatchEvent(new CustomEvent('auth-change'));
        }
        
        // Set user data with proper field handling
        const userData = data.user;
        const processedUser = {
          id: String(userData.id || ''),
          email: userData.email || '',
          firstName: userData.firstName || userData.first_name || 'User',
          lastName: userData.lastName || userData.last_name || '',
          userName: userData.userName || userData.username || '',
          username: userData.username || userData.userName || '',
          name: userData.name || `${userData.firstName || userData.first_name || 'User'} ${userData.lastName || userData.last_name || ''}`.trim(),
          avatar: userData.avatar || null
        };
        setUser(processedUser);
        
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific network/backend errors
      if (error.message?.includes('Backend server not running')) {
        return { 
          success: false, 
          message: 'Backend server not available. Please ensure the API server is running on port 4100.' 
        };
      } else if (error.message?.includes('Unable to connect')) {
        return { 
          success: false, 
          message: 'Unable to connect to server. Please check your internet connection.' 
        };
      } else if (error.message?.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: 'Network error: Could not reach the server. Please ensure the backend API is running.' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      const data = response as any;
      
      if (data.success && data.token) {
        // Store token in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('access_token', data.token);
        }
        
        // Set user data with proper field handling
        const userInfo = data.user;
        const processedUser = {
          id: String(userInfo.id || ''),
          email: userInfo.email || '',
          firstName: userInfo.firstName || userInfo.first_name || 'User',
          lastName: userInfo.lastName || userInfo.last_name || '',
          userName: userInfo.userName || userInfo.username || '',
          username: userInfo.username || userInfo.userName || '',
          name: userInfo.name || `${userInfo.firstName || userInfo.first_name || 'User'} ${userInfo.lastName || userInfo.last_name || ''}`.trim(),
          avatar: userInfo.avatar || null
        };
        setUser(processedUser);
        
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific network/backend errors
      if (error.message?.includes('Backend server not running')) {
        return { 
          success: false, 
          message: 'Backend server not available. Please ensure the API server is running on port 4100.' 
        };
      } else if (error.message?.includes('Unable to connect')) {
        return { 
          success: false, 
          message: 'Unable to connect to server. Please check your internet connection.' 
        };
      } else if (error.message?.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: 'Network error: Could not reach the server. Please ensure the backend API is running.' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token');
      // Trigger a custom event to notify socket provider of authentication change
      window.dispatchEvent(new CustomEvent('auth-change'));
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 