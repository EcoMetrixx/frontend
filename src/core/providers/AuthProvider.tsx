"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ErrorHandler } from "../error-handling/ErrorHandler";
import { InvalidCredentialsError } from "../errors";

const StorageKeys = {
    USER: "user"
} as const;

interface AuthContextProps {
    user: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}


const AuthContext = createContext<AuthContextProps | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        // TODO: create login logic

        if (email && password) { //test
            setUser(email); //test
            localStorage.setItem(StorageKeys.USER, email); // test
        } //test

        try {
            if(password = "aaa"){
                throw new InvalidCredentialsError();
            }

        } catch (error){
            ErrorHandler.handle(error);
            throw error;
        }
    }

    const logout = () => {
        // TODO: create logout logic

        setUser(null); // test
        localStorage.removeItem(StorageKeys.USER) //test
    }

    useEffect(() => {
        const storedUser = localStorage.getItem(StorageKeys.USER);
        if (storedUser) setUser(storedUser);
    }, []);


    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
    return context;
};