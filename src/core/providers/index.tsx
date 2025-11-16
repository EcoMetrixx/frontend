"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/core/providers/AuthProvider";

const queryClient = new QueryClient({
    defaultOptions : {
        queries: {
            refetchOnWindowFocus: false
        }
    }
});

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={ queryClient }>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}