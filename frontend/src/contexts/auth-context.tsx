"use client";

import type React from "react";

import { api } from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    twoFactorCode?: string
  ) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  signup: async () => ({}),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      // In a real app, you would fetch the user profile here
      // For demo purposes, we'll decode the JWT to get the user ID
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Mock user data based on the token
      setUser({
        id: payload.id,
        username: "User" + payload.id.substring(0, 4),
        email: "user" + payload.id.substring(0, 4) + "@example.com",
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    twoFactorCode?: string
  ) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        twoFactorCode,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      await fetchUser(token);
    } catch (error: any) {
      if (
        error.response?.status === 401 &&
        error.response?.data?.error === "Invalid 2FA code"
      ) {
        throw new Error("2FA required");
      }
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
      });

      const { token, twoFactorSecret } = response.data;
      localStorage.setItem("token", token);
      await fetchUser(token);

      return { twoFactorSecret };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
