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

  const inputBase =
    "w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400";

  const inputWrapper =
    "mt-1 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 " +
    "focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl">
        <div
          className="
            relative mx-auto flex max-h-[85vh] flex-col
            rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-slate-100
            shadow-[0_18px_45px_rgba(15,23,42,0.35)]
          "
        >
          {/* borde + shadow interno */}
          <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/70 shadow-inner shadow-slate-200/80" />

          <div className="relative flex h-full flex-col">
            {/* HEADER */}
            <div className="relative border-b border-slate-100 px-8 pt-6 pb-4">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                  Crear nueva cuenta
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Regístrate</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Completa el formulario para crear tu cuenta en Ecometrix.
                </p>
              </div>
            </div>

            {/* BODY + FOOTER */}
            <form
              onSubmit={handleSubmit}
              className="
                flex flex-1 flex-col gap-6
                overflow-y-auto px-8 pt-5 pb-7
              "
            >
              {/* Datos personales */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600" htmlFor="name">
                    Nombre completo
                  </label>
                  <div className={inputWrapper}>
                    <User className="h-4 w-4 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputBase}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-xs font-medium text-slate-600"
                    htmlFor="create-email"
                  >
                    Correo electrónico
                  </label>
                  <div className={inputWrapper}>
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      id="create-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputBase}
                      placeholder="usuario@empresa.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* DNI / Teléfono */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600" htmlFor="dni">
                    DNI
                  </label>
                  <div className={inputWrapper}>
                    <IdCard className="h-4 w-4 text-slate-400" />
                    <input
                      id="dni"
                      type="text"
                      value={formData.dni}
                      onChange={(e) =>
                        setFormData({ ...formData, dni: e.target.value })
                      }
                      className={inputBase}
                      placeholder="12345678"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-xs font-medium text-slate-600"
                    htmlFor="phone"
                  >
                    Teléfono
                  </label>
                  <div className={inputWrapper}>
                    <Phone className="h-4 w-4 text-slate-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={inputBase}
                      placeholder="+51987654321"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="text-xs font-medium text-slate-600"
                    htmlFor="create-password"
                  >
                    Contraseña
                  </label>
                  <div className={inputWrapper}>
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      id="create-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={inputBase}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-xs font-medium text-slate-600"
                    htmlFor="confirm-password"
                  >
                    Confirmar contraseña
                  </label>
                  <div className={inputWrapper}>
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      id="confirm-password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={inputBase}
                      placeholder="Confirma tu contraseña"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

          {/* FOOTER */}
          <div className="mt-4 flex justify-center border-t border-slate-100 pt-4">
            {/* Botón verde CREAR CUENTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#16a34a",   // verde
                color: "#ffffff",
                borderRadius: "9999px",
                padding: "8px 22px",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              Crear cuenta
            </button>

            {/* Botón CANCELAR texto negro */}
            <button
              type="button"
              onClick={handleClose}
              style={{
                backgroundColor: "transparent",
                color: "#111827",            // negro/gris oscuro
                borderRadius: "9999px",
                padding: "8px 22px",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                marginLeft: "12px",
              }}
            >
              Cancelar
            </button>
          </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


