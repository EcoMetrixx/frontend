"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ErrorHandler } from "../error-handling/ErrorHandler";
import { InvalidCredentialsError } from "../errors";

const StorageKeys = {
    USER: "auth:user",
} as const;

const MOCK_USER = {
    id: "advisor-001",
    name: "Juan Torres",
    email: "user@dwduqs.com",
    role: "Asesor Hipotecario",
};

export type AuthUser = typeof MOCK_USER;

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
            await new Promise((resolve) => setTimeout(resolve, 700));

            const normalizedEmail = email.trim().toLowerCase();
            const isValidUser = normalizedEmail === MOCK_USER.email && password === "miVivienda#2024";

            if (!isValidUser) {
                throw new InvalidCredentialsError();
            }

            setUser(MOCK_USER);
            localStorage.setItem(StorageKeys.USER, JSON.stringify(MOCK_USER));
        } catch (error) {
            ErrorHandler.handle(error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(StorageKeys.USER);
    };

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(StorageKeys.USER);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch {
            localStorage.removeItem(StorageKeys.USER);
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
    if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
    return context;
};