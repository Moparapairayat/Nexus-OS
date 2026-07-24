"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthSession, UserProfile } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType extends AuthSession {
  signOut: (scope?: "local" | "global") => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createClient();

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setAccessToken(session.access_token);
        setExpiresAt(session.expires_at || null);

        const authUser = session.user;
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          fullName: authUser.user_metadata?.full_name || null,
          avatarUrl: authUser.user_metadata?.avatar_url || null,
          role: authUser.user_metadata?.role || "client",
          phone: authUser.user_metadata?.phone || null,
          companyName: authUser.user_metadata?.company_name || null,
          timezone: authUser.user_metadata?.timezone || "UTC",
          language: authUser.user_metadata?.language || "en",
          accountStatus: "active",
          createdAt: authUser.created_at,
          updatedAt: authUser.updated_at || authUser.created_at,
        });
      } else {
        setUser(null);
        setAccessToken(null);
        setExpiresAt(null);
      }
    } catch (error) {
      console.error("Error retrieving auth session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAccessToken(session.access_token);
        setExpiresAt(session.expires_at || null);
        const authUser = session.user;
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          fullName: authUser.user_metadata?.full_name || null,
          avatarUrl: authUser.user_metadata?.avatar_url || null,
          role: authUser.user_metadata?.role || "client",
          phone: authUser.user_metadata?.phone || null,
          companyName: authUser.user_metadata?.company_name || null,
          timezone: authUser.user_metadata?.timezone || "UTC",
          language: authUser.user_metadata?.language || "en",
          accountStatus: "active",
          createdAt: authUser.created_at,
          updatedAt: authUser.updated_at || authUser.created_at,
        });
      } else {
        setUser(null);
        setAccessToken(null);
        setExpiresAt(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (scope: "local" | "global" = "local") => {
    await supabase.auth.signOut({ scope });
    setUser(null);
    setAccessToken(null);
    setExpiresAt(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        expiresAt,
        isAuthenticated: !!user,
        isLoading,
        signOut,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
