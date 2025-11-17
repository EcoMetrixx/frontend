"use client";

import { Bell, Building2, FileBarChart, Home, LayoutDashboard, LogOut, Search, Settings2, Users } from "lucide-react";
import { ClientWizard } from "@/features/clients/components/ClientWizard";
import type { AuthUser } from "@/core/providers/AuthProvider";

interface DashboardShellProps {
    user: AuthUser;
    onLogout: () => void;
}

const navItems = [
    { icon: Home, label: "Clientes", active: true },
    { icon: Building2, label: "Proyectos / Viviendas" },
    { icon: LayoutDashboard, label: "Simulaciones" },
    { icon: FileBarChart, label: "Reportes" },
    { icon: Settings2, label: "Configuración" },
];

const filterFields = [
    { label: "Bono", placeholder: "Todos los bonos" },
    { label: "Banco", placeholder: "Todos los bancos" },
    { label: "Estado del Crédito", placeholder: "Todos los estados" },
    { label: "Asesor Asignado", placeholder: "Todos los asesores" },
];

const registeredClients = [
    {
        initials: "JP",
        name: "José Pérez",
        email: "jose.perez@email.com",
        dni: "12345678",
        bonus: "MiVivienda",
        bank: "BCP",
        creditStatus: "En Proceso",
        advisor: "Juan Torres",
        statusClass: "bg-amber-100 text-amber-700",
        badgeLabel: "En Proceso",
    },
    {
        initials: "MG",
        name: "María González",
        email: "maria.gonzalez@email.com",
        dni: "87654321",
        bonus: "Techo Propio",
        bank: "BBVA",
        creditStatus: "Aprobado",
        advisor: "Ana Rivas",
        statusClass: "bg-emerald-100 text-emerald-700",
        badgeLabel: "Aprobado",
    },
    {
        initials: "CL",
        name: "Carlos López",
        email: "carlos.lopez@email.com",
        dni: "11223344",
        bonus: "MiVivienda",
        bank: "Interbank",
        creditStatus: "Rechazado",
        advisor: "Juan Torres",
        statusClass: "bg-rose-100 text-rose-700",
        badgeLabel: "Rechazado",
    },
];

export function DashboardShell({ user, onLogout }: DashboardShellProps) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-100 bg-white/80 p-6 lg:flex">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                        <Home className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">InmoGest Pro</p>
                        <p className="text-lg font-semibold text-slate-900">Sistema CRM</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${item.active
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                    : "text-slate-500 hover:bg-slate-100"
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Cliente activo</p>
                    <p className="mt-1 text-sm text-slate-500">José Pérez · DNI 12345678</p>
                    <span className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Aplicar: MiVivienda
                    </span>
                </div>
            </aside>

            <main className="flex-1 px-4 py-8 sm:px-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Dashboard Principal</p>
                        <h1 className="text-3xl font-semibold text-slate-900">Bienvenido, {user.name}</h1>
                        <p className="text-sm text-slate-500">Rol: {user.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-white">
                            <Search className="h-5 w-5" />
                        </button>
                        <button className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-white">
                            <Bell className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500">Asesor</p>
                            </div>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="ml-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                            >
                                <span className="flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    Salir
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mt-8 grid gap-6">
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 text-sm text-emerald-800">
                        <p className="font-semibold">
                            Cliente activo: José Pérez (DNI 12345678) · Aplica: MiVivienda
                        </p>
                    </div>

                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-600">Filtros</p>
                                <p className="text-xs text-slate-400">Usa filtros rápidos para tus clientes</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50">
                                    Limpiar
                                </button>
                                <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700">
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-4">
                            {filterFields.map((field) => (
                                <div key={field.label} className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold uppercase text-slate-400">{field.label}</label>
                                    <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option>{field.placeholder}</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-slate-900">Clientes Registrados</h2>
                            <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700">
                                + Registrar Cliente
                            </button>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-left text-xs font-semibold uppercase text-slate-400">
                                        {["Cliente", "DNI", "Bono", "Banco", "Estado Crédito", "Acciones"].map((header) => (
                                            <th key={header} className="px-3 py-2">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {registeredClients.map((client) => (
                                        <tr key={client.dni} className="border-t border-slate-100 text-sm text-slate-600">
                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                                                        {client.initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{client.name}</p>
                                                        <p className="text-xs text-slate-400">{client.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">{client.dni}</td>
                                            <td className="px-3 py-4">{client.bonus}</td>
                                            <td className="px-3 py-4">{client.bank}</td>
                                            <td className="px-3 py-4">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${client.statusClass}`}>
                                                    {client.badgeLabel}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex gap-2 text-xs font-semibold text-indigo-600">
                                                    <button className="underline">Ver</button>
                                                    <button className="underline">Editar</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <ClientWizard />
                </div>
            </main>
        </div>
    );
}

