"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/core/providers/AuthProvider";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { PasswordResetModal } from "@/features/auth/components/PasswordResetModal";
import { CreateAccountModal } from "@/features/auth/components/CreateAccountModal";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import iconImage from "@/app/icon.png";
import styles from "@/styles/login.module.css";

export default function HomePage() {
    const { user, logout } = useAuth();
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

    if (user) {
        return (
            <main className="min-h-screen bg-slate-50">
                <DashboardShell user={user} onLogout={logout} />
            </main>
        );
    }

    return (
        <main className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <div className={styles.loginHaloTop} />
                <div className={styles.loginHaloBottom} />

                <div className={styles.loginHeader}>
                    <div className={styles.loginIconContainer}>
                        <Image
                            src={iconImage}
                            alt="Ecometrix Logo"
                            width={64}
                            height={64}
                            className={styles.loginIcon}
                        />
                    </div>

                    <p className={styles.loginTitle}>Ecometrix</p>

                    <h1 className={styles.loginSubtitle}>
                        Accede a tu panel de control
                    </h1>

                    <p className={styles.loginDescription}>
                        Gestiona tus clientes MiVivienda y Techo Propio desde un solo lugar.
                    </p>

                    <div className={styles.loginCardWrapper}>
                        <LoginCard
                            onForgotPassword={() => setShowRecoveryModal(true)}
                            onCreateAccount={() => setShowCreateAccountModal(true)}
                        />
                    </div>
                </div>
            </div>

            <PasswordResetModal
                open={showRecoveryModal}
                onClose={() => setShowRecoveryModal(false)}
            />
            <CreateAccountModal
                open={showCreateAccountModal}
                onClose={() => setShowCreateAccountModal(false)}
            />
        </main>
    );
}
