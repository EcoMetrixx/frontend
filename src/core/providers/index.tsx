"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/core/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
            >
                <AuthProvider>
                    {children}
                    <Toaster position="top-right"></Toaster>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}