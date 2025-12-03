"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  ArrowRight,
  X,
} from "lucide-react";
import styles from "@/styles/clientRegistration.module.css";
import type { CreateClientDto } from "../services/clientsApi";

export interface ClientRegistrationFormData {
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
type EligibilityState = "unknown" | "eligible" | "notEligible";

const steps = [
  { id: 1, label: "Datos Personales" },
  { id: 2, label: "Info. Laboral" },
  { id: 3, label: "Info. Financiera" },
  { id: 4, label: "Evaluación" },
] as const;

const defaultData: ClientRegistrationFormData = {
  personal: {
    firstName: "",
    lastName: "",
    dni: "",
    birthDate: "",
    civilStatus: "",
    email: "",
    phone: "",
    address: "",
    region: "",
    province: "",
  },
  laboral: {
    employmentType: "DEPENDIENTE",
    company: "",
    seniority: "",
    familyLoad: "",
  },
  financiera: {
    familyIncome: "",
    savings: "",
    debts: "",
    firstHome: false,
    notes: "",
  },
};

interface ClientRegistrationFormProps {
  onClose?: () => void;
  // se conecta con DashboardShell -> handleCreateClient
  onSubmitClient?: (payload: CreateClientDto) => Promise<void> | void;
}

export function ClientRegistrationForm({
  onClose,
  onSubmitClient,
}: ClientRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ClientRegistrationFormData>(defaultData);
  const [evaluationStatus, setEvaluationStatus] =
    useState<EvaluationStatus>("idle");
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
      fullName: `${data.personal.firstName} ${data.personal.lastName}`.trim(),
      dni: data.personal.dni,
      income: Number(data.financiera.familyIncome || 0).toLocaleString(
        "es-PE",
        {
          style: "currency",
          currency: "PEN",
          maximumFractionDigits: 0,
        }
      ),
      firstHome: data.financiera.firstHome ? "Sí" : "No",
    }),
    [data]
  );

  // ======== Cálculo de elegibilidad (simple / referencial) ========

  const numericIncome = Number(data.financiera.familyIncome || 0);
  const numericDebts = Number(data.financiera.debts || 0);
  const isFirstHome = data.financiera.firstHome;

  const eligibility = useMemo<EligibilityState>(() => {
    if (!numericIncome) return "unknown";

    const incomeInRange = numericIncome >= 1200 && numericIncome <= 5000;
    const debtOk = numericDebts <= numericIncome * 0.4;

    if (incomeInRange && debtOk && isFirstHome) {
      return "eligible";
    }

    return "notEligible";
  }, [numericIncome, numericDebts, isFirstHome]);

  const isEligible = eligibility === "eligible";

  const handleChange = <K extends keyof ClientRegistrationFormData>(
    section: K,
    field: keyof ClientRegistrationFormData[K],
    value: ClientRegistrationFormData[K][typeof field]
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

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      handleReset();
    }
  };

  // helpers de mapeo a DTO backend
  const toNumber = (value: string): number =>
    value && !Number.isNaN(Number(value)) ? Number(value) : 0;

  const mapSeniorityToYears = (code: string): number => {
    switch (code) {
      case "MENOS_1":
        return 0;
      case "1_3":
        return 2;
      case "3_5":
        return 4;
      case "5_MAS":
        return 6;
      default:
        return 0;
    }
  };

  const mapFamilyLoadToNumber = (code: string): number => {
    switch (code) {
      case "SIN_CARGA":
        return 0;
      case "1_2":
        return 2;
      case "3_5":
        return 4;
      case "5_MAS":
        return 6;
      default:
        return 0;
    }
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

  const handleFinalize = async () => {
    if (!canFinish) return;
    if (!onSubmitClient) {
      console.warn(
        "onSubmitClient no está definido. No se enviará el cliente al backend."
      );
      setRegistrationCompleted(true);
      return;
    }

    try {
      const payload: CreateClientDto = {
        firstName: data.personal.firstName,
        lastName: data.personal.lastName,
        dni: data.personal.dni,
        birthDate: data.personal.birthDate,
        civilStatus: data.personal.civilStatus,
        email: data.personal.email,
        phone: data.personal.phone,
        address: data.personal.address,
        region: data.personal.region,
        province: data.personal.province,
        employmentType: data.laboral.employmentType,
        occupation: data.laboral.company,
        jobSeniority: mapSeniorityToYears(data.laboral.seniority),
        familyLoad: mapFamilyLoadToNumber(data.laboral.familyLoad),
        familyIncome: toNumber(data.financiera.familyIncome),
        savings: toNumber(data.financiera.savings),
        debts: toNumber(data.financiera.debts),
        firstHome: data.financiera.firstHome,
        notes: data.financiera.notes || null,
        // opcionales, los puede calcular el backend:
        bonus: undefined,
        bank: undefined,
        creditStatus: undefined,
      }as any;

      await onSubmitClient(payload);
      setRegistrationCompleted(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al guardar cliente:", error);
      // aquí podrías mostrar un toast o mensaje visual si quieres
    }
  };

  const handleNewClient = () => {
    handleReset();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.registrationContainer}>
      <div className={styles.registrationContent}>
        <div className={styles.registrationHeader}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleClose}
          >
            <ArrowLeft className={styles.backButtonIcon} />
            Volver al Dashboard
          </button>
          <h1 className={styles.registrationTitle}>Registro de Cliente</h1>
          <div style={{ width: "140px" }} /> {/* Spacer for centering */}
        </div>

        <div className={styles.progressContainer}>
          {steps.map((step, index) => (
            <div key={step.id} className={styles.progressStep}>
              <div
                className={`${styles.stepCircle} ${
                  index === currentStep
                    ? styles.stepCircleActive
                    : index < currentStep
                    ? styles.stepCircleCompleted
                    : styles.stepCircleInactive
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className={styles.buttonIcon} />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`${styles.stepLabel} ${
                  index === currentStep ? "" : styles.stepLabelInactive
                }`}
              >
                {step.id} {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`${styles.stepConnector} ${
                    index < currentStep
                      ? styles.stepConnectorActive
                      : styles.stepConnectorInactive
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className={styles.formCard}>
          {/* ========== PANEL FINAL (DESPUÉS DE GUARDAR) ========== */}
          {showFinalSuccess && (
            <div className="space-y-6">
              <div
                className={`rounded-3xl border p-6 ${
                  isEligible
                    ? "border-emerald-200 bg-emerald-50/80"
                    : "border-amber-200 bg-amber-50/80"
                }`}
              >
                <div className="flex items-center gap-3 text-slate-800">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-xl font-semibold">
                      {isEligible
                        ? "Registro completado y cliente elegible"
                        : "Registro completado"}
                    </p>
                    <p className="text-sm text-slate-700">
                      {isEligible
                        ? "Se generó el expediente con todos los datos listo para aplicar a los bonos estatales."
                        : "Se generó el expediente del cliente para seguimiento y futuras evaluaciones de crédito."}
                    </p>
                  </div>
                </div>

                {isEligible ? (
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
                ) : (
                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600">
                    Actualmente el cliente no cumple los criterios
                    referenciales para bonos estatales, pero su información
                    quedó registrada para futuras oportunidades.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Resumen del Cliente
                </p>
                <dl className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Nombre
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {summary.fullName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      DNI
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {summary.dni}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Ingreso Familiar
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {summary.income}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Primera Vivienda
                    </dt>
                    <dd className="text-sm font-semibold text-emerald-600">
                      {summary.firstHome}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* ========== PASO 1: DATOS PERSONALES ========== */}
          {!showFinalSuccess && currentStep === 0 && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Datos Personales</h2>
                <p className={styles.sectionSubtitle}>
                  Ingrese la información personal del cliente
                </p>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Nombres</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={data.personal.firstName}
                    onChange={(event) =>
                      handleChange("personal", "firstName", event.target.value)
                    }
                    placeholder="Ingrese los nombres"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Apellidos</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={data.personal.lastName}
                    onChange={(event) =>
                      handleChange("personal", "lastName", event.target.value)
                    }
                    placeholder="Ingrese los apellidos"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>DNI</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={data.personal.dni}
                    maxLength={8}
                    onChange={(event) =>
                      handleChange("personal", "dni", event.target.value)
                    }
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={data.personal.birthDate}
                    onChange={(event) =>
                      handleChange("personal", "birthDate", event.target.value)
                    }
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Estado Civil</label>
                  <select
                    className={styles.formSelect}
                    value={data.personal.civilStatus}
                    onChange={(event) =>
                      handleChange(
                        "personal",
                        "civilStatus",
                        event.target.value
                      )
                    }
                  >
                    <option value="">Seleccionar</option>
                    <option value="SOLTERO">Soltero(a)</option>
                    <option value="CASADO">Casado(a)</option>
                    <option value="DIVORCIADO">Divorciado(a)</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Correo Electrónico</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    value={data.personal.email}
                    onChange={(event) =>
                      handleChange("personal", "email", event.target.value)
                    }
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Teléfono</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={data.personal.phone}
                    onChange={(event) =>
                      handleChange("personal", "phone", event.target.value)
                    }
                  />
                </div>
                <div
                  className={`${styles.formField} ${styles.formFieldFull}`}
                >
                  <label className={styles.formLabel}>Dirección</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={data.personal.address}
                    onChange={(event) =>
                      handleChange("personal", "address", event.target.value)
                    }
                    placeholder="Ingrese la dirección completa"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Región</label>
                  <select
                    className={styles.formSelect}
                    value={data.personal.region}
                    onChange={(event) =>
                      handleChange("personal", "region", event.target.value)
                    }
                  >
                    <option value="">Seleccionar región</option>
                    <option value="LIMA">Lima</option>
                    <option value="CALLAO">Callao</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Provincia</label>
                  <select
                    className={styles.formSelect}
                    value={data.personal.province}
                    onChange={(event) =>
                      handleChange("personal", "province", event.target.value)
                    }
                  >
                    <option value="">Seleccionar provincia</option>
                    <option value="LIMA">Lima</option>
                    <option value="BARRANCA">Barranca</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ========== PASO 2: LABORAL ========== */}
          {!showFinalSuccess && currentStep === 1 && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Información Laboral</h2>
                <p className={styles.sectionSubtitle}>
                  Detalles sobre la situación laboral del cliente
                </p>
              </div>
              <div className={styles.formGrid}>
                <div
                  className={`${styles.formField} ${styles.formFieldFull}`}
                >
                  <label className={styles.formLabel}>Tipo de Empleo</label>
                  <div className={styles.employmentTypeGrid}>
                    {(
                      [
                        {
                          label: "Dependiente",
                          value: "DEPENDIENTE",
                          helper: "Trabajador con planilla",
                        },
                        {
                          label: "Independiente",
                          value: "INDEPENDIENTE",
                          helper: "Trabajador por cuenta propia",
                        },
                      ] as const
                    ).map((option) => {
                      const isActive =
                        data.laboral.employmentType === option.value;
                      return (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() =>
                            handleChange(
                              "laboral",
                              "employmentType",
                              option.value
                            )
                          }
                          className={`${styles.employmentTypeCard} ${
                            isActive ? styles.employmentTypeCardActive : ""
                          }`}
                        >
                          <span className={styles.employmentTypeLabel}>
                            {option.label}
                          </span>
                          <span className={styles.employmentTypeHelper}>
                            {option.helper}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={`${styles.formField} ${styles.formFieldFull}`}
                >
                  <label className={styles.formLabel}>
                    Empresa / Ocupación
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={data.laboral.company}
                    onChange={(event) =>
                      handleChange("laboral", "company", event.target.value)
                    }
                    placeholder="Nombre de la empresa o descripción de la ocupación"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Antigüedad Laboral
                  </label>
                  <select
                    className={styles.formSelect}
                    value={data.laboral.seniority}
                    onChange={(event) =>
                      handleChange("laboral", "seniority", event.target.value)
                    }
                  >
                    <option value="">Seleccionar</option>
                    <option value="MENOS_1">Menos de 1 año</option>
                    <option value="1_3">1 a 3 años</option>
                    <option value="3_5">3 a 5 años</option>
                    <option value="5_MAS">Más de 5 años</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Carga Familiar</label>
                  <select
                    className={styles.formSelect}
                    value={data.laboral.familyLoad}
                    onChange={(event) =>
                      handleChange("laboral", "familyLoad", event.target.value)
                    }
                  >
                    <option value="">Seleccionar</option>
                    <option value="SIN_CARGA">Sin carga familiar</option>
                    <option value="1_2">1 a 2 dependientes</option>
                    <option value="3_5">3 a 5 dependientes</option>
                    <option value="5_MAS">Más de 5 dependientes</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ========== PASO 3: FINANCIERA ========== */}
          {!showFinalSuccess && currentStep === 2 && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Información Financiera
                </h2>
                <p className={styles.sectionSubtitle}>
                  Detalles sobre la situación financiera del cliente
                </p>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Ingreso Familiar Total (S/)
                  </label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={data.financiera.familyIncome}
                    onChange={(event) =>
                      handleChange(
                        "financiera",
                        "familyIncome",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Ahorros Disponibles (S/)
                  </label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={data.financiera.savings}
                    onChange={(event) =>
                      handleChange("financiera", "savings", event.target.value)
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Deudas Existentes (S/)
                  </label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={data.financiera.debts}
                    onChange={(event) =>
                      handleChange("financiera", "debts", event.target.value)
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Incluye tarjetas de crédito, préstamos personales, etc.
                  </p>
                </div>

                <div
                  className={`${styles.formField} ${styles.formFieldFull}`}
                >
                  <div className="rounded-xl border border-indigo-100 bg-white p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={data.financiera.firstHome}
                        onChange={(event) =>
                          handleChange(
                            "financiera",
                            "firstHome",
                            event.target.checked
                          )
                        }
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          ¿Es su primera vivienda?
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Marque si esta será su primera propiedad
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div
                  className={`${styles.formField} ${styles.formFieldFull}`}
                >
                  <label className={styles.formLabel}>
                    Información Adicional
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Observaciones</p>
                  <textarea
                    className={styles.formInput}
                    rows={4}
                    value={data.financiera.notes}
                    onChange={(event) =>
                      handleChange("financiera", "notes", event.target.value)
                    }
                    placeholder="Información adicional relevante..."
                  />
                </div>
              </div>
            </>
          )}

          {/* ========== PASO 4: EVALUACIÓN ========== */}
          {!showFinalSuccess && currentStep === 3 && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Evaluación de Elegibilidad
                </h2>
                <p className={styles.sectionSubtitle}>
                  Resultado preliminar según los datos del cliente
                </p>
              </div>
              {evaluationStatus !== "completed" ? (
                <div className="flex items-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 px-6 py-4">
                  <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
                  <p className="text-sm font-semibold text-blue-700">
                    Evaluando elegibilidad...
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div
                    className={`rounded-xl border-2 p-6 ${
                      isEligible
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-rose-200 bg-rose-50"
                    }`}
                  >
                    <div
                      className={`mb-4 flex items-start gap-3 ${
                        isEligible ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isEligible ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <X className="h-6 w-6" />
                      )}
                      <div>
                        <p className="text-lg font-semibold">
                          {isEligible
                            ? "¡Cliente elegible para bonos estatales!"
                            : "Cliente no elegible para bonos estatales"}
                        </p>
                        <p className="text-sm opacity-90">
                          {isEligible
                            ? "Con la información ingresada, el cliente podría acceder a los siguientes beneficios estatales:"
                            : "Con la información ingresada, el cliente actualmente no cumple los criterios referenciales para bonos estatales."}
                        </p>
                      </div>
                    </div>

                    {isEligible ? (
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-emerald-800">
                          <Check className="h-4 w-4" />
                          Aplica para Bono del Buen Pagador (MiVivienda)
                        </li>
                        <li className="flex items-center gap-2 text-sm text-emerald-800">
                          <Check className="h-4 w-4" />
                          Aplica para Bono Familiar Habitacional (Techo
                          Propio)
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-2 text-sm text-rose-900">
                        {!isFirstHome && (
                          <li className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            No se trata de la primera vivienda del cliente.
                          </li>
                        )}
                        {!(numericIncome >= 1200 && numericIncome <= 5000) && (
                          <li className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            El ingreso familiar está fuera del rango
                            referencial para estos bonos.
                          </li>
                        )}
                        {numericIncome > 0 &&
                          numericDebts > numericIncome * 0.4 && (
                            <li className="flex items-center gap-2">
                              <X className="h-4 w-4" />
                              El nivel de endeudamiento es alto respecto al
                              ingreso familiar.
                            </li>
                          )}
                        <li className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Este resultado es referencial y debe validarse con el
                          banco.
                        </li>
                      </ul>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="mb-4 text-sm font-semibold text-slate-900">
                      Resumen del Cliente
                    </p>
                    <dl className="grid gap-4 md:grid-cols-2">
                      <div>
                        <dt className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                          Nombre
                        </dt>
                        <dd className="text-sm font-medium text-slate-900">
                          {summary.fullName}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                          DNI
                        </dt>
                        <dd className="text-sm font-medium text-slate-900">
                          {summary.dni}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                          Ingreso Familiar
                        </dt>
                        <dd className="text-sm font-medium text-slate-900">
                          {summary.income}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                          Primera Vivienda
                        </dt>
                        <dd className="text-sm font-medium text-emerald-600">
                          {summary.firstHome}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </>
          )}

          {/* BOTONES DE ACCIÓN */}
          {showFinalSuccess ? (
            <div className={styles.actionButtonsContainer}>
              <div className={styles.actionButtonsLeft} />
              <div className={styles.actionButtonsRight}>
                <button
                  type="button"
                  onClick={handleNewClient}
                  className={`${styles.button} ${styles.buttonNext}`}
                  style={{ backgroundColor: "#10b981" }}
                >
                  <Check className={styles.buttonIcon} />
                  Registrar nuevo cliente
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.actionButtonsContainer}>
              <div className={styles.actionButtonsLeft}>
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className={`${styles.button} ${styles.buttonPrevious}`}
                  >
                    <ArrowLeft className={styles.buttonIcon} />
                    Anterior
                  </button>
                )}
              </div>
              <div className={styles.actionButtonsRight}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`${styles.button} ${styles.buttonCancel}`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={canFinish ? handleFinalize : handleNext}
                  disabled={isLastStep && !canFinish}
                  className={`${styles.button} ${
                    canFinish ? "" : styles.buttonNext
                  }`}
                  style={canFinish ? { backgroundColor: "#10b981" } : undefined}
                >
                  {canFinish && <Check className={styles.buttonIcon} />}
                  {nextButtonLabel}
                  {!isLastStep && !canFinish && (
                    <ArrowRight className={styles.buttonIcon} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
