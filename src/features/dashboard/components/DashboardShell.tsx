// src/features/dashboard/components/DashboardShell.tsx
"use client";

import { useState, useEffect } from "react";
import {
  getProperties,
  type PropertyDto,
  type PropertyFilters,
} from "@/features/properties/services/propertiesApi";
import {
  Building2,
  FileBarChart,
  LayoutDashboard,
  User,
  X,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  FileText,
  MapPin,
  Banknote,
  Filter,
  CheckCircle2,
  Download,
  LifeBuoy,
} from "lucide-react";
import Image from "next/image";
import { ClientRegistrationForm } from "@/features/clients/components/ClientRegistrationForm";
import { LoanResultsDashboard } from "@/features/reports/components/LoanResultsDashboard";
import type { AuthUser } from "@/core/providers/AuthProvider";
import {
  getClients,
  deleteClient,
  createClient,
  updateClient,
  type ClientDto,
  type ClientFilters,
  type CreateClientDto,
  type UpdateClientDto,
} from "@/features/clients/services/clientsApi";
import {
  getBanks,
  getAvailableBanksForClient,
  type BankDto,
} from "@/features/banks/services/bankApi";
import {
  calculateSimulation,
  createSimulation,
  exportSimulationExcel,
  exportSimulationPdf,
  type SimulationDto,
  type CalculateSimulationRequest,
  type CreateSimulationRequest,
} from "@/features/simulations/services/simulationsApi";
import iconImage from "@/app/icon.png";
import styles from "@/styles/dashboard.module.css";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

function triggerDownload(downloadPath: string) {
  if (typeof window === "undefined") return;

  const url = downloadPath.startsWith("http")
    ? downloadPath
    : `${API_BASE_URL}${downloadPath}`;

  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

type NavSection = "clients" | "projects" | "reports" | "support";

interface DashboardShellProps {
  user: AuthUser;
  onLogout: () => void;
}

const navItems = [
  { icon: FileText, label: "Clientes", key: "clients" as NavSection },
  {
    icon: Building2,
    label: "Proyectos / Viviendas",
    key: "projects" as NavSection,
  },
  { icon: FileBarChart, label: "Reportes", key: "reports" as NavSection },
  { icon: LifeBuoy, label: "Soporte", key: "support" as NavSection },
];

const BONUS_OPTIONS = [
  { key: "SIN_BONO", label: "Sin bono", percent: 0 },
  { key: "BBP_3", label: "Bono Buen Pagador - 3%", percent: 3 },
  { key: "BBP_45", label: "Bono Buen Pagador - 4.5%", percent: 4.5 },
  { key: "BBP_63", label: "Bono Buen Pagador - 6.3%", percent: 6.3 },
  { key: "TECHO_PROPIO", label: "Bono Techo Propio", percent: 8 },
];

type CreditStatusKey = "EN_PROCESO" | "APTO" | "NO_APTO";

const CREDIT_STATUS_OPTIONS: { key: CreditStatusKey; label: string }[] = [
  { key: "EN_PROCESO", label: "En proceso" },
  { key: "APTO", label: "Aprobado" },
  { key: "NO_APTO", label: "Rechazado" },
];

function mapCreditStatusToKey(status?: string | null): CreditStatusKey {
  if (!status) return "EN_PROCESO";
  const s = status.toLowerCase();
  if (s.includes("no apto")) return "NO_APTO";
  if (s.includes("apto")) return "APTO";
  return "EN_PROCESO";
}

function mapKeyToCreditStatusLabel(key: CreditStatusKey): string {
  switch (key) {
    case "APTO":
      // Importante: dejamos el texto con "Apto" para que tus filtros sigan funcionando
      return "Apto a bono";
    case "NO_APTO":
      return "No apto a bono";
    case "EN_PROCESO":
    default:
      return "En proceso de evaluación de bono";
  }
}

// Evaluación simple del bono según ingresos / ahorros / deudas / primera vivienda
function computeBonusEligibility(client: ClientDto): string {
  const income = client.familyIncome ?? 0;
  const savings = client.savings ?? 0;
  const debts = client.debts ?? 0;
  const firstHome = !!client.firstHome;

  // Si no tiene ningún bono seleccionado, no se evalúa elegibilidad
  const hasBonus =
    !!client.bonus &&
    client.bonus.toLowerCase() !== "sin bono" &&
    client.bonus.toLowerCase() !== "ninguno";

  if (!hasBonus) {
    // No hay bono, por lo tanto no se considera elegible
    return "Sin bono aplicado";
  }

  const debtRatio = income > 0 ? debts / income : 1;

  // 🔹 REGLA DE ELEGIBILIDAD:
  // - Ingreso >= 1500
  // - Ahorros >= 3000
  // - Deuda / Ingreso <= 40%
  // - Primera vivienda = true
  //
  // Si cumple todo => el cliente es ELEGIBLE al bono
  if (income >= 1500 && savings >= 3000 && debtRatio <= 0.4 && firstHome) {
    // Importante: mantenemos la palabra "Apto" para que funcionen los filtros
    return "Apto a bono"; // Cliente elegible al bono
  }

  // En cualquier otro caso lo consideramos NO ELEGIBLE
  return "No apto a bono"; // Cliente no elegible al bono
}



const filterFields = [
  { label: "Bono", placeholder: "Todos los bonos", name: "bono" as const },
  { label: "Banco", placeholder: "Todos los bancos", name: "banco" as const },
  {
    label: "Estado del Crédito",
    placeholder: "Todos los estados",
    name: "estadoCredito" as const,
  },
  {
    label: "Asesor Asignado",
    placeholder: "Todos los asesores",
    name: "asesor" as const,
  },
];

const DEFAULT_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1459535653751-d571815e906b?auto=format&fit=crop&w=800&q=60",
];

