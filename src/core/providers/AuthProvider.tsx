// src/core/providers/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ErrorHandler } from "../error-handling/ErrorHandler";
import {
  loginRequest,
  type AuthUserDto,
} from "@/features/auth/services/authApi";

const StorageKeys = {
  USER: "auth:user",
  TOKEN: "auth:token",
} as const;

export type AuthUser = AuthUserDto;

interface AuthContextProps {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const result = await loginRequest(normalizedEmail, password);

      const apiUser = result.user;
      const accessToken = result.accessToken;

      if (!apiUser) {
        const error = new Error("Respuesta de login sin datos de usuario");
        (error as any).code = "AUTH_MALFORMED_RESPONSE";
        throw error;
      }

      setUser(apiUser);

      try {
        localStorage.setItem(StorageKeys.USER, JSON.stringify(apiUser));
        if (accessToken) {
          localStorage.setItem(StorageKeys.TOKEN, accessToken);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("AuthProvider: failed to persist auth to localStorage", e);
      }
    } catch (error) {
      ErrorHandler.handle(error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(StorageKeys.USER);
    localStorage.removeItem(StorageKeys.TOKEN);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(StorageKeys.USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(StorageKeys.USER);
      localStorage.removeItem(StorageKeys.TOKEN);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
