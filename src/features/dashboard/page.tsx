// src/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/providers/AuthProvider";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  return <DashboardShell user={user} onLogout={logout} />;
}
