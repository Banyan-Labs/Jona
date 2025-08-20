
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AuthUser } from "@/types/application";
import { useSessionManager } from "@/hooks/useSessionManager";

interface AuthUserContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  setCurrentPageAction: (action: string) => void;
  showTimeoutWarning: boolean;
  handleLogout: () => void;
  resetAuthTimeout: () => void;
}

export const AuthUserContext = createContext<AuthUserContextType | undefined>(
  undefined
);

export const AuthUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [, setCurrentPageAction] = useState<string>("");

  const {
    showTimeoutWarning,
    resetAuthTimeout,
    handleLogout,
  } = useSessionManager(setUser);

  useEffect(() => {
    if (user) {
      resetAuthTimeout();
    }
  }, [user, resetAuthTimeout]);

  return (
    <AuthUserContext.Provider
      value={{
        user,
        setUser,
        setCurrentPageAction,
        showTimeoutWarning,
        handleLogout,
        resetAuthTimeout,
      }}
    >
      {children}
    </AuthUserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(AuthUserContext);
  if (!context) {
    throw new Error("useUserContext must be used within an AuthUserProvider");
  }
  return context;
};