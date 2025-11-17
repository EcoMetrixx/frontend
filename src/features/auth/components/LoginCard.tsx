"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, Eye, EyeOff, KeyRound, Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { useAuth } from "@/core/providers/AuthProvider";

interface LoginCardProps {
    onForgotPassword: () => void;
}

export function LoginCard({ onForgotPassword }: LoginCardProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState("user@dwduqs.com");
    const [password, setPassword] = useState("miVivienda#2024");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            await login(email, password);
        } catch {
            setError("Credenciales incorrectas. Intenta nuevamente o recupera tu contraseña.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-[28px] border border-slate-100 bg-white/95 p-8 text-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.18)] backdrop-blur"
            onSubmit={handleSubmit}
        >
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="email">
                    Correo electrónico / Usuario
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                        id="email"
                        type="email"
                        className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                        placeholder="usuario@empresa.com"
                        value={email}
                        autoComplete="email"
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="password">
                    Contraseña
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        autoComplete="current-password"
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                        type="button"
                        className="text-slate-400 transition hover:text-slate-600"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1F67FF] py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(31,103,255,0.35)] transition hover:bg-[#1955d1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F67FF] disabled:opacity-60"
                disabled={isSubmitting}
            >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Verificando..." : "Iniciar sesión"}
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-slate-300">o</span>
                <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
                type="button"
                onClick={onForgotPassword}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
                <KeyRound className="h-4 w-4" />
                ¿Olvidaste tu contraseña?
            </button>

            <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1D9E45] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(29,158,69,0.35)] transition hover:bg-[#18853a]"
            >
                <UserPlus className="h-4 w-4" />
                Crear nueva cuenta
            </button>

            <p className="pt-2 text-center text-[13px] text-slate-400">
                © 2024 Sistema CRM. Todos los derechos reservados. <br />
                <span className="font-semibold text-slate-500">Versión 2.1.0</span>
            </p>
        </form>
    );
}

