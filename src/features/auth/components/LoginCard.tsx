"use client";
import { FormEvent, useState } from "react";
import {AlertCircle,Eye,EyeOff,KeyRound,Lock,LogIn,Mail,UserPlus,} from "lucide-react";
import { useAuth } from "@/core/providers/AuthProvider";
import styles from "@/styles/loginCard.module.css";

interface LoginCardProps {
    onForgotPassword: () => void;
    onCreateAccount: () => void;
}

export function LoginCard({ onForgotPassword, onCreateAccount }: LoginCardProps) {
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
            setError(
                "Credenciales incorrectas. Intenta nuevamente o recupera tu contraseña."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.loginCard}>
            <div className={styles.formField}>
                <label htmlFor="email" className={styles.formLabel}>
                    Correo electrónico / Usuario
                </label>
                <div className={styles.inputContainer}>
                    <Mail className={styles.inputIcon} />
                    <input
                        id="email"
                        type="email"
                        className={styles.inputField}
                        placeholder="usuario@empresa.com"
                        value={email}
                        autoComplete="email"
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>
            </div>

            <div className={styles.formField}>
                <label htmlFor="password" className={styles.formLabel}>
                    Contraseña
                </label>
                <div className={styles.inputContainer}>
                    <Lock className={styles.inputIcon} />
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={styles.inputField}
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        autoComplete="current-password"
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? (
                            <EyeOff className={styles.passwordToggleIcon} />
                        ) : (
                            <Eye className={styles.passwordToggleIcon} />
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    <AlertCircle className={styles.errorIcon} />
                    <p>{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className={styles.primaryButton}
            >
                <LogIn className={styles.primaryButtonIcon} />
                <span>{isSubmitting ? "Verificando..." : "Iniciar sesión"}</span>
            </button>

            <div className={styles.separator}>
                <span className={styles.separatorLine} />
                <span className={styles.separatorText}>o</span>
                <span className={styles.separatorLine} />
            </div>

            <button
                type="button"
                onClick={onForgotPassword}
                className={styles.secondaryButton}
            >
                <KeyRound className={styles.secondaryButtonIcon} />
                <span>¿Olvidaste tu contraseña?</span>
            </button>

            <button
                type="button"
                className={styles.successButton}
                onClick={onCreateAccount}
            >
                <UserPlus className={styles.successButtonIcon} />
                <span>Crear nueva cuenta</span>
            </button>

            <div className={styles.footer}>
                <p className={styles.footerCopyright}>
                    © 2024 Ecometrix. Todos los derechos reservados.
                </p>
                <p className={styles.footerVersion}>Versión 2.1.0</p>
            </div>
        </form>
    );
}
