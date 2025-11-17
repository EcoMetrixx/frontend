"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, ClipboardCheck, LoaderCircle } from "lucide-react";

interface ClientWizardData {
    personal: {
        firstName: string;
        lastName: string;
        dni: string;
        birthDate: string;
        civilStatus: string;
        email: string;
        phone: string;
        address: string;
        region: string;
        province: string;
    };
    laboral: {
        employmentType: "DEPENDIENTE" | "INDEPENDIENTE";
        company: string;
        seniority: string;
        familyLoad: string;
    };
    financiera: {
        familyIncome: string;
        savings: string;
        debts: string;
        firstHome: boolean;
        notes: string;
    };
}

type EvaluationStatus = "idle" | "running" | "completed";

const steps = [
    { id: 1, label: "Datos Personales" },
    { id: 2, label: "Info. Laboral" },
    { id: 3, label: "Info. Financiera" },
    { id: 4, label: "Evaluación" },
] as const;

const defaultData: ClientWizardData = {
    personal: {
        firstName: "Juan Carlos",
        lastName: "Pérez García",
        dni: "12345678",
        birthDate: "1992-05-18",
        civilStatus: "",
        email: "jcarlos@correo.com",
        phone: "987654321",
        address: "Av. Los Laureles 123, Miraflores",
        region: "",
        province: "",
    },
    laboral: {
        employmentType: "DEPENDIENTE",
        company: "Constructora Andina",
        seniority: "",
        familyLoad: "",
    },
    financiera: {
        familyIncome: "5800",
        savings: "50000",
        debts: "0",
        firstHome: true,
        notes: "",
    },
};

