"use client";

import { useState } from "react";
import { LineChart } from "lucide-react";
import { useAuth } from "@/core/providers/AuthProvider";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { PasswordResetModal } from "@/features/auth/components/PasswordResetModal";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#E6ECFB] via-[#EFF2FC] to-[#E4EBFD]">
      {!user ? (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(32,97,255,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(29,158,69,0.12),transparent_60%)]" />
          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-[#1F67FF] shadow-[0_15px_35px_rgba(31,103,255,0.25)]">
              <LineChart className="h-8 w-8" />
            </span>
            <p className="text-base font-semibold text-[#1F3F73]">Sistema CRM</p>
            <h1 className="text-3xl font-semibold text-[#162447]">Accede a tu panel de control</h1>
            <p className="mt-2 text-base text-slate-500">Gestiona tus clientes MiVivienda y Techo Propio desde un solo lugar.</p>
            <div className="mt-8 w-full">
              <LoginCard onForgotPassword={() => setShowRecoveryModal(true)} />
            </div>
          </div>
        </section>
      ) : (
        <DashboardShell user={user} onLogout={logout} />
      )}

      <PasswordResetModal open={showRecoveryModal} onClose={() => setShowRecoveryModal(false)} />
    </main>
  );
}