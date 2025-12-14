import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; name: string; email: string; isProfileComplete?: boolean; role?: string } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, preferredCategoryId?: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    // Check both 'token' and 'auth_token' for backwards compatibility
    return localStorage.getItem("token") || localStorage.getItem("auth_token");
  });
  const [user, setUser] = useState<User>(() => {
    // Check both 'user' and 'auth_user' for compatibility
    try {
      const raw = localStorage.getItem("user") || localStorage.getItem("auth_user");
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      // Clear invalid data
      localStorage.removeItem("user");
      localStorage.removeItem("auth_user");
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("auth_token", token); // Keep both for compatibility
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  async function login(email: string, password: string) {
    // Normalize email input (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Failed to parse login response:", parseError);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      if (!res.ok) {
        const message = data?.message || data?.error || `Login failed (${res.status})`;
        console.error("Login error:", {
          status: res.status,
          statusText: res.statusText,
          message: data?.message,
          error: data?.error,
          data
        });
        throw new Error(message);
      }
      
      if (!data.token || !data.user) {
        console.error("Login response missing token or user:", data);
        throw new Error("Invalid response from server - missing token or user data");
      }
      
      // Set token and user - this will trigger useEffects to store in localStorage
      setToken(data.token);
      setUser(data.user);
      
      // Also explicitly store in localStorage for immediate access
      localStorage.setItem("token", data.token);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      
      console.log("Login successful, user data stored");
    } catch (err: any) {
      console.error("Login function error:", err);
      throw err;
    }
  }

  async function register(name: string, email: string, password: string, preferredCategoryId?: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, preferredCategoryId })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.message || "Registration failed";
      throw new Error(message);
    }
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_user");
  }

  async function refreshMe() {
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const me = await res.json();
    setUser({ id: me.id, name: me.name, email: me.email });
  }

  const value = useMemo(() => ({ user, token, login, register, logout, refreshMe }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


