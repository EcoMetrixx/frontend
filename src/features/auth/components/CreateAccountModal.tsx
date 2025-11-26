"use client";

import { FormEvent, useState } from "react";
import { Mail, User, Lock, X, UserPlus, Phone, IdCard } from "lucide-react";
import toast from "react-hot-toast";
import { registerAdvisor } from "@/features/auth/services/authApi";

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAccountModal({ open, onClose }: CreateAccountModalProps) {
  if (!open) return null;
  return <CreateAccountModalContent onRequestClose={onClose} />;
}

function CreateAccountModalContent({ onRequestClose }: { onRequestClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dni: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      dni: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setIsSubmitting(false);
    onRequestClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerAdvisor({
        name: formData.name,
        email: formData.email,
        dni: formData.dni,
        phone: formData.phone,
        password: formData.password,
      });

      toast.success("Cuenta creada exitosamente. Ya puedes iniciar sesión.");
      handleClose();
    } catch (error: any) {
      if (error?.status === 400) {
        toast.error("Datos inválidos o email ya registrado.");
      } else {
        toast.error("Ocurrió un error al crear la cuenta.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Crear nueva cuenta
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Regístrate</h2>
            <p className="mt-1 text-sm text-slate-500">
              Completa el formulario para crear tu cuenta en Ecometrix.
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

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="name">
              Nombre completo
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <User className="h-4 w-4 text-slate-400" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Juan Pérez"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="create-email">
              Correo electrónico
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="usuario@empresa.com"
                required
              />
            </div>
          </div>

          {/* DNI */}
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="dni">
              DNI
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <IdCard className="h-4 w-4 text-slate-400" />
              <input
                id="dni"
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="12345678"
                required
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="phone">
              Teléfono
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <Phone className="h-4 w-4 text-slate-400" />
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="+51987654321"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="create-password">
              Contraseña
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="confirm-password">
              Confirmar contraseña
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Confirma tu contraseña"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Creando..." : "Crear cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
