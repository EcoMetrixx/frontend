"use client";

import { FormEvent, useState } from "react";
import { Mail, Send, X } from "lucide-react";
import toast from "react-hot-toast";

interface PasswordResetModalProps {
    open: boolean;
    onClose: () => void;
}

export function PasswordResetModal({ open, onClose }: PasswordResetModalProps) {
    if (!open) return null;
    return <PasswordResetModalContent onRequestClose={onClose} />;
}

function PasswordResetModalContent({ onRequestClose }: { onRequestClose: () => void }) {
    const [email, setEmail] = useState("usuario@empresa.com");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setEmail("usuario@empresa.com");
        setIsSubmitting(false);
        onRequestClose();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success("Enlace de recuperación enviado");
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                            Recuperar contraseña
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Ingresa tu correo</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Te enviaremos un enlace seguro para restablecer tu contraseña.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Cerrar modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                    <label className="text-sm font-medium text-slate-600" htmlFor="reset-email">
                        Correo electrónico
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <input
                            id="reset-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                            placeholder="usuario@empresa.com"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700 disabled:opacity-60"
                            disabled={isSubmitting}
                        >
                            <Send className="h-4 w-4" />
                            {isSubmitting ? "Enviando..." : "Enviar enlace"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