function formatPrice(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "S/ -";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)}%`;
}

function parseMaybeNumber(value: any): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const num = Number(value.replace(",", "."));
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

function pickNumber(source: any, keys: string[]): number | null {
  if (!source) return null;

  for (const key of keys) {
    const v = source[key];
    const parsed = parseMaybeNumber(v);
    if (parsed != null) return parsed;
  }
  return null;
}

function pickValue(source: any, keys: string[]): number | string | null {
  if (!source) return null;

  for (const key of keys) {
    const v = source[key];
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return null;
}

// ==== SIMULACIÓN FINANCIERA LOCAL (MÉTODO FRANCÉS VENCIDO) ==== //

type RateMode = "EFFECTIVE" | "NOMINAL";
type Capitalization =
  | "MENSUAL"
  | "BIMESTRAL"
  | "TRIMESTRAL"
  | "SEMESTRAL"
  | "ANUAL";
type GraceMode = "NONE" | "TOTAL" | "PARTIAL";

interface AmortizationRow {
  period: number;
  payment: number; // cuota (capital + intereses)
  interest: number;
  principal: number;
  balance: number;
}

interface LocalSimulationOptions {
  rateMode?: RateMode; // "EFFECTIVE" = TEA, "NOMINAL" = TNA
  capitalization?: Capitalization; // si la tasa es nominal
  discountRateVan?: number; // tasa anual % para VAN (ej. 10)
  graceMode?: GraceMode; // tipo de gracia
  includeVan?: boolean;
  includeTir?: boolean;
}

interface LocalSimulationSummary {
  amount: number;
  termYears: number;
  monthlyPayment: number;
  totalInterests: number;
  totalPayable: number;
  tceaPercent: number | null; // TCEA anual (%)
  van: number | null; // VAN en moneda
  tirPercent: number | null; // TIR anual (%)
  schedule: AmortizationRow[];
}

// convierte la capitalización textual a número de periodos por año
function capitalizationToM(cap: Capitalization): number {
  switch (cap) {
    case "MENSUAL":
      return 12;
    case "BIMESTRAL":
      return 6;
    case "TRIMESTRAL":
      return 4;
    case "SEMESTRAL":
      return 2;
    case "ANUAL":
    default:
      return 1;
  }
}

// pasa una tasa anual (TEA o TNA) a tasa efectiva mensual
function toMonthlyEffectiveRate(
  annualRatePercent: number,
  mode: RateMode,
  cap: Capitalization
): number {
  const r = annualRatePercent / 100; // en decimal
  if (r <= 0) return 0;

  if (mode === "EFFECTIVE") {
    // TEA -> TEM
    return Math.pow(1 + r, 1 / 12) - 1;
  }

  // NOMINAL: primero TNA -> TEA, luego TEA -> TEM
  const m = capitalizationToM(cap);
  const ea = Math.pow(1 + r / m, m) - 1;
  return Math.pow(1 + ea, 1 / 12) - 1;
}

// VAN (NPV) clásico con tasa mensual
function computeNPV(monthlyRate: number, cashFlows: number[]): number {
  return cashFlows.reduce(
    (acc, cf, t) => acc + cf / Math.pow(1 + monthlyRate, t),
    0
  );
}

// TIR por bisección con tasa mensual
function computeIRR(cashFlows: number[]): number | null {
  // debe haber al menos un cambio de signo
  const minRate = -0.9999;
  const maxRate = 5; // 500% mensual como techo absurdo
  const f = (r: number) => computeNPV(r, cashFlows);

  let low = minRate;
  let high = maxRate;
  let fLow = f(low);
  let fHigh = f(high);

  if (fLow * fHigh > 0) {
    // no hay raíz en el intervalo
    return null;
  }

  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const fMid = f(mid);

    if (Math.abs(fMid) < 1e-9) {
      return mid;
    }

    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return (low + high) / 2;
}

/**
 * Simula un préstamo francés vencido (30 días por mes) tomando como entrada
 * el mismo payload que envías a /simulation/calculate.
 */
function runLocalSimulationFromPayload(
  payload: CalculateSimulationRequest,
  options: LocalSimulationOptions = {}
): LocalSimulationSummary {
  const {
    rateMode = "EFFECTIVE",
    capitalization = "MENSUAL",
    discountRateVan = 10,
    graceMode = "NONE",
    includeVan = true,
    includeTir = true,
  } = options;

  const amount = payload.amount;
  const years = payload.term;
  const nTotalMonths = Math.round(years * 12);
  const graceMonths = Math.max(payload.gracePeriod ?? 0, 0);

  const adminFeesPercent = (payload.adminFees ?? 0) / 100;
  const evaluationFeePercent = (payload.evaluationFee ?? 0) / 100;
  const lifeInsurancePercent = (payload.lifeInsurance ?? 0) / 100;

  const monthlyRate = toMonthlyEffectiveRate(
    payload.interestRate,
    rateMode,
    capitalization
  );

  // ---- cálculo de la cuota por método francés ---- //
  const originalPrincipal = amount;
  let principalForAmortization = amount;

  if (graceMode === "TOTAL" && graceMonths > 0) {
    // en gracia total se capitalizan intereses antes de empezar a amortizar
    principalForAmortization =
      amount * Math.pow(1 + monthlyRate, graceMonths);
  }

  const nAmortMonths = Math.max(nTotalMonths - graceMonths, 0);

  let monthlyPayment = 0;
  if (nAmortMonths > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = principalForAmortization / nAmortMonths;
    } else {
      monthlyPayment =
        (principalForAmortization *
          monthlyRate *
          Math.pow(1 + monthlyRate, nAmortMonths)) /
        (Math.pow(1 + monthlyRate, nAmortMonths) - 1);
    }
  }

  // seguro de desgravamen mensual (aprox. proporcional)
  const lifeInsuranceMonthly =
    originalPrincipal * lifeInsurancePercent / 12;

  const schedule: AmortizationRow[] = [];
  const cashFlowsForIrr: number[] = [];

  // t = 0: desembolso del banco (negativo) + comisiones iniciales (positivas)
  const upfrontFees =
    originalPrincipal * (adminFeesPercent + evaluationFeePercent);
  const netDisbursement = originalPrincipal - upfrontFees;
  cashFlowsForIrr.push(-netDisbursement);

  let balance = originalPrincipal;
  let totalInterests = 0;
  let totalPaidWithoutInsurance = 0;

  for (let k = 1; k <= nTotalMonths; k++) {
    let interest = balance * monthlyRate;
    let principal = 0;
    let payment = 0;

    if (k <= graceMonths) {
      if (graceMode === "TOTAL") {
        // no se paga nada, intereses se capitalizan
        payment = 0;
        principal = 0;
        balance += interest;
      } else if (k <= graceMonths) {
              if (graceMode === "PARTIAL") {
                // solo intereses
                payment = interest;
                principal = 0;
                // saldo se mantiene
              }
      } else {
        // graciaMode = NONE (por si graceMonths > 0 pero sin modo explícito)
        payment = monthlyPayment;
        principal = payment - interest;
        balance -= principal;
      }
    } else {
      payment = monthlyPayment;
      principal = payment - interest;
      balance -= principal;
    }

    if (balance < 1e-6) {
      balance = 0;
    }

    schedule.push({
      period: k,
      payment,
      interest,
      principal,
      balance,
    });

    totalInterests += interest;
    totalPaidWithoutInsurance += payment;

    // Flujo para TCEA/VAN/TIR: cuota + seguro
    const cf = payment + lifeInsuranceMonthly;
    cashFlowsForIrr.push(cf);
  }

  const totalPaidWithInsurance =
    totalPaidWithoutInsurance + lifeInsuranceMonthly * nTotalMonths;
  const totalPayable = totalPaidWithInsurance + upfrontFees;

  // ---- TCEA, VAN y TIR ---- //
  let tceaPercent: number | null = null;
  let van: number | null = null;
  let tirPercent: number | null = null;

  if (includeTir) {
    const irrMonthly = computeIRR(cashFlowsForIrr);
    if (irrMonthly != null) {
      const tcea = Math.pow(1 + irrMonthly, 12) - 1;
      tceaPercent = tcea * 100;
      const tirAnnual = tcea; // misma lógica: TIR efectiva anual
      tirPercent = tirAnnual * 100;
    }
  }

  if (includeVan) {
    const discountMonthly =
      Math.pow(1 + discountRateVan / 100, 1 / 12) - 1;
    van = computeNPV(discountMonthly, cashFlowsForIrr);
  }

  return {
    amount: originalPrincipal,
    termYears: years,
    monthlyPayment,
    totalInterests,
    totalPayable,
    tceaPercent,
    van,
    tirPercent,
    schedule,
  };
}


function getAvailabilityVariant(status?: string): "blue" | "orange" | "grey" {
  if (!status) return "grey";
  const normalized = status.toString().toUpperCase();

  switch (normalized) {
    case "AVAILABLE":
    case "DISPONIBLE":
      return "blue";
    case "RESERVED":
    case "RESERVADO":
      return "orange";
    case "VENDIDO":
    case "SOLD":
      return "grey";
    default:
      return "grey";
  }
}
// ==== STORAGE DE SIMULACIONES POR CLIENTE (LOCALSTORAGE) ==== //

export interface StoredSimulationData {
  clientId: string;
  simulationId?: string | null;
  createdAt: string;
  currency: "PEN" | "USD";
  summary: {
    amount: number | null;
    termYears: number | null;
    monthlyPayment: number | null;
    totalInterests: number | null;
    totalPayable: number | null;
    tcea: number | string | null;
    van: number | string | null;
    tir: number | string | null;
  };
  schedule: AmortizationRow[];
  property: {
    id: string;
    name: string;
  };
  bank: {
    id?: string | null;
    name: string;
  };
}

const SIMULATION_STORAGE_KEY = "ecometrix_client_simulations_v1";

function readStoredSimulations(): StoredSimulationData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SIMULATION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredSimulations(list: StoredSimulationData[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SIMULATION_STORAGE_KEY,
      JSON.stringify(list)
    );
  } catch {}
}

function getStoredSimulationForClient(
  clientId: string
): StoredSimulationData | null {
  const all = readStoredSimulations();
  return all.find((s) => s.clientId === clientId) ?? null;
}

function upsertStoredSimulation(sim: StoredSimulationData) {
  const all = readStoredSimulations();
  const idx = all.findIndex((s) => s.clientId === sim.clientId);
  if (idx >= 0) {
    all[idx] = sim;
  } else {
    all.push(sim);
  }
  writeStoredSimulations(all);
}

function clearStoredSimulationForClient(clientId: string) {
  const all = readStoredSimulations().filter(
    (s) => s.clientId !== clientId
  );
  writeStoredSimulations(all);
}


// ==== REGIONES Y PROVINCIAS PERÚ ==== //
const PERU_REGIONS = [
  "Amazonas",
  "Áncash",
  "Apurímac",
  "Arequipa",
  "Ayacucho",
  "Cajamarca",
  "Callao",
  "Cusco",
  "Huancavelica",
  "Huánuco",
  "Ica",
  "Junín",
  "La Libertad",
  "Lambayeque",
  "Lima",
  "Loreto",
  "Madre de Dios",
  "Moquegua",
  "Pasco",
  "Piura",
  "Puno",
  "San Martín",
  "Tacna",
  "Tumbes",
  "Ucayali",
];

const PERU_PROVINCES_BY_REGION: Record<string, string[]> = {
  Amazonas: [
    "Chachapoyas",
    "Bagua",
    "Bongará",
    "Condorcanqui",
    "Luya",
    "Rodríguez de Mendoza",
    "Utcubamba",
  ],
  Áncash: [
    "Huaraz",
    "Aija",
    "Antonio Raymondi",
    "Asunción",
    "Bolognesi",
    "Carhuaz",
    "Carlos Fermín Fitzcarrald",
    "Casma",
    "Corongo",
    "Huari",
    "Huarmey",
    "Huaylas",
    "Mariscal Luzuriaga",
    "Ocros",
    "Pallasca",
    "Pomabamba",
    "Recuay",
    "Santa",
    "Sihuas",
    "Yungay",
  ],
  Apurímac: [
    "Abancay",
    "Andahuaylas",
    "Antabamba",
    "Aymaraes",
    "Cotabambas",
    "Chincheros",
    "Grau",
  ],
  Arequipa: [
    "Arequipa",
    "Camana",
    "Caravelí",
    "Castilla",
    "Caylloma",
    "Condesuyos",
    "Islay",
    "La Unión",
  ],
  Ayacucho: [
    "Huamanga",
    "Cangallo",
    "Huanca Sancos",
    "Huanta",
    "La Mar",
    "Lucanas",
    "Parinacochas",
    "Páucar del Sara Sara",
    "Sucre",
    "Víctor Fajardo",
    "Vilcas Huamán",
  ],
  Cajamarca: [
    "Cajamarca",
    "Cajabamba",
    "Celendín",
    "Chota",
    "Contumazá",
    "Cutervo",
    "Hualgayoc",
    "Jaén",
    "San Ignacio",
    "San Marcos",
    "San Miguel",
    "San Pablo",
    "Santa Cruz",
  ],
  Callao: ["Callao"],
  Cusco: [
    "Cusco",
    "Acomayo",
    "Anta",
    "Calca",
    "Canas",
    "Canchis",
    "Chumbivilcas",
    "Espinar",
    "La Convención",
    "Paruro",
    "Paucartambo",
    "Quispicanchi",
    "Urubamba",
  ],
  Huancavelica: [
    "Huancavelica",
    "Acobamba",
    "Angaraes",
    "Castrovirreyna",
    "Churcampa",
    "Huaytará",
    "Tayacaja",
  ],
  Huánuco: [
    "Huánuco",
    "Ambo",
    "Dos de Mayo",
    "Huacaybamba",
    "Huamalíes",
    "Leoncio Prado",
    "Marañón",
    "Pachitea",
    "Puerto Inca",
    "Lauricocha",
    "Yarowilca",
  ],
  Ica: ["Ica", "Chincha", "Nazca", "Palpa", "Pisco"],
  Junín: [
    "Huancayo",
    "Concepción",
    "Chanchamayo",
    "Jauja",
    "Junín",
    "Satipo",
    "Tarma",
    "Yauli",
    "Chupaca",
  ],
  "La Libertad": [
    "Trujillo",
    "Ascope",
    "Bolívar",
    "Chepén",
    "Gran Chimú",
    "Julcán",
    "Otuzco",
    "Pacasmayo",
    "Pataz",
    "Sánchez Carrión",
    "Santiago de Chuco",
    "Virú",
  ],
  Lambayeque: ["Chiclayo", "Ferreñafe", "Lambayeque"],
  Lima: [
    "Lima",
    "Barranca",
    "Cajatambo",
    "Canta",
    "Cañete",
    "Huaral",
    "Huarochirí",
    "Huaura",
    "Oyón",
    "Yauyos",
  ],
  Loreto: [
    "Maynas",
    "Alto Amazonas",
    "Loreto",
    "Mariscal Ramón Castilla",
    "Requena",
    "Ucayali",
    "Datem del Marañón",
    "Putumayo",
  ],
  "Madre de Dios": ["Tambopata", "Manu", "Tahuamanu"],
  Moquegua: ["Mariscal Nieto", "General Sánchez Cerro", "Ilo"],
  Pasco: ["Pasco", "Daniel Alcides Carrión", "Oxapampa"],
  Piura: [
    "Piura",
    "Ayabaca",
    "Huancabamba",
    "Morropón",
    "Paita",
    "Sullana",
    "Talara",
    "Sechura",
  ],
  Puno: [
    "Puno",
    "Azángaro",
    "Carabaya",
    "Chucuito",
    "El Collao",
    "Huancané",
    "Lampa",
    "Melgar",
    "Moho",
    "San Antonio de Putina",
    "San Román",
    "Sandia",
    "Yunguyo",
  ],
  "San Martín": [
    "Moyobamba",
    "Bellavista",
    "El Dorado",
    "Huallaga",
    "Lamas",
    "Mariscal Cáceres",
    "Picota",
    "Rioja",
    "San Martín",
    "Tocache",
  ],
  Tacna: ["Tacna", "Candarave", "Jorge Basadre", "Tarata"],
  Tumbes: ["Tumbes", "Contralmirante Villar", "Zarumilla"],
  Ucayali: ["Coronel Portillo", "Atalaya", "Padre Abad", "Purús"],
};

export function DashboardShell({ user, onLogout }: DashboardShellProps) {
  useEffect(() => {
    try {
      console.log("DashboardShell mounted with user:", user);
    } catch {}
  }, [user]);

  const [showActiveClientBanner, setShowActiveClientBanner] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const [activeClient, setActiveClient] = useState<ClientDto | null>(null);

  const [clients, setClients] = useState<ClientDto[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [clientFilters, setClientFilters] = useState<ClientFilters>({});

  const [editingClient, setEditingClient] = useState<ClientDto | null>(null);
  const [editClientValues, setEditClientValues] = useState<UpdateClientDto>({});
  const [editingError, setEditingError] = useState<string | null>(null);
  const [editingLoading, setEditingLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeNav, setActiveNav] = useState<NavSection>("clients");

  const [simulationTab, setSimulationTab] =
    useState<"base" | "conditions" | "advanced">("base");

  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [propertyFilters] = useState<PropertyFilters>({});

  const [housingFilters, setHousingFilters] = useState({
    bonus: "",
    priceRange: "",
    bank: "",
    region: "",
    location: "",
    status: "",
    orderBy: "",
  });

  const [banks, setBanks] = useState<BankDto[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState<string | null>(null);

  const [selectedProperty, setSelectedProperty] =
    useState<PropertyDto | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankDto | null>(null);

  const [currentSimulation, setCurrentSimulation] =
    useState<SimulationDto | null>(null);
  const [savedSimulationId, setSavedSimulationId] = useState<string | null>(
    null
  );
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const [simulationInputs, setSimulationInputs] = useState<{
    term?: number;
    gracePeriod?: number;
    adminFees?: number;
    evaluationFee?: number;
    lifeInsurance?: number;
    interestRate?: number;
  }>({});

const [simulationAdvanced, setSimulationAdvanced] = useState<{
  showDailyBreakdown: boolean;
  calculateVan: boolean;
  calculateTir: boolean;
  discountRate: number;
  currency: "PEN" | "USD";
}>({
  showDailyBreakdown: false,
  calculateVan: true,
  calculateTir: true,
  discountRate: 10,
  currency: "PEN",
});

const [storedSimulation, setStoredSimulation] =
  useState<StoredSimulationData | null>(null);

  useEffect(() => {
    if (!activeClient) {
      setStoredSimulation(null);
      return;
    }
    const stored = getStoredSimulationForClient(activeClient.id);
    setStoredSimulation(stored);
  }, [activeClient]);


  const [calculationSummary, setCalculationSummary] = useState<{
    amount: number | null;
    termYears: number | null;
    monthlyPayment: number | null;
    totalInterests: number | null;
    totalPayable: number | null;
    tcea: number | string | null;
    van: number | string | null;
    tir: number | string | null;
  } | null>(null);

  const [baseDownPayment, setBaseDownPayment] = useState<number | undefined>(
    undefined
  );
  const [selectedBonusKey, setSelectedBonusKey] = useState<string>("SIN_BONO");

useEffect(() => {
  if (activeClient) {
    if (baseDownPayment === undefined) {
      setBaseDownPayment(activeClient.savings ?? 0);
    }

    if (activeClient.bonus) {
      const cleanedBonus = activeClient.bonus.trim().toLowerCase();

      const found = BONUS_OPTIONS.find((b) =>
        b.label.trim().toLowerCase() === cleanedBonus
      );

      if (found) {
        setSelectedBonusKey(found.key);
      }
    }
  } else {
    setBaseDownPayment(undefined);
    setSelectedBonusKey("SIN_BONO");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeClient]);





  const itemsPerPage = 3;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const filteredClients = clients.filter((client) => {
    if (clientFilters.bono) {
      const bonusLabel = client.bonus ?? "Ninguno";
      if (bonusLabel !== clientFilters.bono) return false;
    }

    if (clientFilters.banco) {
      const bankLabel = client.bank ?? "-";
      if (bankLabel !== clientFilters.banco) return false;
    }

    const creditRaw = (client.creditStatus ?? "").toLowerCase();

    if (clientFilters.estadoCredito === "APTO") {
      if (!creditRaw.includes("apto") || creditRaw.includes("no apto")) {
        return false;
      }
    }

    if (clientFilters.estadoCredito === "NO_APTO") {
      if (!creditRaw.includes("no apto")) {
        return false;
      }
    }

    if (clientFilters.estadoCredito === "EN_PROCESO") {
      if (client.creditStatus && creditRaw.trim() !== "") {
        return false;
      }
    }

    return true;
  });

  const totalResults = filteredClients.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const simulationTabs = [
    { key: "base" as const, label: "Datos Base" },
    { key: "conditions" as const, label: "Condiciones" },
    { key: "advanced" as const, label: "Avanzadas" },
  ];

  const loadClients = async () => {
    try {
      setClientsLoading(true);
      setClientsError(null);

      const data = await getClients({});
      setClients(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Error cargando clientes", err);

      if (err?.code === "AUTH_UNAUTHORIZED" || err?.status === 401) {
        setClientsError(
          "Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión."
        );
        onLogout();
      } else {
        setClientsError("No se pudieron cargar los clientes.");
      }
    } finally {
      setClientsLoading(false);
    }
  };

  const handleCreateClient = async (payload: CreateClientDto) => {
    try {
      setClientsLoading(true);
      setClientsError(null);

      const created = await createClient(payload);

      // Si la API devuelve el cliente creado, evaluamos automáticamente el bono
      if (created && (created as any).id) {
        const clientCreated = created as ClientDto;
        const evaluatedStatus = computeBonusEligibility(clientCreated);

        try {
          await updateClient(clientCreated.id, {
            creditStatus: evaluatedStatus,
          });

          alert(
            `Cliente registrado. Resultado inicial para el bono: ${evaluatedStatus}.`
          );
        } catch (err) {
          console.error(
            "Error actualizando estado de crédito tras registro",
            err
          );
        }
      }

      await loadClients();
      setShowRegistrationForm(false);
    } catch (err: any) {
      console.error("Error creando cliente", err);
      setClientsError(
        err?.message || "No se pudo registrar el cliente. Intenta nuevamente."
      );
    } finally {
      setClientsLoading(false);
    }
  };

  const handleCloseRegistrationForm = () => {
    setShowRegistrationForm(false);
  };

  const handleFilterChange = (name: string, value: string) => {
    if (name === "asesor") return;

    setClientFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleSelectClient = (client: ClientDto) => {
    setActiveClient(client);
    setShowActiveClientBanner(true);
    setEditingClient(null);
    setEditClientValues({});
  };

  const loadProperties = async (filters?: PropertyFilters) => {
    try {
      setPropertiesLoading(true);
      setPropertiesError(null);

      const data = await getProperties(filters ?? {});
      setProperties(data);
    } catch (err: any) {
      console.error("Error cargando propiedades", err);

      if (err?.code === "AUTH_UNAUTHORIZED") {
        setPropertiesError(
          "Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión."
        );
        onLogout();
      } else {
        setPropertiesError("No se pudieron cargar las propiedades.");
      }
    } finally {
      setPropertiesLoading(false);
    }
  };

  const loadBanks = async (clientId?: string) => {
    try {
      setBanksLoading(true);
      setBanksError(null);

      const data = clientId
        ? await getAvailableBanksForClient(clientId)
        : await getBanks();
      setBanks(data);
    } catch (err: any) {
      console.error("Error cargando bancos", err);

      if (err?.code === "AUTH_UNAUTHORIZED") {
        setBanksError(
          "Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión."
        );
        onLogout();
      } else {
        setBanksError("No se pudieron cargar los bancos disponibles.");
      }
    } finally {
      setBanksLoading(false);
    }
  };

  const handleSelectProperty = async (property: PropertyDto) => {
    setSelectedProperty(property);
    setSelectedBank(null);
    setCurrentSimulation(null);
    setSavedSimulationId(null);
    setSimulationInputs({});
    setCalculationSummary(null);
    await loadBanks(activeClient?.id);

    if (!activeClient) return;

    try {
      const payload: UpdateClientDto = {
        propertyId: property.id,
      };

      const updated = await updateClient(activeClient.id, payload);

      setActiveClient(updated);
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("Error actualizando vivienda del cliente", err);
      alert("No se pudo actualizar la vivienda del cliente.");
    }
  };

  const handleBackToProperties = () => {
    setSelectedProperty(null);
    setSelectedBank(null);
    setCurrentSimulation(null);
    setSavedSimulationId(null);
    setSimulationInputs({});
    setCalculationSummary(null);
  };

  const handleUseBank = async (bank: BankDto) => {
    setSelectedBank(bank);
    setCurrentSimulation(null);
    setSavedSimulationId(null);
    setSimulationInputs({});
    setCalculationSummary(null);

    if (!activeClient) return;

    try {
      const payload: UpdateClientDto = {
        bank: bank.name,
      };

      const updated = await updateClient(activeClient.id, payload);

      setActiveClient(updated);
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("Error actualizando banco del cliente", err);
      alert("No se pudo actualizar el banco del cliente.");
    }
  };

  const handleHousingFilterChange = (
    name: keyof typeof housingFilters,
    value: string
  ) => {
    setHousingFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case "green":
        return styles.badgeGreen;
      case "blue":
        return styles.badgeBlue;
      case "yellow":
        return styles.badgeYellow;
      case "red":
        return styles.badgeRed;
      case "grey":
      default:
        return styles.badgeGrey;
    }
  };

  const getClientInitials = (firstName: string, lastName: string) => {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
  };

  const getBonusBadge = (bonus?: string) => {
    switch (bonus) {
      case "MiVivienda":
        return "green";
      case "Techo Propio":
        return "blue";
      default:
        return "grey";
    }
  };

  const handleOpenEditClient = (client: ClientDto) => {
    setEditingClient(client);
    setEditClientValues({
      firstName: client.firstName,
      lastName: client.lastName,
      dni: client.dni,
      email: client.email,
      phone: client.phone ?? "",
      address: client.address ?? "",
      region: client.region ?? "",
      province: client.province ?? "",
      familyIncome: client.familyIncome ?? undefined,
      savings: client.savings ?? undefined,
      debts: client.debts ?? undefined,
      firstHome: client.firstHome ?? undefined,
      bank: client.bank ?? undefined,
      propertyId: client.propertyId ?? undefined,
    });
    setEditingError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditFieldChange = (
    field: keyof UpdateClientDto,
    value: string
  ) => {
    if (field === "familyIncome" || field === "savings" || field === "debts") {
      const num = value === "" ? undefined : Number(value);
      setEditClientValues((prev) => ({
        ...prev,
        [field]: Number.isNaN(num) ? undefined : num,
      }));
      return;
    }

    if (field === "firstHome") {
      setEditClientValues((prev) => ({
        ...prev,
        firstHome: value === "true",
      }));
      return;
    }

    setEditClientValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancelEditClient = () => {
    setEditingClient(null);
    setEditClientValues({});
    setEditingError(null);
  };

  const handleSaveEditClient = async () => {
    if (!editingClient) return;

    try {
      setEditingLoading(true);
      setEditingError(null);

      const updated = await updateClient(editingClient.id, editClientValues);
      await loadClients();

      setEditingClient(null);
      setEditClientValues({});
      setActiveClient((prev) =>
        prev && prev.id === updated.id ? updated : prev
      );
    } catch (err: any) {
      console.error("Error actualizando cliente", err);
      setEditingError(
        err?.message ||
          "No se pudo actualizar el cliente. Intenta nuevamente."
      );
    } finally {
      setEditingLoading(false);
    }
  };

  const handleChangeBonus = async (newBonusKey: string) => {
    setSelectedBonusKey(newBonusKey);

    if (!activeClient) return;

    const selected = BONUS_OPTIONS.find((b) => b.key === newBonusKey);
    if (!selected) return;

    const newBonusLabel = selected.label;

    // Calculamos el nuevo estado de crédito según el bono elegido
    const newCreditStatus = computeBonusEligibility({
      ...activeClient,
      bonus: newBonusLabel,
    });

    try {
      const updated = await updateClient(activeClient.id, {
        bonus: newBonusLabel,
        creditStatus: newCreditStatus,
      });

      setActiveClient(updated);
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("Error actualizando bono del cliente", err);
      // Dejamos al menos el bono activo en la simulación aunque falle la API
    }
  };
  const handleChangeCreditStatus = async (statusKey: CreditStatusKey) => {
    if (!activeClient) return;

    const newLabel = mapKeyToCreditStatusLabel(statusKey);

    try {
      const updated = await updateClient(activeClient.id, {
        creditStatus: newLabel,
      });

      setActiveClient(updated);
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("Error actualizando estado de crédito", err);
      alert("No se pudo actualizar el estado del crédito. Intenta nuevamente.");
    }
  };


  const resetSimulationState = () => {
    setSelectedProperty(null);
    setSelectedBank(null);
    setCurrentSimulation(null);
    setSavedSimulationId(null);
    setSimulationInputs({});
    setCalculationSummary(null);
    setSimulationAdvanced({
      showDailyBreakdown: false,
      calculateVan: true,
      calculateTir: true,
      discountRate: 10,
      currency: "PEN",
    });
  };

  const startNewSimulation = () => {
    if (activeClient) {
      clearStoredSimulationForClient(activeClient.id);
      setStoredSimulation(null);
    }
    resetSimulationState();
    setActiveNav("projects");
  };


 const buildCalculationPayload = (): CalculateSimulationRequest | null => {
   if (!activeClient || !selectedProperty || !selectedBank) {
     setSimulationError(
       "Selecciona un cliente, una vivienda y un banco antes de simular el crédito."
     );
     return null;
   }

   const propertyAny = selectedProperty as any;
   const price =
     typeof propertyAny.price === "number" ? propertyAny.price : 250000;

   const downPayment = activeClient.savings ?? 0;
   const amount = Math.max(price - downPayment, 0);

   const defaultTerm =
     selectedBank.availableTerms && selectedBank.availableTerms.length
       ? selectedBank.availableTerms[0]
       : 20;

   const defaultGrace = selectedBank.gracePeriod ?? 0;
   const defaultAdmin = selectedBank.adminFees ?? 0;
   const defaultEval = selectedBank.evaluationFee ?? 0;
   const defaultLife = selectedBank.lifeInsurance ?? 0;

   const term =
     simulationInputs.term != null && !Number.isNaN(simulationInputs.term)
       ? simulationInputs.term
       : defaultTerm;

   const gracePeriod =
     simulationInputs.gracePeriod != null &&
     !Number.isNaN(simulationInputs.gracePeriod)
       ? simulationInputs.gracePeriod
       : defaultGrace;

   const adminFees =
     simulationInputs.adminFees != null &&
     !Number.isNaN(simulationInputs.adminFees)
       ? simulationInputs.adminFees
       : defaultAdmin;

   const evaluationFee =
     simulationInputs.evaluationFee != null &&
     !Number.isNaN(simulationInputs.evaluationFee)
       ? simulationInputs.evaluationFee
       : defaultEval;

   const lifeInsurance =
     simulationInputs.lifeInsurance != null &&
     !Number.isNaN(simulationInputs.lifeInsurance)
       ? simulationInputs.lifeInsurance
       : defaultLife;

   const anyBank = selectedBank as any;
   const bankRate =
     typeof anyBank.tea === "number"
       ? anyBank.tea
       : typeof anyBank.interestRate === "number"
       ? anyBank.interestRate
       : null;

   const rawRate =
     simulationInputs.interestRate != null &&
     !Number.isNaN(simulationInputs.interestRate)
       ? simulationInputs.interestRate
       : bankRate;

   const interestRate = rawRate != null ? Number(rawRate) : NaN;

   if (!Number.isFinite(interestRate) || interestRate <= 0) {
     setSimulationError("La tasa de interés del banco no es válida.");
     return null;
   }

   // 👉 aquí ya incluimos moneda y flags avanzados
   return {
     amount,
     term,
     interestRate,
     gracePeriod,
     adminFees,
     evaluationFee,
     lifeInsurance,
     currency: simulationAdvanced.currency,       // PEN o USD
     paymentFrequency: "monthly",
     discountRate: simulationAdvanced.discountRate,          // para VAN
     calculateVan: simulationAdvanced.calculateVan,          // calcular VAN
     calculateTir: simulationAdvanced.calculateTir,          // calcular TIR
     showDailyBreakdown: simulationAdvanced.showDailyBreakdown, // desglose mensual de días
   } as any;
 };


const normalizeCalculation = (
  result: any,
  payload: CalculateSimulationRequest
) => {
  // Estructuras típicas:
  // {
  //   amount, term, monthlyPayment, tcea, van, tir, totalInterests, totalPayable
  // }
  // o
  // {
  //   amount, term,
  //   result: {
  //     monthlyPayment, tcea, van, tir, totalInterests, totalPayable,
  //     summary: { ... },
  //     indicators: { ... }
  //   }
  // }

  console.log("[Simulation] raw response from /simulation/calculate:", result);

  const root = result ?? {};
  const res = root.result ?? root;
  const summary = res.summary ?? {};
  const indicators = res.indicators ?? {};

  const amount =
    pickNumber(root, ["amount"]) ??
    pickNumber(res, ["amount"]) ??
    payload.amount ??
    null;

  const termYears =
    pickNumber(root, ["term", "years"]) ??
    pickNumber(res, ["term", "years"]) ??
    payload.term ??
    null;

  const monthlyPayment =
    pickNumber(root, ["monthlyPayment", "monthly_quota"]) ??
    pickNumber(res, ["monthlyPayment", "monthly_quota"]) ??
    pickNumber(summary, ["monthlyPayment", "monthly_quota"]) ??
    null;

  const totalInterests =
    pickNumber(root, ["totalInterests", "totalInterest"]) ??
    pickNumber(res, ["totalInterests", "totalInterest"]) ??
    pickNumber(summary, ["totalInterests", "totalInterest"]) ??
    pickNumber(indicators, ["totalInterests", "totalInterest"]) ??
    null;

  const totalPayable =
    pickNumber(root, ["totalPayable", "totalPayment"]) ??
    pickNumber(res, ["totalPayable", "totalPayment"]) ??
    pickNumber(summary, ["totalPayable", "totalPayment"]) ??
    pickNumber(indicators, ["totalPayable", "totalPayment"]) ??
    null;

  const tcea =
    pickValue(root, ["tcea", "TCEA"]) ??
    pickValue(res, ["tcea", "TCEA"]) ??
    pickValue(summary, ["tcea", "TCEA"]) ??
    pickValue(indicators, ["tcea", "TCEA"]) ??
    null;

  const van =
    pickValue(root, ["van", "VAN"]) ??
    pickValue(res, ["van", "VAN"]) ??
    pickValue(summary, ["van", "VAN"]) ??
    pickValue(indicators, ["van", "VAN"]) ??
    null;

  const tir =
    pickValue(root, ["tir", "TIR"]) ??
    pickValue(res, ["tir", "TIR"]) ??
    pickValue(summary, ["tir", "TIR"]) ??
    pickValue(indicators, ["tir", "TIR"]) ??
    null;

  return {
    amount,
    termYears,
    monthlyPayment,
    totalInterests,
    totalPayable,
    tcea,
    van,
    tir,
  };
};

  const buildCreateSimulationPayload = (
    calcInput: CalculateSimulationRequest
  ): CreateSimulationRequest | null => {
    if (
      !activeClient ||
      !selectedProperty ||
      !selectedBank ||
      !currentSimulation ||
      !calculationSummary
    ) {
      setSimulationError(
        "Debes tener un cliente, una vivienda, un banco y haber calculado el crédito antes de guardarlo."
      );
      return null;
    }

    const anySim = currentSimulation as any;

    const amount =
      calculationSummary.amount ?? calcInput.amount;

    const term =
      calculationSummary.termYears ?? calcInput.term;

    const monthlyPayment =
      calculationSummary.monthlyPayment ??
      (typeof anySim.monthlyPayment === "number"
        ? anySim.monthlyPayment
        : 0);

    const resultPayload = anySim.result ?? anySim ?? calculationSummary;

    return {
      clientId: activeClient.id,
      propertyId: selectedProperty.id,
      bankId: selectedBank.id ?? "",
      program: activeClient.bonus ?? "Sin bono",
      amount,
      term,
      monthlyPayment,
      result: resultPayload,
    };
  };
   const getEstimatedLoanAmount = (): number | null => {
     if (!selectedProperty) return null;

     const propertyAny = selectedProperty as any;
     const price =
       typeof propertyAny.price === "number" ? propertyAny.price : 250000;

     // Aporte inicial: lo que el asesor puede mover en Datos Base
     const downPayment =
       baseDownPayment ?? activeClient?.savings ?? 0;

     // Bono seleccionado
     const selectedBonus =
       BONUS_OPTIONS.find((b) => b.key === selectedBonusKey) ??
       BONUS_OPTIONS[0];
     const bonusAmount = (price * selectedBonus.percent) / 100;

     // Monto financiado = precio - aporte - bono   (tope en 0)
     const amount = Math.max(price - downPayment - bonusAmount, 0);

     return amount;
   };

const handleCalculateSimulation = async () => {
  const payload = buildCalculationPayload();
  if (!payload) return;

  setSimulationLoading(true);
  setSimulationError(null);

  try {
    // 🔹 1. Cálculo local con método francés, VAN y TIR
    const local = runLocalSimulationFromPayload(payload, {
      rateMode: "EFFECTIVE",      // o "NOMINAL" si usas tasa nominal
      capitalization: "MENSUAL",  // cambia según lo que elija el asesor
      discountRateVan: 10,        // aquí puedes poner la tasa de VAN de la pestaña Avanzadas
      graceMode:
        payload.gracePeriod && payload.gracePeriod > 0
          ? "PARTIAL"             // o "TOTAL" si quieres gracia total
          : "NONE",
      includeVan: true,
      includeTir: true,
    });

    // 🔹 2. Guardamos una simulación "local" en el estado
    // (sirve para luego hacer createSimulation)
    setCurrentSimulation((prev) =>
      ({
        ...(prev ?? {}),
        amount: local.amount,
        term: local.termYears,
        result: {
          ...(prev as any)?.result,
          schedule: local.schedule,
          monthlyPayment: local.monthlyPayment,
          totalInterests: local.totalInterests,
          totalPayable: local.totalPayable,
          tcea: local.tceaPercent,
          van: local.van,
          tir: local.tirPercent,
        },
      } as any)
    );

    // 🔹 3. Esto alimenta directamente el "Resumen del Préstamo" e "Indicadores"
    setCalculationSummary({
      amount: local.amount,
      termYears: local.termYears,
      monthlyPayment: local.monthlyPayment,
      totalInterests: local.totalInterests,
      totalPayable: local.totalPayable,
      tcea: local.tceaPercent,
      van: local.van,
      tir: local.tirPercent,
    });

    // reseteamos el id guardado porque es una simulación nueva
    setSavedSimulationId(null);
  } catch (err: any) {
    console.error("Error calculando simulación local", err);
    setSimulationError(
      "No se pudo calcular el crédito. Revisa los datos ingresados."
    );
  } finally {
    setSimulationLoading(false);
  }
};



  const handleSaveSimulation = async () => {
    const calcPayload = buildCalculationPayload();
    if (!calcPayload) return;

    const createPayload = buildCreateSimulationPayload(calcPayload);
    if (!createPayload) return;

    try {
      setSimulationLoading(true);
      setSimulationError(null);

      const saved = await createSimulation(createPayload);
      setCurrentSimulation(saved);
      setSavedSimulationId(saved.id ?? null);

      const normalized = normalizeCalculation(saved as any, calcPayload);

      const summary = {
        amount: normalized.amount ?? calcPayload.amount,
        termYears: normalized.termYears ?? calcPayload.term,
        monthlyPayment:
          normalized.monthlyPayment ??
          calculationSummary?.monthlyPayment ??
          null,
        totalInterests: normalized.totalInterests,
        totalPayable: normalized.totalPayable,
        tcea: normalized.tcea,
        van: normalized.van,
        tir: normalized.tir,
      };

      setCalculationSummary(summary);

      // 👇 Guardamos en localStorage por cliente
      if (activeClient && selectedProperty && selectedBank) {
        const scheduleFromServer =
          (saved as any)?.result?.schedule ??
          (currentSimulation as any)?.result?.schedule ??
          [];

        const toStore: StoredSimulationData = {
          clientId: activeClient.id,
          simulationId: saved.id ?? null,
          createdAt: new Date().toISOString(),
          currency: simulationAdvanced.currency,
          summary,
          schedule: scheduleFromServer,
          property: {
            id: selectedProperty.id,
            name: selectedProperty.name,
          },
          bank: {
            id: selectedBank.id ?? "",
            name: selectedBank.name,
          },
        };

        upsertStoredSimulation(toStore);
        setStoredSimulation(toStore);
      }

      alert("Simulación guardada correctamente.");
    } catch (err: any) {
      console.error("Error guardando simulación", err);
      setSimulationError(
        err?.message || "No se pudo guardar la simulación. Intenta nuevamente."
      );
    } finally {
      setSimulationLoading(false);
    }
  };


  const handleExportPdfClick = async () => {
    if (!savedSimulationId) {
      alert("Primero guarda la simulación para poder exportarla.");
      return;
    }
    try {
      const res = await exportSimulationPdf(savedSimulationId);
      triggerDownload(res.downloadUrl);
    } catch (err: any) {
      console.error("Error exportando PDF", err);
      alert(err?.message || "No se pudo exportar el PDF.");
    }
  };

  const handleExportExcelClick = async () => {
    if (!savedSimulationId) {
      alert("Primero guarda la simulación para poder exportarla.");
      return;
    }
    try {
      const res = await exportSimulationExcel(savedSimulationId);
      triggerDownload(res.downloadUrl);
    } catch (err: any) {
      console.error("Error exportando Excel", err);
      alert(err?.message || "No se pudo exportar el Excel.");
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (activeNav !== "clients") {
      setShowRegistrationForm(false);
      setEditingClient(null);
      setEditClientValues({});
    }
    if (activeNav !== "projects") {
      setSelectedProperty(null);
      setSelectedBank(null);
      setCurrentSimulation(null);
      setSavedSimulationId(null);
      setSimulationInputs({});
      setCalculationSummary(null);
    }
  }, [activeNav]);

  useEffect(() => {
    if (activeNav === "projects") {
      loadProperties(propertyFilters);
    }
  }, [activeNav, propertyFilters]);

  const formatPriceByCurrency = (
    value: number | null | undefined,
    currency: "PEN" | "USD"
  ): string => {
    if (value == null || Number.isNaN(value)) {
      return currency === "PEN" ? "S/ -" : "US$ -";
    }

    const formatter = new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    });

    return formatter.format(value);
  };


const getSimulationSummary = () => {
  const currency = simulationAdvanced.currency;
  const estimatedAmount = getEstimatedLoanAmount();

  if (calculationSummary) {
    const {
      amount,
      monthlyPayment,
      totalInterests,
      totalPayable,
      tcea,
    } = calculationSummary;

    const tceaText =
      tcea == null
        ? "-"
        : typeof tcea === "number"
        ? `${tcea.toFixed(2)}%`
        : String(tcea);

    return [
      {
        label: "Monto Financiado",
        value: formatPriceByCurrency(amount, currency),
      },
      {
        label: "Cuota Mensual",
        value: formatPriceByCurrency(monthlyPayment, currency),
      },
      {
        label: "Total de Intereses",
        value: formatPriceByCurrency(totalInterests, currency),
      },
      {
        label: "TCEA",
        value: tceaText,
        highlight: true,
      },
      {
        label: "Total a Pagar",
        value: formatPriceByCurrency(totalPayable, currency),
        emphasis: true,
      },
    ];
  }

  // Caso sin cálculo todavía
  return [
    {
      label: "Monto Financiado",
      value: formatPriceByCurrency(estimatedAmount, currency),
    },
    {
      label: "Cuota Mensual",
      value: currency === "PEN" ? "S/ -" : "US$ -",
    },
    {
      label: "Total de Intereses",
      value: currency === "PEN" ? "S/ -" : "US$ -",
    },
    {
      label: "TCEA",
      value: "-",
      highlight: true,
    },
    {
      label: "Total a Pagar",
      value: currency === "PEN" ? "S/ -" : "US$ -",
      emphasis: true,
    },
  ];
};

  const simulationIndicators = [
    {
      label: "VAN",
      value:
        !simulationAdvanced.calculateVan || calculationSummary?.van == null
          ? "—"
          : typeof calculationSummary.van === "number"
          ? formatPrice(calculationSummary.van)
          : String(calculationSummary.van),
      description: "Valor presente neto",
    },
    {
      label: "TIR",
      value:
        !simulationAdvanced.calculateTir || calculationSummary?.tir == null
          ? "—"
          : typeof calculationSummary.tir === "number"
          ? `${calculationSummary.tir.toFixed(2)}%`
          : String(calculationSummary.tir),
      description: "Tasa interna de retorno",
    },
  ];


  const renderSimulationSection = () => {
    const estimatedLoanAmount =
      getEstimatedLoanAmount() ??
      (selectedProperty as any)?.price ??
      250000;

    const bankAny = selectedBank as any;

    const uiTerm =
      simulationInputs.term ??
      (selectedBank?.availableTerms &&
      selectedBank.availableTerms.length > 0
        ? selectedBank.availableTerms[0]
        : 20);

    const uiGrace =
      simulationInputs.gracePeriod ?? (selectedBank?.gracePeriod ?? 0);

    const uiAdmin =
      simulationInputs.adminFees ?? (selectedBank?.adminFees ?? 0);

    const uiEval =
      simulationInputs.evaluationFee ??
      (selectedBank?.evaluationFee ?? 0);

    const uiLife =
      simulationInputs.lifeInsurance ??
      (selectedBank?.lifeInsurance ?? 0);

    const uiRate =
      simulationInputs.interestRate ??
      (typeof bankAny?.tea === "number"
        ? bankAny.tea
        : typeof bankAny?.interestRate === "number"
        ? bankAny.interestRate
        : undefined);

    return (
      <section className={styles.simulationLayout}>
        <div className={styles.simulationLeft}>
          <div
            className={styles.simulationCard}
            style={{ color: "#0f172a" }}
          >
            <div className={styles.simulationHeader}>
              <div className={styles.simulationTitleGroup}>
                <p className={styles.simulationHeadline}>
                  Simulación del Crédito
                </p>
                <p className={styles.simulationSubheadline}>
                  Configure y ejecute la simulación del crédito hipotecario
                  para este cliente.
                </p>
                {simulationError && (
                  <p className="mt-2 text-sm text-red-500">
                    {simulationError}
                  </p>
                )}
              </div>
              <div className={styles.simulationTabs}>
                {simulationTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`${styles.simulationTab} ${
                      simulationTab === tab.key
                        ? styles.simulationTabActive
                        : ""
                    }`}
                    onClick={() => setSimulationTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.simulationFields}>
                           {simulationTab === "base" && (
                             <>
                               {(() => {
                                 const propertyAny = selectedProperty as any;
                                 const price =
                                   typeof propertyAny?.price === "number"
                                     ? propertyAny.price
                                     : estimatedLoanAmount;

                                 const downPayment =
                                   baseDownPayment ?? activeClient?.savings ?? 0;

                                 const selectedBonus =
                                   BONUS_OPTIONS.find(
                                     (b) => b.key === selectedBonusKey
                                   ) ?? BONUS_OPTIONS[0];
                                 const bonusAmount =
                                   price && selectedBonus.percent > 0
                                     ? (price * selectedBonus.percent) / 100
                                     : 0;

                                 const creditText =
                                   (activeClient?.creditStatus ?? "").toLowerCase();
                                 const isNoApto = creditText.includes("no apto");

                                 const eligibilityText =
                                   selectedBonus.percent === 0
                                     ? "Cliente sin bono aplicado"
                                     : isNoApto
                                     ? "Cliente no elegible para este bono"
                                     : "Cliente elegible para este bono";

                                 return (
                                   <>
                                     {/* Monto total del préstamo (valor de la vivienda) */}
                                     <div className={styles.simulationField}>
                                       <label className={styles.simulationFieldLabel}>
                                         Monto Total del Préstamo
                                       </label>
                                       <input
                                         className={styles.simulationFieldInput}
                                         value={formatPrice(price ?? 0)}
                                         readOnly
                                       />
                                       <small className={styles.simulationFieldHelper}>
                                         Corresponde al valor total de la vivienda
                                         seleccionada.
                                       </small>
                                     </div>

                                     {/* Aporte inicial editable por el asesor */}
                                     <div className={styles.simulationField}>
                                       <label className={styles.simulationFieldLabel}>
                                         Aporte Inicial
                                       </label>
                                       <input
                                         className={styles.simulationFieldInput}
                                         type="number"
                                         min={0}
                                         value={downPayment}
                                         onChange={(e) => {
                                           const val =
                                             e.target.value === ""
                                               ? 0
                                               : Number(e.target.value);
                                           setBaseDownPayment(
                                             Number.isNaN(val) ? 0 : val
                                           );
                                         }}
                                       />
                                       <small className={styles.simulationFieldHelper}>
                                         Por defecto se usa el ahorro registrado del
                                         cliente, pero el asesor puede ajustarlo para
                                         la simulación.
                                       </small>
                                     </div>

                                     {/* Bono aplicable y monto del bono */}
                                     <div className={styles.simulationField}>
                                       <label className={styles.simulationFieldLabel}>
                                         Bono Aplicable
                                       </label>
                                       <select
                                         className={styles.filterSelect}
                                         value={selectedBonusKey}
                                         onChange={(e) => handleChangeBonus(e.target.value)}
                                       >
                                         {BONUS_OPTIONS.map((opt) => (
                                           <option key={opt.key} value={opt.key}>
                                             {opt.label}
                                           </option>
                                         ))}
                                       </select>
                                     </div>

                                     <div className={styles.simulationField}>
                                       <label className={styles.simulationFieldLabel}>
                                         Monto del Bono
                                       </label>
                                       <input
                                         className={styles.simulationFieldInput}
                                         value={formatPrice(bonusAmount)}
                                         readOnly
                                       />
                                       <small className={styles.simulationFieldHelper}>
                                         Calculado como porcentaje del monto total de la
                                         vivienda.
                                       </small>
                                     </div>

                                     {/* Mensaje de elegibilidad (la franja verde de tu maqueta) */}
                                     <div className={styles.simulationBadge}>
                                       {eligibilityText}
                                     </div>
                                   </>
                                 );
                               })()}
                             </>
                           )}

              {simulationTab === "conditions" && (
                <>
                  <div className={styles.simulationField}>
                    <label className={styles.simulationFieldLabel}>
                      Plazo del crédito (años)
                    </label>
                    <input
                      className={styles.simulationFieldInput}
                      type="number"
                      min={1}
                      value={uiTerm}
                      onChange={(e) =>
                        setSimulationInputs((prev) => ({
                          ...prev,
                          term:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        }))
                      }
                    />
                    <small className={styles.simulationFieldHelper}>
                      Si lo dejas vacío se usa el primer plazo disponible
                      del banco.
                    </small>
                  </div>

                  <div className={styles.simulationField}>
                    <label className={styles.simulationFieldLabel}>
                      Período de gracia (meses)
                    </label>
                    <input
                      className={styles.simulationFieldInput}
                      type="number"
                      min={0}
                      value={uiGrace}
                      onChange={(e) =>
                        setSimulationInputs((prev) => ({
                          ...prev,
                          gracePeriod:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        }))
                      }
                    />
                    <small className={styles.simulationFieldHelper}>
                      Se usa como base el valor configurado en el banco.
                    </small>
                  </div>

                  <div className={styles.simulationField}>
                    <label className={styles.simulationFieldLabel}>
                      Gastos administrativos (% sobre el monto)
                    </label>
                    <input
                      className={styles.simulationFieldInput}
                      type="number"
                      min={0}
                      step="0.01"
                      value={uiAdmin}
                      onChange={(e) =>
                        setSimulationInputs((prev) => ({
                          ...prev,
                          adminFees:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.simulationField}>
                    <label className={styles.simulationFieldLabel}>
                      Comisión de evaluación (%)
                    </label>
                    <input
                      className={styles.simulationFieldInput}
                      type="number"
                      min={0}
                      step="0.01"
                      value={uiEval}
                      onChange={(e) =>
                        setSimulationInputs((prev) => ({
                          ...prev,
                          evaluationFee:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.simulationField}>
                    <label className={styles.simulationFieldLabel}>
                      Seguro de desgravamen (% anual)
                    </label>
                    <input
                      className={styles.simulationFieldInput}
                      type="number"
                      min={0}
                      step="0.01"
                      value={uiLife}
                      onChange={(e) =>
                        setSimulationInputs((prev) => ({
                          ...prev,
                          lifeInsurance:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </>
              )}

{simulationTab === "advanced" && (
  <>
    {/* Configuraciones adicionales */}
    <div className={styles.simulationField}>
      <label className={styles.simulationFieldLabel}>
        Configuraciones Adicionales
      </label>
      <div className={styles.simulationAdvancedOptions}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={!!simulationAdvanced.showDailyBreakdown}
            onChange={(e) =>
              setSimulationAdvanced((prev) => ({
                ...prev,
                showDailyBreakdown: e.target.checked,
              }))
            }
          />
          <span>Mostrar desglose mensual de días</span>
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={!!simulationAdvanced.calculateVan}
            onChange={(e) =>
              setSimulationAdvanced((prev) => ({
                ...prev,
                calculateVan: e.target.checked,
              }))
            }
          />
          <span>Calcular VAN del préstamo</span>
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={!!simulationAdvanced.calculateTir}
            onChange={(e) =>
              setSimulationAdvanced((prev) => ({
                ...prev,
                calculateTir: e.target.checked,
              }))
            }
          />
          <span>Calcular TIR del préstamo</span>
        </label>
      </div>
    </div>
    {/* Fila: Tasa de descuento + Moneda */}
    <div className={styles.simulationFieldRow}>
      <div className={styles.simulationField}>
        <label className={styles.simulationFieldLabel}>
          Tasa de Descuento (VAN)
        </label>
        <div className={styles.simulationFieldInline}>
          <input
            className={styles.simulationFieldInput}
            type="number"
            min={0}
            step="0.01"
            value={simulationAdvanced.discountRate}
            onChange={(e) =>
              setSimulationAdvanced((prev) => ({
                ...prev,
                discountRate:
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value),
              }))
            }
          />
          <span className={styles.simulationFieldSuffix}>%</span>
        </div>
      </div>

      <div className={styles.simulationField}>
        <label className={styles.simulationFieldLabel}>Moneda</label>
        <select
          className={styles.simulationFieldInput}
          value={simulationAdvanced.currency}
          onChange={(e) =>
            setSimulationAdvanced((prev) => ({
              ...prev,
              currency: e.target.value as "PEN" | "USD",
            }))
          }
        >
          <option value="PEN">Soles (PEN)</option>
          <option value="USD">Dólares (USD)</option>
        </select>
      </div>
    </div>

    {/* TEA */}
    <div className={styles.simulationField}>
      <label className={styles.simulationFieldLabel}>
        Tasa Efectiva Anual (TEA)
      </label>
      <input
        className={styles.simulationFieldInput}
        type="number"
        min={0}
        step="0.01"
        value={uiRate ?? ""}
        onChange={(e) =>
          setSimulationInputs((prev) => ({
            ...prev,
            interestRate:
              e.target.value === ""
                ? undefined
                : Number(e.target.value),
          }))
        }
      />
      <small className={styles.simulationFieldHelper}>
        Si modificas este valor, se usará para el cálculo en lugar de la
        TEA del banco.
      </small>
    </div>

    {/* Monto y resumen rápido (lo que ya tenías) */}
    <div className={styles.simulationField}>
      <label className={styles.simulationFieldLabel}>
        Monto que se usará para la simulación
      </label>
      <input
        className={styles.simulationFieldInput}
        value={formatPriceByCurrency(
          estimatedLoanAmount,
          simulationAdvanced.currency
        )}
        readOnly
      />
      <small className={styles.simulationFieldHelper}>
        Corresponde al precio de la vivienda menos el ahorro del cliente
        y el bono aplicado.
      </small>
    </div>

    <div className={styles.simulationField}>
      <label className={styles.simulationFieldLabel}>
        Resumen rápido (después de calcular)
      </label>
      <input
        className={styles.simulationFieldInput}
        value={
          calculationSummary?.monthlyPayment != null
            ? `Cuota aprox: ${formatPriceByCurrency(
                calculationSummary.monthlyPayment,
                simulationAdvanced.currency
              )}`
            : "Aún no se ha calculado la simulación."
        }
        readOnly
      />
    </div>
  </>
)}

            </div>

            <div className={styles.simulationActions}>
              <button
                type="button"
                className={`${styles.buttonPrimary} ${styles.actionBlue}`}
                onClick={handleCalculateSimulation}
                disabled={simulationLoading}
              >
                {simulationLoading ? "Calculando..." : "Calcular Crédito"}
              </button>
              <button
                type="button"
                className={`${styles.buttonPrimary} ${styles.actionGreen}`}
                onClick={handleSaveSimulation}
                disabled={simulationLoading}
              >
                Guardar Simulación
              </button>
            </div>
          </div>
        </div>

        <div className={styles.simulationRight}>
          <div
            className={styles.simulationSummaryCard}
            style={{ color: "#0f172a" }}
          >
            <p className={styles.simulationSectionTitle}>
              Resumen del Préstamo
            </p>
            <div className={styles.simulationSummaryList}>
              {getSimulationSummary().map((item) => (
                <div
                  key={item.label}
                  className={`${styles.simulationSummaryItem} ${
                    item.emphasis ? styles.summaryEmphasis : ""
                  }`}
                >
                  <span>{item.label}</span>
                  <strong
                    className={
                      item.highlight ? styles.summaryHighlight : ""
                    }
                  >
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div
            className={styles.simulationIndicatorsCard}
            style={{ color: "#0f172a" }}
          >
            <p className={styles.simulationSectionTitle}>Indicadores</p>
            <div className={styles.simulationIndicatorList}>
              {simulationIndicators.map((indicator) => (
                <div
                  key={indicator.label}
                  className={styles.simulationIndicator}
                >
                  <div>
                    <p className={styles.simulationIndicatorLabel}>
                      {indicator.label}
                    </p>
                    <p className={styles.simulationIndicatorDescription}>
                      {indicator.description}
                    </p>
                  </div>
                  <strong>{indicator.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div
            className={styles.simulationExportCard}
            style={{ color: "#0f172a" }}
          >
            <p className={styles.simulationSectionTitle}>Exportar</p>
            <div className={styles.simulationExportActions}>
              <button
                type="button"
                className={styles.simulationExportButton}
                onClick={handleExportPdfClick}
              >
                <Download className={styles.simulationExportIcon} />
                Exportar PDF
              </button>
              <button
                type="button"
                className={`${styles.simulationExportButton} ${styles.simulationExportButtonSecondary}`}
                onClick={handleExportExcelClick}
              >
                <Download className={styles.simulationExportIcon} />
                Exportar Excel
              </button>
            </div>
            {!savedSimulationId && (
              <p className="mt-2 text-xs text-slate-500">
                Primero guarda la simulación para habilitar la exportación.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderClientInfoCard = () => {
    if (!activeClient) return null;

    const fullName = `${activeClient.firstName} ${activeClient.lastName}`;
    const creditStatusKey = mapCreditStatusToKey(activeClient.creditStatus);


    return (
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.cardTitle}>Información del cliente</p>
        </div>
        <div className={styles.clientInfoGrid} style={{ color: "#0f172a" }}>
          <div>
            <p className={styles.clientInfoLabel}>Nombre completo</p>
            <p className={styles.clientInfoValue}>{fullName}</p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>DNI</p>
            <p className={styles.clientInfoValue}>{activeClient.dni}</p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Correo electrónico</p>
            <p className={styles.clientInfoValue}>{activeClient.email}</p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Teléfono</p>
            <p className={styles.clientInfoValue}>
              {activeClient.phone ?? "No registrado"}
            </p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Ubicación</p>
            <p className={styles.clientInfoValue}>
              {(activeClient.region ?? "") && (activeClient.province ?? "")
                ? `${activeClient.province}, ${activeClient.region}`
                : activeClient.region ?? "Sin información"}
            </p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>
              Ingreso familiar mensual
            </p>
            <p className={styles.clientInfoValue}>
              {formatPrice(activeClient.familyIncome ?? 0)}
            </p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Ahorros</p>
            <p className={styles.clientInfoValue}>
              {formatPrice(activeClient.savings ?? 0)}
            </p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Deudas</p>
            <p className={styles.clientInfoValue}>
              {formatPrice(activeClient.debts ?? 0)}
            </p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Primera vivienda</p>
            <p className={styles.clientInfoValue}>
              {activeClient.firstHome ? "Sí" : "No"}
            </p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Bono</p>
            <p className={styles.clientInfoValue}>
              {activeClient.bonus ?? "Sin bono"}
            </p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Banco seleccionado</p>
            <p className={styles.clientInfoValue}>
              {activeClient.bank ?? "Sin banco seleccionado"}
            </p>
          </div>
          <div>
            <p className={styles.clientInfoLabel}>Estado del crédito / bono</p>
            <select
              className={styles.filterSelect}
              value={creditStatusKey}
              onChange={(e) =>
                handleChangeCreditStatus(e.target.value as CreditStatusKey)
              }
            >
              {CREDIT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

        </div>
      </section>
    );
  };

  const renderClientDashboard = () => {
    if (!activeClient) return null;

    const fullName = `${activeClient.firstName} ${activeClient.lastName}`;

    return (
      <>
        {renderClientInfoCard()}

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>Dashboard Inmobiliario</p>
              <p className={styles.housingSubheadline}>
                Todas las operaciones se vinculan al cliente{" "}
                <strong>{fullName}</strong>.
              </p>
            </div>
            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => setActiveClient(null)}
              >
                Quitar cliente
              </button>
            </div>
          </div>

          <div className={styles.housingFiltersGrid}>
                       <div className={styles.card}>
                         <div className={styles.cardHeader}>
                           <p className={styles.cardTitle}>Simulaciones</p>
                         </div>
                         <p className={styles.housingSubheadline}>
                           Gestiona las simulaciones de crédito para {fullName}.
                         </p>

                         {storedSimulation ? (
                           <div className={styles.miniSimulationSummary}>
                             <p className={styles.miniSimulationTitle}>
                               Última simulación guardada
                             </p>
                             <p className={styles.miniSimulationLine}>
                               <strong>Banco:</strong> {storedSimulation.bank.name}
                             </p>
                             <p className={styles.miniSimulationLine}>
                               <strong>Vivienda:</strong> {storedSimulation.property.name}
                             </p>
                             <p className={styles.miniSimulationLine}>
                               <strong>Monto financiado:</strong>{" "}
                               {formatPriceByCurrency(
                                 storedSimulation.summary.amount,
                                 storedSimulation.currency
                               )}
                             </p>
                             <p className={styles.miniSimulationLine}>
                               <strong>Cuota mensual:</strong>{" "}
                               {formatPriceByCurrency(
                                 storedSimulation.summary.monthlyPayment,
                                 storedSimulation.currency
                               )}
                             </p>
                           </div>
                         ) : (
                           <p className="mt-3 text-sm text-slate-500">
                             Aún no hay simulaciones guardadas para este cliente.
                           </p>
                         )}

                         <div className="mt-4 flex gap-3 flex-wrap">
                           <button
                             type="button"
                             className={styles.buttonPrimary}
                             onClick={startNewSimulation}
                           >
                             Nueva simulación
                           </button>

                           {storedSimulation && (
                             <button
                               type="button"
                               className={styles.buttonSecondary}
                               onClick={() => setActiveNav("reports")}
                             >
                               Ver reporte
                             </button>
                           )}
                         </div>
                       </div>


            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>Viviendas</p>
              </div>
              <p className={styles.housingSubheadline}>
                Explorar opciones de vivienda compatibles con su bono.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  className={styles.buttonPrimary}
                  onClick={() => {
                    setActiveNav("projects");
                  }}
                >
                  Buscar viviendas
                </button>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>Entidades bancarias</p>
              </div>
              <p className={styles.housingSubheadline}>
                Comparar ofertas bancarias para la vivienda seleccionada.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  className={styles.buttonPrimary}
                  onClick={() => {
                    setActiveNav("projects");
                  }}
                >
                  Ver bancos
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>
              Actividad reciente - {fullName}
            </p>
          </div>
          <ul className={styles.activityList}>
            <li className={styles.activityItem}>
              <span>Simulación de crédito MiVivienda</span>
              <span className={styles.badgeGreen}>Completada</span>
            </li>
            <li className={styles.activityItem}>
              <span>Vivienda seleccionada - Los Jardines</span>
              <span className={styles.badgeYellow}>En proceso</span>
            </li>
            <li className={styles.activityItem}>
              <span>Evaluación crediticia - Banco Continental</span>
              <span className={styles.badgeBlue}>Aprobada</span>
            </li>
          </ul>
        </section>
      </>
    );
  };

  const renderEditClientSection = () => {
    if (!editingClient) return null;

    const region = editClientValues.region ?? "";
    const availableProvinces = PERU_PROVINCES_BY_REGION[region] ?? [];
    const provinceValue = editClientValues.province ?? "";

    return (
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardTitle}>Editar cliente</p>
            <p className={styles.housingSubheadline}>
              Actualiza los datos principales del cliente seleccionado.
            </p>
          </div>
          <div className={styles.cardActions}>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={handleCancelEditClient}
            >
              Cancelar
            </button>
          </div>
        </div>

        {editingError && (
          <p className="mb-4 text-sm text-red-500">{editingError}</p>
        )}

        <div className={styles.editClientGrid}>
          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Nombres</label>
            <input
              className={styles.simulationFieldInput}
              value={editClientValues.firstName ?? ""}
              onChange={(e) =>
                handleEditFieldChange("firstName", e.target.value)
              }
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Apellidos</label>
            <input
              className={styles.simulationFieldInput}
              value={editClientValues.lastName ?? ""}
              onChange={(e) =>
                handleEditFieldChange("lastName", e.target.value)
              }
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>DNI</label>
            <input
              className={styles.simulationFieldInput}
              value={editClientValues.dni ?? ""}
              onChange={(e) => handleEditFieldChange("dni", e.target.value)}
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Correo</label>
            <input
              className={styles.simulationFieldInput}
              value={editClientValues.email ?? ""}
              onChange={(e) =>
                handleEditFieldChange("email", e.target.value)
              }
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Teléfono</label>
            <input
              className={styles.simulationFieldInput}
              value={editClientValues.phone ?? ""}
              onChange={(e) =>
                handleEditFieldChange("phone", e.target.value)
              }
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Dirección</label>
            <input
              className={styles.simulationFieldInput}
              value={editClientValues.address ?? ""}
              onChange={(e) =>
                handleEditFieldChange("address", e.target.value)
              }
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Región</label>
            <select
              className={styles.filterSelect}
              value={region}
              onChange={(e) =>
                handleEditFieldChange("region", e.target.value)
              }
            >
              <option value="">Selecciona región</option>
              {PERU_REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Provincia</label>
            <select
              className={styles.filterSelect}
              value={provinceValue}
              onChange={(e) =>
                handleEditFieldChange("province", e.target.value)
              }
            >
              <option value="">Selecciona provincia</option>
              {availableProvinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
              {provinceValue &&
                !availableProvinces.includes(provinceValue) && (
                  <option value={provinceValue}>{provinceValue}</option>
                )}
            </select>
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>
              Ingreso familiar mensual
            </label>
            <input
              className={styles.simulationFieldInput}
              type="number"
              value={editClientValues.familyIncome ?? ""}
              onChange={(e) =>
                handleEditFieldChange("familyIncome", e.target.value)
              }
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Ahorros</label>
            <input
              className={styles.simulationFieldInput}
              type="number"
              value={editClientValues.savings ?? ""}
              onChange={(e) =>
                handleEditFieldChange("savings", e.target.value)
              }
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Deudas</label>
            <input
              className={styles.simulationFieldInput}
              type="number"
              value={editClientValues.debts ?? ""}
              onChange={(e) =>
                handleEditFieldChange("debts", e.target.value)
              }
            />
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Primera vivienda</label>
            <select
              className={styles.filterSelect}
              value={
                editClientValues.firstHome === undefined
                  ? ""
                  : editClientValues.firstHome
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                handleEditFieldChange("firstHome", e.target.value)
              }
            >
              <option value="">Selecciona</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className={styles.editClientField}>
            <label className={styles.filterLabel}>Banco seleccionado</label>
            <input
              className={styles.simulationFieldInput}
              value={editClientValues.bank ?? ""}
              onChange={(e) =>
                handleEditFieldChange("bank", e.target.value)
              }
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={handleSaveEditClient}
            disabled={editingLoading}
          >
            {editingLoading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </section>
    );
  };

  const renderClientsSection = () => {
    if (activeClient) {
      return renderClientDashboard();
    }

    return (
      <>
        {renderEditClientSection()}

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>Filtros</p>
            </div>
            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => {
                  setClientFilters({});
                  setCurrentPage(1);
                  loadClients();
                }}
              >
                <RotateCcw className={styles.buttonIcon} />
                Limpiar
              </button>
              <button
                type="button"
                className={styles.buttonPrimary}
                onClick={() => setCurrentPage(1)}
              >
                <Search className={styles.buttonIcon} />
                Aplicar Filtros
              </button>
            </div>
          </div>

          <div className={styles.filterGrid}>
            {filterFields.map((field) => (
              <div key={field.label} className={styles.filterField}>
                <label className={styles.filterLabel}>{field.label}</label>
                <select
                  className={styles.filterSelect}
                  value={(clientFilters as any)[field.name] ?? ""}
                  onChange={(e) =>
                    handleFilterChange(field.name, e.target.value)
                  }
                >
                  <option value="">{field.placeholder}</option>
                  {field.name === "bono" && (
                    <>
                      <option value="MiVivienda">MiVivienda</option>
                      <option value="Techo Propio">Techo Propio</option>
                      <option value="Ninguno">Ninguno</option>
                    </>
                  )}
                  {field.name === "banco" && (
                    <>
                      <option value="BCP">BCP</option>
                      <option value="BBVA">BBVA</option>
                      <option value="Interbank">Interbank</option>
                    </>
                  )}
                  {field.name === "estadoCredito" && (
                    <>
                      <option value="APTO">Aptos a bono</option>
                      <option value="NO_APTO">No aptos a bono</option>
                      <option value="EN_PROCESO">Solo en proceso</option>
                    </>
                  )}
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Clientes Registrados</h2>
          </div>

          {clientsLoading && (
            <p className="mt-4 text-sm text-slate-500">Cargando clientes...</p>
          )}

          {clientsError && (
            <p className="mt-4 text-sm text-red-500">{clientsError}</p>
          )}

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeader}>CLIENTE</th>
                  <th className={styles.tableHeader}>DNI</th>
                  <th className={styles.tableHeader}>BONO</th>
                  <th className={styles.tableHeader}>BANCO</th>
                  <th className={styles.tableHeader}>ESTADO CRÉDITO</th>
                  <th className={styles.tableHeader}>ACCIONES</th>
                </tr>
              </thead>

              <tbody>
                {!clientsLoading && currentClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={styles.tableCell}
                      style={{ textAlign: "center", padding: "3rem" }}
                    >
                      <p className="text-slate-500">
                        No hay clientes registrados aún
                      </p>
                      <p className="text-sm text-slate-400 mt-2">
                        Haz clic en &quot;Registrar Cliente&quot; para comenzar
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentClients.map((client) => {
                    const statusRaw = (client.creditStatus ?? "").toLowerCase();
                    const statusClass =
                      !client.creditStatus || statusRaw.trim() === ""
                        ? styles.badgeGrey
                        : statusRaw.includes("apto") &&
                          !statusRaw.includes("no apto")
                        ? styles.badgeGreen
                        : styles.badgeRed;

                    return (
                      <tr key={client.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <div className={styles.clientCell}>
                            <div className={styles.clientAvatar}>
                              {getClientInitials(
                                client.firstName,
                                client.lastName
                              )}
                            </div>
                            <div className={styles.clientInfo}>
                              <p className={styles.clientName}>
                                {client.firstName} {client.lastName}
                              </p>
                              <p className={styles.clientEmail}>
                                {client.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className={styles.tableCell}>{client.dni}</td>

                        <td className={styles.tableCell}>
                          <span
                            className={`${styles.badge} ${getBadgeClass(
                              getBonusBadge(client.bonus ?? undefined)
                            )}`}
                          >
                            {client.bonus ?? "Ninguno"}
                          </span>
                        </td>

                        <td className={styles.tableCell}>
                          {client.bank ?? "-"}
                        </td>

                        <td className={styles.tableCell}>
                          <span
                            className={`${styles.badge} ${statusClass}`}
                          >
                            {client.creditStatus || "En Proceso"}
                          </span>
                        </td>

                        <td className={styles.tableCell}>
                          <div className={styles.actionButtons}>
                            <button
                              type="button"
                              className={styles.buttonPrimary}
                              onClick={() => handleSelectClient(client)}
                            >
                              Seleccionar
                            </button>

                            <button
                              type="button"
                              className={styles.actionButton}
                              aria-label="Ver cliente"
                              onClick={() => handleSelectClient(client)}
                            >
                              <Eye className={styles.actionButtonIcon} />
                            </button>

                            <button
                              type="button"
                              className={styles.actionButton}
                              aria-label="Editar cliente"
                              onClick={() => handleOpenEditClient(client)}
                            >
                              <Edit className={styles.actionButtonIcon} />
                            </button>

                            <button
                              type="button"
                              className={styles.actionButton}
                              aria-label="Eliminar cliente"
                              onClick={async () => {
                                const confirmed = window.confirm(
                                  "¿Seguro que deseas eliminar este cliente?"
                                );
                                if (!confirmed) return;

                                try {
                                  await deleteClient(client.id);
                                  await loadClients();
                                } catch (err) {
                                  console.error(
                                    "Error eliminando cliente",
                                    err
                                  );
                                  alert(
                                    "No se pudo eliminar el cliente. Intenta nuevamente."
                                  );
                                }
                              }}
                            >
                              <Trash2 className={styles.actionButtonIcon} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              {totalResults === 0
                ? "No hay resultados"
                : `Mostrando ${startIndex + 1} a ${Math.min(
                    endIndex,
                    totalResults
                  )} de ${totalResults} resultados`}
            </div>
            {totalPages > 0 && (
              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.paginationButton}
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  &lt;
                </button>
                {Array.from(
                  { length: Math.min(3, totalPages) },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`${styles.paginationButton} ${
                      currentPage === page
                        ? styles.paginationButtonActive
                        : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.paginationButton}
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </section>
      </>
    );
  };

  const renderPropertyCards = (filtered: PropertyDto[]) => {
    if (propertiesLoading) {
      return (
        <p className="mt-6 text-sm text-slate-500">
          Cargando propiedades...
        </p>
      );
    }

    if (propertiesError) {
      return (
        <p className="mt-6 text-sm text-red-500">
          {propertiesError}
        </p>
      );
    }

    if (filtered.length === 0) {
      return (
        <p className="mt-6 text-sm text-slate-500">
          No se encontraron propiedades con los filtros seleccionados.
        </p>
      );
    }

    return (
      <div className={styles.housingCardsGrid}>
        {filtered.map((property, index) => {
          const anyP = property as any;

          const rawStatus = anyP.status ?? "disponible";
          const availabilityVariant = getAvailabilityVariant(rawStatus);
          const statusLabel = rawStatus.toString().toUpperCase();

          const imageUrl =
            DEFAULT_PROPERTY_IMAGES[index % DEFAULT_PROPERTY_IMAGES.length];

          const locationText =
            anyP.location ||
            `${anyP.province ?? ""}, ${anyP.region ?? ""}`.trim() ||
            "Ubicación no especificada";

          const compatibilityText = anyP.compatibleWith ?? "Sin bono";

          const bankName =
            anyP.bankName ??
            (anyP.bank && anyP.bank.name) ??
            "Bancos disponibles";

          return (
            <article key={property.id} className={styles.housingCard}>
              <div className={styles.housingCardImageWrapper}>
                <img
                  src={imageUrl}
                  alt={property.name}
                  className={styles.housingCardImage}
                />
                <div className={styles.housingCardBadges}>
                  <span
                    className={`${styles.housingBadge} ${styles.housingBadgeGreen}`}
                  >
                    {compatibilityText}
                  </span>
                  <span
                    className={`${styles.housingBadge} ${
                      availabilityVariant === "blue"
                        ? styles.housingBadgeBlue
                        : availabilityVariant === "orange"
                        ? styles.housingBadgeOrange
                        : styles.housingBadgeGrey
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>

              <div className={styles.housingCardBody}>
                <div>
                  <h3 className={styles.housingCardTitle}>
                    {property.name}
                  </h3>
                  <p className={styles.housingCardMeta}>
                    {anyP.type ?? "Vivienda"}
                  </p>
                </div>
                <div className={styles.housingCardInfo}>
                  <p>
                    <MapPin className={styles.housingCardIcon} />
                    {locationText}
                  </p>
                  <p>
                    <Banknote className={styles.housingCardIcon} />
                    {bankName}
                  </p>
                </div>
                <div className={styles.housingCardFooter}>
                  <div className={styles.housingPriceBlock}>
                    <p className={styles.housingCardPrice}>
                      {formatPrice(anyP.price)}
                    </p>
                    <p className={styles.housingCardMeta}>Precio total</p>
                  </div>
                  <div className={styles.housingMetrics}>
                    <p>
                      VAN: <strong>—</strong>
                    </p>
                    <p>
                      TIR: <strong>—</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.housingCardActions}>
                <button
                  type="button"
                  className={styles.buttonPrimary}
                  disabled={availabilityVariant === "orange"}
                  onClick={() => handleSelectProperty(property)}
                >
                  Seleccionar
                </button>
                <button
                  type="button"
                  className={styles.buttonSecondary}
                >
                  <Search className={styles.buttonIcon} />
                  Ver detalle
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderBankSelection = () => {
    if (!selectedProperty) return null;

    if (selectedBank) {
      return (
        <>
          <div className={styles.housingHeader}>
            <div>
              <p className={styles.housingHeadline}>Simulación del Crédito</p>
              <p className={styles.housingSubheadline}>
                Vivienda: <strong>{selectedProperty.name}</strong>
              </p>
              <p className={styles.housingSubheadline}>
                Banco seleccionado: <strong>{selectedBank.name}</strong>
              </p>
            </div>
            <div className={styles.housingSummary}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => setSelectedBank(null)}
              >
                Cambiar banco
              </button>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleBackToProperties}
              >
                Cambiar vivienda
              </button>
            </div>
          </div>

          {renderSimulationSection()}
        </>
      );
    }

    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardTitle}>Selección de Entidad Financiera</p>
            <p className={styles.housingSubheadline}>
              Elige el banco para la simulación del crédito hipotecario.
            </p>
            <p className={styles.housingSubheadline}>
              Vivienda seleccionada:{" "}
              <strong>{selectedProperty.name}</strong>
            </p>
          </div>
          <div className={styles.cardActions}>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={handleBackToProperties}
            >
              Volver a viviendas
            </button>
          </div>
        </div>

        {banksLoading && (
          <p className="mt-4 text-sm text-slate-500">
            Cargando bancos disponibles...
          </p>
        )}

        {banksError && (
          <p className="mt-4 text-sm text-red-500">{banksError}</p>
        )}

        {!banksLoading && !banksError && banks.length > 0 && (
          <>
            <div className={styles.housingCardsGrid}>
              {banks.map((bank) => {
                const minTerm = bank.availableTerms.length
                  ? Math.min(...bank.availableTerms)
                  : null;
                const maxTerm = bank.availableTerms.length
                  ? Math.max(...bank.availableTerms)
                  : null;

                return (
                  <article
                    key={bank.id ?? bank.name}
                    className={styles.housingCard}
                  >
                    <div className={styles.housingCardBody}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className={styles.housingCardTitle}>
                            {bank.name}
                          </h3>
                          <p className={styles.housingCardMeta}>
                            {bank.description}
                          </p>
                        </div>
                        <span className={styles.housingBadgeGreen}>
                          Disponible
                        </span>
                      </div>

                      <div className={styles.housingCardInfo}>
                        <p>
                          Tasa Efectiva Anual:{" "}
                          <strong>
                            {formatPercent(bank.tea ?? undefined)}
                          </strong>
                        </p>
                        <p>
                          Tasa Efectiva Mensual:{" "}
                          <strong>
                            {formatPercent(bank.tem ?? undefined)}
                          </strong>
                        </p>
                      </div>

                      <div className={styles.housingCardFooter}>
                        <div className={styles.housingPriceBlock}>
                          <p className={styles.housingCardMeta}>
                            Plazos disponibles
                          </p>
                          <p className={styles.housingCardPrice}>
                            {minTerm && maxTerm
                              ? `${minTerm} - ${maxTerm} años`
                              : "No especificado"}
                          </p>
                        </div>
                        <div className={styles.housingMetrics}>
                          <p>
                            Período de gracia:{" "}
                            <strong>
                              {bank.gracePeriod
                                ? `${bank.gracePeriod} meses`
                                : "No disponible"}
                            </strong>
                          </p>
                          <p>
                            Comisión de evaluación:{" "}
                            <strong>
                              {formatPercent(
                                bank.evaluationFee ?? undefined
                              )}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className={styles.housingMetrics}>
                        <p>
                          Seguro de desgravamen:{" "}
                          <strong>
                            {formatPercent(
                              bank.lifeInsurance ?? undefined
                            )}
                          </strong>
                        </p>
                        <p>
                          Gastos administrativos:{" "}
                          <strong>
                            {formatPercent(bank.adminFees ?? undefined)}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className={styles.housingCardActions}>
                      <button
                        type="button"
                        className={styles.buttonPrimary}
                        onClick={() => handleUseBank(bank)}
                      >
                        Usar este banco
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div
              className={styles.tableContainer}
              style={{ marginTop: "2rem" }}
            >
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeader}>BANCO</th>
                    <th className={styles.tableHeader}>TEA</th>
                    <th className={styles.tableHeader}>TEM</th>
                    <th className={styles.tableHeader}>PLAZOS</th>
                    <th className={styles.tableHeader}>GRACIA</th>
                    <th className={styles.tableHeader}>COMISIÓN</th>
                    <th className={styles.tableHeader}>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map((bank) => {
                    const minTerm = bank.availableTerms.length
                      ? Math.min(...bank.availableTerms)
                      : null;
                    const maxTerm = bank.availableTerms.length
                      ? Math.max(...bank.availableTerms)
                      : null;

                    return (
                      <tr
                        key={`row-${bank.id ?? bank.name}`}
                        className={styles.tableRow}
                      >
                        <td className={styles.tableCell}>{bank.name}</td>
                        <td className={styles.tableCell}>
                          {formatPercent(bank.tea ?? undefined)}
                        </td>
                        <td className={styles.tableCell}>
                          {formatPercent(bank.tem ?? undefined)}
                        </td>
                        <td className={styles.tableCell}>
                          {minTerm && maxTerm
                            ? `${minTerm}-${maxTerm} años`
                            : "-"}
                        </td>
                        <td className={styles.tableCell}>
                          {bank.gracePeriod
                            ? `${bank.gracePeriod} meses`
                            : "-"}
                        </td>
                        <td className={styles.tableCell}>
                          {formatPercent(bank.adminFees ?? undefined)}
                        </td>
                        <td className={styles.tableCell}>
                          <button
                            type="button"
                            className={styles.buttonPrimary}
                            onClick={() => handleUseBank(bank)}
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!banksLoading && !banksError && banks.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No hay bancos configurados en el sistema.
          </p>
        )}
      </div>
    );
  };

  const renderHousingSection = () => {
    let filteredProperties = properties.filter((property) => {
      const anyP = property as any;

      if (housingFilters.bonus) {
        const propBonus = (anyP.compatibleWith ?? "").toString();
        if (housingFilters.bonus === "MiVivienda") {
          if (
            propBonus !== "MiVivienda" &&
            propBonus !== "Ambos"
          ) {
            return false;
          }
        } else if (housingFilters.bonus === "Techo Propio") {
          if (
            propBonus !== "Techo Propio" &&
            propBonus !== "Ambos"
          ) {
            return false;
          }
        }
      }

      if (housingFilters.bank) {
        const propBankName = (
          anyP.bankName ?? (anyP.bank && anyP.bank.name) ?? ""
        )
          .toString()
          .toLowerCase();

        if (!propBankName.includes(housingFilters.bank.toLowerCase())) {
          return false;
        }
      }

      if (housingFilters.region) {
        const propRegion = (anyP.region ?? "").toString().toLowerCase();
        if (propRegion !== housingFilters.region.toLowerCase()) {
          return false;
        }
      }

      if (housingFilters.location) {
        const loc = `${anyP.province ?? ""} ${anyP.location ?? ""}`
          .toString()
          .toLowerCase();
        if (!loc.includes(housingFilters.location.toLowerCase())) {
          return false;
        }
      }

      if (housingFilters.status) {
        const propStatus = (anyP.status ?? "").toString().toUpperCase();
        if (propStatus !== housingFilters.status.toUpperCase()) {
          return false;
        }
      }

      return true;
    });

    if (filteredProperties.length > 0) {
      filteredProperties = [...filteredProperties].sort((a, b) => {
        const priceA = (a as any).price ?? 0;
        const priceB = (b as any).price ?? 0;

        if (housingFilters.orderBy === "price_desc") {
          return priceB - priceA;
        }
        return priceA - priceB;
      });
    }

    return (
      <section className={styles.card}>
        <div className={styles.housingHeader}>
          <div>
            <p className={styles.housingHeadline}>
              Cliente:{" "}
              {activeClient
                ? `${activeClient.firstName} ${activeClient.lastName}`
                : "Ninguno seleccionado"}
            </p>
<p className={styles.housingSubheadline}>
  Bono activo:{" "}
  <span className={styles.housingBadgeHighlight}>
    {(() => {
      if (!activeClient) return "Sin bono";

      // 1) intentamos usar el bono seleccionado en la simulación
      const opt = BONUS_OPTIONS.find((b) => b.key === selectedBonusKey);
      if (opt && opt.key !== "SIN_BONO") {
        return opt.label;
      }

      // 2) si no hay bono seleccionado, usamos el que viene del cliente
      return activeClient.bonus ?? "Sin bono";
    })()}
  </span>
</p>

          </div>
          <div className={styles.housingSummary}>
            <div>
              <p className={styles.housingSummaryLabel}>
                Viviendas encontradas
              </p>
              <p className={styles.housingSummaryValue}>
                {filteredProperties.length}
              </p>
            </div>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => loadProperties(propertyFilters)}
            >
              <Filter className={styles.buttonIcon} />
              Recargar
            </button>
          </div>
        </div>

        {!selectedProperty && (
          <div className={styles.housingFiltersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Bono Aplicable</label>
              <select
                className={styles.filterSelect}
                value={housingFilters.bonus}
                onChange={(e) =>
                  handleHousingFilterChange("bonus", e.target.value)
                }
              >
                <option value="">Todos</option>
                <option value="MiVivienda">MiVivienda</option>
                <option value="Techo Propio">Techo Propio</option>
              </select>
            </div>

            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Banco</label>
              <select
                className={styles.filterSelect}
                value={housingFilters.bank}
                onChange={(e) =>
                  handleHousingFilterChange("bank", e.target.value)
                }
              >
                <option value="">Todos</option>
                <option value="BCP">BCP</option>
                <option value="BBVA">BBVA</option>
                <option value="Interbank">Interbank</option>
                <option value="Scotiabank">Scotiabank</option>
                <option value="BanBif">BanBif</option>
                <option value="Pichincha">Pichincha</option>
              </select>
            </div>

            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Departamento</label>
              <select
                className={styles.filterSelect}
                value={housingFilters.region}
                onChange={(e) =>
                  handleHousingFilterChange("region", e.target.value)
                }
              >
                <option value="">Todos</option>
                {PERU_REGIONS.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Ubicación</label>
              <input
                className={styles.simulationFieldInput}
                placeholder="Provincia, distrito o dirección"
                value={housingFilters.location}
                onChange={(e) =>
                  handleHousingFilterChange("location", e.target.value)
                }
              />
            </div>

            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Estado</label>
              <select
                className={styles.filterSelect}
                value={housingFilters.status}
                onChange={(e) =>
                  handleHousingFilterChange("status", e.target.value)
                }
              >
                <option value="">Todos</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="RESERVADO">Reservado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </div>

            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Ordenar por</label>
              <select
                className={styles.filterSelect}
                value={housingFilters.orderBy}
                onChange={(e) =>
                  handleHousingFilterChange("orderBy", e.target.value)
                }
              >
                <option value="">Precio (menor a mayor)</option>
                <option value="price_desc">Precio (mayor a menor)</option>
              </select>
            </div>
          </div>
        )}

        {selectedProperty
          ? renderBankSelection()
          : renderPropertyCards(filteredProperties)}
      </section>
    );
  };

    const renderSupportSection = () => (
      <>
        {/* HELP SECTION: Guía para Asesores Inmobiliarios */}
        <section
          id="help-guide"
          aria-labelledby="help-title"
          className="help-section"
        >
          <header className="help-header">
            <h1 id="help-title">Guía rápida — EcoMetrix</h1>
            <p className="lead">
              Pasos rápidos y claros para registrar clientes, simular créditos y
              generar informes.
            </p>
          </header>

          <nav className="help-nav" aria-label="Navegación de la guía">
            <a href="#registro" className="nav-link">
              Crear cuenta
            </a>
            <a href="#login" className="nav-link">
              Iniciar sesión
            </a>
            <a href="#crear-cliente" className="nav-link">
              Crear cliente
            </a>
            <a href="#seleccionar-propiedad" className="nav-link">
              Seleccionar propiedad
            </a>
            <a href="#simular-credito" className="nav-link">
              Simular crédito
            </a>
            <a href="#informes" className="nav-link">
              Generar informes
            </a>
            <a href="#faq" className="nav-link">
              FAQ &amp; solución rápida
            </a>
          </nav>

          <article className="help-content">
            {/* 1 */}
            <section
              id="registro"
              className="help-card"
              aria-labelledby="registro-title"
            >
              <h2 id="registro-title">1. Crear cuenta</h2>
              <ol>
                <li>
                  Ve a <strong>Registro</strong> (menú principal) y completa:{" "}
                  <em>Nombre completo, DNI, teléfono, correo y contraseña</em>.
                </li>
                <li>Usa una contraseña segura (mín. 8 caracteres).</li>
              </ol>
              <div className="tip">
                <strong>Consejo:</strong> guarda los datos de acceso en tu gestor
                de contraseñas. Evita usar la misma contraseña en otros servicios.
              </div>
            </section>

            {/* 2 */}
            <section
              id="login"
              className="help-card"
              aria-labelledby="login-title"
            >
              <h2 id="login-title">2. Iniciar sesión</h2>
              <ol>
                <li>
                  Ve a <strong>Iniciar sesión</strong> e ingresa tu correo y
                  contraseña.
                </li>
                <li>Si usas un equipo público, evita marcar &quot;Recordarme&quot;.</li>
              </ol>
              <div className="warning">
                <strong>Atención:</strong> Si recibes muchos intentos fallidos,
                contacta soporte — tu cuenta puede quedar temporalmente bloqueada
                por seguridad.
              </div>
            </section>

            {/* 3 */}
            <section
              id="crear-cliente"
              className="help-card"
              aria-labelledby="crear-cliente-title"
            >
              <h2 id="crear-cliente-title">3. Crear un cliente nuevo</h2>
              <p>
                Registra la información completa del cliente para que la
                elegibilidad y simulaciones sean precisas.
              </p>
              <ul>
                <li>
                  <strong>Datos personales:</strong> Nombre, apellido, DNI, fecha
                  de nacimiento, estado civil.
                </li>
                <li>
                  <strong>Contacto y ubicación:</strong> Correo, teléfono,
                  dirección, región y provincia.
                </li>
                <li>
                  <strong>Empleo e ingresos:</strong> Tipo de empleo,
                  empresa/ocupación, antigüedad laboral, ingresos familiares.
                </li>
                <li>
                  <strong>Situación económica:</strong> Ahorros, deudas
                  existentes, si es primera vivienda, carga familiar.
                </li>
                <li>
                  <strong>Observaciones:</strong> notas relevantes que se
                  guardarán en el historial.
                </li>
              </ul>

              <ol>
                <li>
                  En el panel de <strong>Clientes</strong> haz click en{" "}
                  <em>Nuevo cliente</em>.
                </li>
                <li>Rellena los campos obligatorios (los marcados con *).</li>
                <li>
                  Presiona <em>Guardar</em>. El cliente queda en la base y aparece
                  en la lista general.
                </li>
              </ol>

              <div className="tip">
                <strong>Registro correcto:</strong> evita inconsistencias (ej.:
                ingreso = 0 con deudas &gt; 0). El sistema valida coherencia
                básica.
              </div>
            </section>

            {/* 4 */}
            <section
              id="seleccionar-propiedad"
              className="help-card"
              aria-labelledby="seleccionar-propiedad-title"
            >
              <h2 id="seleccionar-propiedad-title">4. Seleccionar propiedad</h2>
              <p>
                Busca propiedades compatibles con la elegibilidad y preferencias
                del cliente.
              </p>
              <ol>
                <li>
                  Ve a <strong>Propiedades</strong> y usa filtros: precio, región,
                  estado (disponible/reservado/vendido), bono compatible
                  (FMV/Techo Propio), entidades bancarias.
                </li>
                <li>
                  Selecciona la propiedad de interés y haz click en{" "}
                  <em>Seleccionar para simulación</em>.
                </li>
                <li>
                  Al seleccionar una propiedad, el sistema la vincula al nuevo
                  flujo de simulación (paso 1).
                </li>
              </ol>
              <div className="warning">
                <strong>Nota:</strong> si la propiedad está marcada como{" "}
                <em>reservada</em> o <em>vendida</em>, no podrás iniciar una
                simulación activa para compra inmediata.
              </div>
            </section>

            {/* 5 */}
            <section
              id="simular-credito"
              className="help-card"
              aria-labelledby="simular-credito-title"
            >
              <h2 id="simular-credito-title">5. Simular crédito</h2>
              <p>
                Flujo en 3 pasos para obtener un cronograma y métricas financieras
                (VAN, TIR, TCEA).
              </p>

              <details className="step" open>
                <summary>
                  <strong>Paso 1 — Seleccionar vivienda</strong>
                </summary>
                <ol>
                  <li>
                    Si ya seleccionaste la vivienda en Propiedades, se completa
                    automáticamente. Si no, el sistema te pedirá escoger una.
                  </li>
                  <li>
                    Verifica precio, bono compatible y bancos sugeridos según
                    elegibilidad.
                  </li>
                </ol>
              </details>

              <details className="step">
                <summary>
                  <strong>Paso 2 — Seleccionar banco</strong>
                </summary>
                <ol>
                  <li>
                    Elige entre las entidades financieras disponibles. Revisa:
                    TEA, TEM, comisiones, plazos y seguro de degravamen.
                  </li>
                  <li>
                    Compara bancos con la tabla comparativa (abajo) antes de
                    elegir.
                  </li>
                </ol>
              </details>

              <details className="step">
                <summary>
                  <strong>Paso 3 — Ajustes finales</strong>
                </summary>
                <ol>
                  <li>
                    Revisa monto total a financiar y aporte inicial (editable).
                  </li>
                  <li>
                    Selecciona tipo de tasa (TEA/TNA), plazo (años), periodo de
                    gracia (si aplica) y sistema de amortización (Frances vencido
                    por defecto).
                  </li>
                  <li>
                    Configura % de gastos administrativos y otros cargos si es
                    necesario.
                  </li>
                  <li>
                    Presiona <em>Calcular crédito</em> para ver resultados.
                  </li>
                </ol>
              </details>

              <div className="results">
                <p>
                  <strong>Resultados que verás:</strong> Cronograma de pagos
                  mensual, saldo pendiente por periodo, composición de cuota
                  (interés vs amortización), TCEA, VAN y TIR.
                </p>
                <div className="actions">
                  <button className="btn" disabled>
                    Calcular crédito
                  </button>
                  <button className="btn" disabled>
                    Guardar simulación
                  </button>
                  <button className="btn" disabled>
                    Descargar cronograma (Excel)
                  </button>
                </div>
              </div>

              <div className="tip">
                <strong>Consejo de venta:</strong> guarda varias simulaciones para
                comparar alternativas para el mismo cliente y preparar el pitch.
              </div>
            </section>

            {/* 6 */}
            <section
              id="informes"
              className="help-card"
              aria-labelledby="informes-title"
            >
              <h2 id="informes-title">6. Generar informes y exportar</h2>
              <ol>
                <li>
                  Desde el detalle de la simulación puedes: descargar el
                  cronograma en Excel, exportar PDF o enviar el informe por correo
                  al cliente.
                </li>
                <li>
                  El informe incluye: resumen de condiciones, cronograma, gráficas
                  (saldo vs mes y composición de cuota), y sección de transparencia
                  (SBS).
                </li>
                <li>
                  Guarda la simulación si quieres que aparezca en tu historial de
                  simulaciones en el dashboard.
                </li>
              </ol>
              <div className="tip">
                <strong>Exportación:</strong> revisa que el correo del cliente
                exista antes de enviar el informe; evita envíos múltiple por
                error.
              </div>
            </section>

            {/* FAQ and troubleshooting */}
            <section
              id="faq"
              className="help-card"
              aria-labelledby="faq-title"
            >
              <h2 id="faq-title">FAQ &amp; solución rápida</h2>
              <dl>
                <dt>¿Por qué una simulación no guarda?</dt>
                <dd>
                  Verifica que tengas un cliente en contexto activo y conexión
                  estable. Revisa permisos de tu usuario.
                </dd>

                <dt>No encuentro una propiedad en la lista.</dt>
                <dd>
                  Revisa filtros aplicados y estado de la propiedad
                  (disponible/reservada). Si es nuevo, confirma que el inmueble
                  fue cargado por el administrador.
                </dd>

                <dt>El banco no aparece como opción.</dt>
                <dd>
                  Debe estar configurado en el sistema para financiar la vivienda.
                  Contacta al administrador para confirmar si es socio del
                  proyecto.
                </dd>

                <dt>¿Cómo revierto una simulación guardada?</dt>
                <dd>
                  Contacta soporte o usa la acción &quot;Eliminar&quot; en la
                  sección de simulaciones (si tu rol lo permite).
                </dd>
              </dl>

              <div className="support">
                <strong>Soporte:</strong> Si encuentras errores críticos, toma una
                captura, anota la hora y contáctanos a{" "}
                <em>soporte@example.com</em> (ajusta el correo real).
              </div>
            </section>

            {/* Accessibility and final notes */}
            <section
              id="notes"
              className="help-card"
              aria-labelledby="notes-title"
            >
              <h2 id="notes-title">Notas finales y buenas prácticas</h2>
              <ul>
                <li>
                  Mantén siempre actualizado el registro del cliente: es la base
                  para simulaciones confiables.
                </li>
                <li>
                  Guarda y etiqueta cada simulación con una nota breve para poder
                  recuperarla y justificar propuestas ante clientes.
                </li>
                <li>
                  Respeta la privacidad: no compartas los datos sensibles del
                  cliente sin autorización.
                </li>
              </ul>
            </section>
          </article>
        </section>

        {/* CSS embebido tal cual */}
        <style>{`
          /* Reset minimal */
          .help-section, .help-section * { box-sizing: border-box; }

          /* Container */
          .help-section {
            font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            max-width: 1000px;
            margin: 28px auto;
            padding: 22px;
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #eef2f6;
            color: #0f172a;
            box-shadow: 0 8px 30px rgba(12, 24, 40, 0.06);
          }

          /* Header */
          .help-header { margin-bottom: 12px; }
          .help-header h1 { margin: 0; font-size: 1.6rem; color: #0b3b6f; }
          .help-header .lead { margin: 6px 0 0; color: #475569; font-size: 0.95rem; }

          /* Nav */
          .help-nav {
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            margin: 14px 0 18px;
          }
          .help-nav .nav-link {
            display:inline-block;
            text-decoration:none;
            padding:8px 12px;
            background:#f1f8ff;
            color:#0b3b6f;
            border-radius:8px;
            font-size:0.9rem;
            border:1px solid #e6f0ff;
          }
          .help-nav .nav-link:hover { background:#e6f5ff; }

          /* Card */
          .help-card { padding:14px; margin-bottom:12px; border-radius:8px; background: linear-gradient(180deg,#ffffff,#fbfdff); border:1px solid #f0f6fb; }
          .help-card h2 { margin:0 0 8px; font-size:1.05rem; color:#0b3b6f; }
          .help-card ol, .help-card ul { margin:6px 0 8px 20px; color:#0f172a; }
          .help-card p { margin:6px 0 10px; color:#334155; }

          /* Tip, warning */
          .tip, .warning, .support {
            margin-top:10px;
            padding:10px;
            border-radius:8px;
            font-size:0.95rem;
          }
          .tip { background:#f4f9ef; border:1px solid #e3f3d9; color:#1b5e20; }
          .warning { background:#fff7f0; border:1px solid #ffe6d6; color:#7a3e00; }
          .support { background:#f2f9ff; border:1px solid #dbeffd; color:#0b3b6f; }

          /* Steps details */
          .step summary { cursor:pointer; padding:8px; list-style:none; font-weight:600; color:#0b3b6f; }
          .step summary::-webkit-details-marker { display:none; }

          .results { margin-top:10px; background:#fbfdff; padding:10px; border-radius:8px; border:1px solid #eef6ff; }
          .actions { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
          .btn {
            padding:8px 12px;
            border-radius:8px;
            border:1px solid #cfe3ff;
            background:#e9f2ff;
            color:#054a91;
            cursor:not-allowed;
          }

          /* FAQ */
          dl dt { font-weight:700; margin-top:10px; color:#0b3b6f; }
          dl dd { margin:6px 0 0 0; color:#334155; }

          /* Responsive */
          @media (max-width:720px) {
            .help-section { padding:14px; margin:12px; }
            .help-nav { gap:6px; }
            .help-card { padding:10px; }
            .help-header h1 { font-size:1.2rem; }
          }
        `}</style>
      </>
    );


  if (showRegistrationForm && activeNav === "clients") {
    return (
      <ClientRegistrationForm
        onClose={handleCloseRegistrationForm}
        onSubmitClient={handleCreateClient}
      />
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.sidebarLogoIcon}>
            <Image
              src={iconImage}
              alt="Ecometrix Logo"
              width={40}
              height={40}
              className={styles.sidebarLogoImage}
            />
          </div>
          <div>
            <p className={styles.sidebarLogoText}>Ecometrix</p>
            <p className={styles.sidebarTitle}>Sistema CRM</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`${styles.navItem} ${
                activeNav === item.key ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav(item.key)}
            >
              <item.icon className={styles.navItemIcon} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Image
              src={iconImage}
              alt="Ecometrix Logo"
              width={32}
              height={32}
              className={styles.headerLogoIcon}
            />
            <span className={styles.headerLogoText}>Ecometrix</span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerUser}>
              <span>Asesor: {user.name}</span>
              <div className={styles.headerUserIcon}>
                <User className={styles.navItemIcon} />
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className={styles.buttonSecondary}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className={styles.contentArea}>
          <div className={styles.contentGrid}>
            {activeClient &&
              showActiveClientBanner &&
              activeNav === "clients" && (
                <div className={styles.activeClientBanner}>
                  <div className={styles.activeClientBannerContent}>
                    <div className={styles.activeClientBannerIcon} />
                    <span>
                      Cliente activo: {activeClient.firstName}{" "}
                      {activeClient.lastName} (DNI {activeClient.dni}) -{" "}
                      {activeClient.creditStatus ??
                        `Bono: ${activeClient.bonus ?? "Sin bono"}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.activeClientBannerClose}
                    onClick={() => setShowActiveClientBanner(false)}
                    aria-label="Cerrar banner"
                  >
                    <X className={styles.activeClientBannerCloseIcon} />
                  </button>
                </div>
              )}

            <div className={styles.dashboardTitleSection}>
              <h1 className={styles.dashboardTitle}>
                {activeNav === "projects"
                  ? "Selección de Vivienda"
                  : activeNav === "reports"
                  ? "Reportes"
                  : activeNav === "support"
                  ? "Soporte"
                  : activeClient
                  ? "Dashboard Inmobiliario"
                  : "Dashboard Principal"}
              </h1>
              {activeNav === "clients" && !activeClient && (
                <button
                  type="button"
                  className={styles.registerClientButton}
                  onClick={() =>
                    setShowRegistrationForm(!showRegistrationForm)
                  }
                >
                  <Plus className={styles.registerClientButtonIcon} />
                  Registrar Cliente
                </button>
              )}
            </div>

            {activeNav === "clients" ? renderClientsSection() : null}
            {activeNav === "projects" ? renderHousingSection() : null}
            {activeNav === "reports" ? (
              <LoanResultsDashboard
                client={activeClient}
                simulationData={storedSimulation}
                onNewSimulation={startNewSimulation}
                onExportPdf={handleExportPdfClick}
                onExportExcel={handleExportExcelClick}
              />
            ) : null}

            {activeNav === "support" ? renderSupportSection() : null}
          </div>
        </div>
      </div>
    </div>
  );
}