export function ClientWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<ClientWizardData>(defaultData);
    const [evaluationStatus, setEvaluationStatus] = useState<EvaluationStatus>("idle");
    const evaluationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [registrationCompleted, setRegistrationCompleted] = useState(false);

    useEffect(() => {
        return () => {
            if (evaluationTimer.current) {
                clearTimeout(evaluationTimer.current);
            }
        };
    }, []);

    const summary = useMemo(
        () => ({
            fullName: `${data.personal.firstName} ${data.personal.lastName}`,
            dni: data.personal.dni,
            income: Number(data.financiera.familyIncome).toLocaleString("es-PE", {
                style: "currency",
                currency: "PEN",
                maximumFractionDigits: 0,
            }),
            firstHome: data.financiera.firstHome ? "Sí" : "No",
        }),
        [data],
    );

    const handleChange = <K extends keyof ClientWizardData>(
        section: K,
        field: keyof ClientWizardData[K],
        value: ClientWizardData[K][typeof field],
    ) => {
        setData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const resetEvaluation = () => {
        if (evaluationTimer.current) {
            clearTimeout(evaluationTimer.current);
            evaluationTimer.current = null;
        }
        setEvaluationStatus("idle");
    };

    const startEvaluation = () => {
        resetEvaluation();
        setEvaluationStatus("running");
        evaluationTimer.current = setTimeout(() => {
            setEvaluationStatus("completed");
            evaluationTimer.current = null;
        }, 1400);
    };

    const handleNext = () => {
        if (registrationCompleted) return;
        setCurrentStep((prev) => {
            const nextStep = Math.min(prev + 1, steps.length - 1);
            if (nextStep === steps.length - 1) {
                startEvaluation();
            } else {
                resetEvaluation();
            }
            return nextStep;
        });
    };

    const handleBack = () => {
        setCurrentStep((prev) => {
            const nextStep = Math.max(prev - 1, 0);
            if (nextStep < steps.length - 1) {
                resetEvaluation();
            }
            return nextStep;
        });
    };

    const handleReset = () => {
        setData(defaultData);
        setCurrentStep(0);
        resetEvaluation();
        setRegistrationCompleted(false);
    };

    const handleFinalize = () => {
        if (!canFinish) return;
        setRegistrationCompleted(true);
    };

    const isLastStep = currentStep === steps.length - 1;
    const canFinish = isLastStep && evaluationStatus === "completed";
    const showFinalSuccess = registrationCompleted;

    const nextButtonLabel = (() => {
        if (registrationCompleted) return "Registrar nuevo cliente";
        if (canFinish) return "Finalizar Registro";
        if (isLastStep) return "Evaluando...";
        if (currentStep === 2) return "Guardar y Evaluar";
        return "Siguiente";
    })();

    return (
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Registro de Cliente</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Completa la información para evaluar bonos</h2>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                    >
                        <ClipboardCheck className="h-4 w-4" />
                        Limpiar formulario
                    </button>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold ${index === currentStep
                                ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                                : index < currentStep
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                    : "border-slate-200 text-slate-400"
                                }`}
                        >
                            {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                        </div>
                        <div className="ml-3 text-sm font-semibold text-slate-600">{step.label}</div>
                        {index < steps.length - 1 && <div className="mx-6 h-px w-16 bg-slate-200" />}
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
                {showFinalSuccess && (
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6">
                            <div className="flex items-center gap-3 text-emerald-700">
                                <CheckCircle2 className="h-6 w-6" />
                                <div>
                                    <p className="text-xl font-semibold">¡Cliente elegible y registro completado!</p>
                                    <p className="text-sm text-emerald-800">
                                        Se generó el expediente con todos los datos listo para aplicar a los bonos estatales.
                                    </p>
                                </div>
                            </div>
                            <ul className="mt-4 space-y-2 rounded-2xl bg-white p-4 text-sm text-slate-600">
                                {[
                                    "Aplica para Bono del Buen Pagador (MiVivienda)",
                                    "Aplica para Bono Familiar Habitacional (Techo Propio)",
                                ].map((benefit) => (
                                    <li key={benefit} className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                            <Check className="h-4 w-4" />
                                        </span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold text-slate-900">Resumen del Cliente</p>
                            <dl className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">Nombre</dt>
                                    <dd className="text-sm font-semibold text-slate-900">{summary.fullName}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">DNI</dt>
                                    <dd className="text-sm font-semibold text-slate-900">{summary.dni}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">Ingreso Familiar</dt>
                                    <dd className="text-sm font-semibold text-slate-900">{summary.income}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">Primera Vivienda</dt>
                                    <dd className="text-sm font-semibold text-emerald-600">{summary.firstHome}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                {!showFinalSuccess && currentStep === 0 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-slate-900">Datos Personales</h3>
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Nombres</label>
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.firstName}
                                    onChange={(event) => handleChange("personal", "firstName", event.target.value)}
                                    placeholder="Ingrese los nombres"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Apellidos</label>
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.lastName}
                                    onChange={(event) => handleChange("personal", "lastName", event.target.value)}
                                    placeholder="Ingrese los apellidos"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">DNI</label>
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.dni}
                                    maxLength={8}
                                    onChange={(event) => handleChange("personal", "dni", event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.birthDate}
                                    onChange={(event) => handleChange("personal", "birthDate", event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Estado Civil</label>
                                <select
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.civilStatus}
                                    onChange={(event) => handleChange("personal", "civilStatus", event.target.value)}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="SOLTERO">Soltero(a)</option>
                                    <option value="CASADO">Casado(a)</option>
                                    <option value="DIVORCIADO">Divorciado(a)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.email}
                                    onChange={(event) => handleChange("personal", "email", event.target.value)}
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Teléfono</label>
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.phone}
                                    onChange={(event) => handleChange("personal", "phone", event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Dirección</label>
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.address}
                                    onChange={(event) => handleChange("personal", "address", event.target.value)}
                                    placeholder="Ingrese la dirección completa"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Región</label>
                                <select
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.region}
                                    onChange={(event) => handleChange("personal", "region", event.target.value)}
                                >
                                    <option value="">Seleccionar región</option>
                                    <option value="LIMA">Lima</option>
                                    <option value="CALLAO">Callao</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Provincia</label>
                                <select
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.personal.province}
                                    onChange={(event) => handleChange("personal", "province", event.target.value)}
                                >
                                    <option value="">Seleccionar provincia</option>
                                    <option value="LIMA">Lima</option>
                                    <option value="BARRANCA">Barranca</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {!showFinalSuccess && currentStep === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-slate-900">Información Laboral</h3>
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-600">Tipo de Empleo</label>
                                <div className="mt-3 grid gap-4 md:grid-cols-2">
                                    {(
                                        [
                                            { label: "Dependiente", value: "DEPENDIENTE", helper: "Trabajador en planilla" },
                                            { label: "Independiente", value: "INDEPENDIENTE", helper: "Trabajador por cuenta propia" },
                                        ] as const
                                    ).map((option) => {
                                        const isActive = data.laboral.employmentType === option.value;
                                        return (
                                            <button
                                                type="button"
                                                key={option.value}
                                                onClick={() => handleChange("laboral", "employmentType", option.value)}
                                                className={`rounded-2xl border px-5 py-4 text-left transition ${isActive
                                                    ? "border-indigo-600 bg-white shadow-lg shadow-indigo-100"
                                                    : "border-slate-200 bg-transparent hover:border-slate-300"
                                                    }`}
                                            >
                                                <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                                                <p className="text-xs text-slate-500">{option.helper}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-600">Empresa / Ocupación</label>
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.laboral.company}
                                    onChange={(event) => handleChange("laboral", "company", event.target.value)}
                                    placeholder="Nombre de la empresa o descripción de la ocupación"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Antigüedad Laboral</label>
                                <select
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.laboral.seniority}
                                    onChange={(event) => handleChange("laboral", "seniority", event.target.value)}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="MENOS_1">Menos de 1 año</option>
                                    <option value="1_3">1 a 3 años</option>
                                    <option value="3_5">3 a 5 años</option>
                                    <option value="5_MAS">Más de 5 años</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Carga Familiar</label>
                                <select
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.laboral.familyLoad}
                                    onChange={(event) => handleChange("laboral", "familyLoad", event.target.value)}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="SIN_CARGA">Sin carga familiar</option>
                                    <option value="1_2">1 a 2 dependientes</option>
                                    <option value="3_5">3 a 5 dependientes</option>
                                    <option value="5_MAS">Más de 5 dependientes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {!showFinalSuccess && currentStep === 2 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-slate-900">Información Financiera</h3>
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Ingreso Familiar Total (S/)</label>
                                <input
                                    type="number"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.financiera.familyIncome}
                                    onChange={(event) => handleChange("financiera", "familyIncome", event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Ahorros Disponibles (S/)</label>
                                <input
                                    type="number"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.financiera.savings}
                                    onChange={(event) => handleChange("financiera", "savings", event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Deudas Existentes (S/)</label>
                                <input
                                    type="number"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={data.financiera.debts}
                                    onChange={(event) => handleChange("financiera", "debts", event.target.value)}
                                    placeholder="Incluya tarjetas, préstamos, etc."
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-white/80 p-5">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={data.financiera.firstHome}
                                    onChange={(event) => handleChange("financiera", "firstHome", event.target.checked)}
                                />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">¿Es su primera vivienda?</p>
                                    <p className="text-sm text-slate-500">Marque esta opción si se trata de su primera propiedad</p>
                                </div>
                            </label>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600">Información Adicional</label>
                            <textarea
                                className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={data.financiera.notes}
                                onChange={(event) => handleChange("financiera", "notes", event.target.value)}
                                placeholder="Observaciones relevantes..."
                            />
                        </div>
                    </div>
                )}

                {!showFinalSuccess && currentStep === 3 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-slate-900">Evaluación de Elegibilidad</h3>
                        {evaluationStatus !== "completed" ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/80 px-6 py-5 text-blue-700">
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                                <p className="text-sm font-semibold">Evaluando elegibilidad...</p>
                            </div>
                        ) : (
                            <div className="space-y-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                                <div className="flex items-center gap-3 text-emerald-700">
                                    <CheckCircle2 className="h-6 w-6" />
                                    <div>
                                        <p className="text-lg font-semibold">¡Cliente Elegible!</p>
                                        <p className="text-sm">
                                            Aplica para Bono del Buen Pagador (MiVivienda) y Bono Familiar Habitacional (Techo Propio).
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
                                    <p className="font-semibold text-slate-900">Resumen del Cliente</p>
                                    <dl className="mt-4 grid gap-3 md:grid-cols-2">
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-slate-400">Nombre</dt>
                                            <dd className="text-sm font-medium text-slate-900">{summary.fullName}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-slate-400">DNI</dt>
                                            <dd className="text-sm font-medium text-slate-900">{summary.dni}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-slate-400">Ingreso Familiar</dt>
                                            <dd className="text-sm font-medium text-slate-900">{summary.income}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-slate-400">Primera Vivienda</dt>
                                            <dd className="text-sm font-medium text-emerald-600">{summary.firstHome}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showFinalSuccess ? (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                    >
                        Registrar nuevo cliente
                    </button>
                    <button
                        type="button"
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500"
                    >
                        Descargar resumen
                    </button>
                </div>
            ) : (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Anterior
                    </button>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={canFinish ? handleFinalize : handleNext}
                            disabled={isLastStep && !canFinish}
                            className={`rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition ${canFinish
                                ? "bg-emerald-600 shadow-emerald-500/30 hover:bg-emerald-500"
                                : "bg-indigo-600 shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-60"
                                }`}
                        >
                            {nextButtonLabel}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

