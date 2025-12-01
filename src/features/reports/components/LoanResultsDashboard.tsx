"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileBarChart2,
  PieChart as PieChartIcon,
  TrendingDown,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import type { ClientDto } from "@/features/clients/services/clientsApi";
import type { StoredSimulationData } from "@/features/dashboard/components/DashboardShell";
import styles from "@/styles/dashboard.module.css";

interface LoanResultsDashboardProps {
  client: ClientDto | null;
  simulationData: StoredSimulationData | null;
  onNewSimulation: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

type ScheduleRow = {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
  paymentDate?: string;
};

const PIE_COLORS = ["#f97373", "#3b82f6"]; // Intereses / Amortización

const formatCurrency = (
  value: number | null | undefined,
  currency: "PEN" | "USD"
): string => {
  if (value == null || Number.isNaN(value)) {
    return currency === "USD" ? "US$ -" : "S/ -";
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)}%`;
};

const formatMonthLabel = (row: ScheduleRow): string => {
  if (row.paymentDate) {
    const d = new Date(row.paymentDate);
    return d.toLocaleDateString("es-PE", {
      month: "short",
      year: "numeric",
    });
  }
  return `Mes ${row.period}`;
};

export function LoanResultsDashboard({
  client,
  simulationData,
  onNewSimulation,
  onExportPdf,
  onExportExcel,
}: LoanResultsDashboardProps) {
  if (!simulationData) {
    return (
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardTitle}>Resultados del Préstamo</p>
            <p className={styles.housingSubheadline}>
              Aún no hay simulaciones guardadas para este cliente.
            </p>
          </div>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={onNewSimulation}
          >
            <Plus className={styles.buttonIcon} />
            Nueva simulación
          </button>
        </div>
      </section>
    );
  }

  const { summary, schedule, currency, property, bank, financing } =
    simulationData;

  const scheduleRows: ScheduleRow[] = (schedule ?? []) as ScheduleRow[];
  const totalMonths = scheduleRows.length;
  const totalYears = totalMonths > 0 ? Math.ceil(totalMonths / 12) : 0;

  const fullName = client
    ? `${client.firstName} ${client.lastName}`
    : "Cliente no especificado";

  const tceaText =
    summary.tcea == null
      ? "—"
      : typeof summary.tcea === "number"
      ? `${summary.tcea.toFixed(2)}%`
      : String(summary.tcea);

  const tirText =
    summary.tir == null
      ? "—"
      : typeof summary.tir === "number"
      ? `${summary.tir.toFixed(2)}%`
      : String(summary.tir);

  const vanText =
    summary.van == null
      ? "—"
      : typeof summary.van === "number"
      ? formatCurrency(summary.van, currency)
      : String(summary.van);

  // ==== GRÁFICA EVOLUCIÓN DEL SALDO ====
  const balanceChartData = useMemo(() => {
    if (!scheduleRows.length) return [];

    const data = [
      {
        label: "Mes 0",
        balance: summary.amount ?? scheduleRows[0].balance,
      },
      ...scheduleRows
        .filter((row) => row.period % 12 === 0 || row.period === totalMonths)
        .map((row) => ({
          label: `Mes ${row.period}`,
          balance: row.balance,
        })),
    ];

    return data;
  }, [scheduleRows, totalMonths, summary.amount]);

  // ==== GRÁFICA DE COMPOSICIÓN ====
  const totalInterests = summary.totalInterests ?? 0;
  const principalTotal = summary.amount ?? 0;

  const pieData = [
    {
      name: "Intereses",
      value: Math.max(totalInterests, 0),
    },
    {
      name: "Amortización",
      value: Math.max(principalTotal, 0),
    },
  ];

  // ==== TRANSPARENCIA SBS ====
  const amount = summary.amount ?? 0;
  const adminPct = financing?.adminFeesPercent ?? 0;
  const evalPct = financing?.evaluationFeePercent ?? 0;
  const lifePct = financing?.lifeInsurancePercent ?? 0;
  const graceMonths = financing?.gracePeriodMonths ?? 0;
  const tea = financing?.interestRateAnnual ?? null;

  const adminAmount = amount * (adminPct / 100);
  const evalAmount = amount * (evalPct / 100);
  const initialCharges = adminAmount + evalAmount;

  const lifeYearFraction = totalMonths / 12;
  const lifeTotal = amount * (lifePct / 100) * (lifeYearFraction || 0);

  const netDisbursement = amount - initialCharges;

  // ==== FILTRO SIMPLE DEL CRONOGRAMA (TODAS / PRIMER AÑO / ÚLTIMO AÑO) ====
  const [scheduleView, setScheduleView] = useState<
    "ALL" | "FIRST_YEAR" | "LAST_YEAR"
  >("ALL");

  const filteredScheduleRows = useMemo(() => {
    if (!scheduleRows.length) return [];
    if (scheduleView === "ALL" || totalMonths <= 12) return scheduleRows;

    if (scheduleView === "FIRST_YEAR") {
      return scheduleRows.slice(0, 12);
    }

    // LAST_YEAR
    return scheduleRows.slice(Math.max(totalMonths - 12, 0));
  }, [scheduleRows, scheduleView, totalMonths]);

  return (
    <section className={styles.card}>
      {/* HEADER GENERAL */}
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardTitle}>Resultados del Préstamo</p>
          <p className={styles.housingSubheadline}>
            Cliente: <strong>{fullName}</strong> — Vivienda:{" "}
            <strong>{property.name}</strong> — Banco:{" "}
            <strong>{bank.name}</strong>
          </p>
        </div>
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={onNewSimulation}
        >
          <Plus className={styles.buttonIcon} />
          Nueva simulación
        </button>
      </div>

      {/* RESUMEN DEL PRÉSTAMO */}
      <div
        className={styles.simulationSummaryCard}
        style={{ marginTop: "1rem" }}
      >
        <div className={styles.cardHeader} style={{ padding: 0 }}>
          <div>
            <p className={styles.cardTitle}>Resumen del Préstamo</p>
          </div>
        </div>

        <div className={styles.simulationSummaryList}>
          <div className={styles.simulationSummaryItem}>
            <span>Banco seleccionado</span>
            <strong>{bank.name}</strong>
          </div>
          <div className={styles.simulationSummaryItem}>
            <span>Tasa de interés</span>
            <strong>
              {tea != null ? formatPercent(tea) + " TEA" : "—"}
            </strong>
          </div>
          <div className={styles.simulationSummaryItem}>
            <span>Plazo</span>
            <strong>
              {summary.termYears ?? "—"} años ({totalMonths} meses)
            </strong>
          </div>
          <div className={styles.simulationSummaryItem}>
            <span>TCEA estimada</span>
            <strong>{tceaText}</strong>
          </div>
        </div>

        <div className={styles.simulationSummaryList}>
          <div className={styles.simulationSummaryItem}>
            <span>TIR del proyecto</span>
            <strong>{tirText}</strong>
          </div>
          <div className={styles.simulationSummaryItem}>
            <span>VAN</span>
            <strong>{vanText}</strong>
          </div>
          <div className={styles.simulationSummaryItem}>
            <span>Monto financiado</span>
            <strong>
              {formatCurrency(summary.amount, currency)}
            </strong>
          </div>
          <div className={styles.simulationSummaryItem}>
            <span>Cuota mensual</span>
            <strong>
              {formatCurrency(summary.monthlyPayment, currency)}
            </strong>
          </div>
        </div>
      </div>

      {/* FILA DE GRÁFICAS */}
      <div
        className={styles.housingGrid}
        style={{ marginTop: "1rem", alignItems: "stretch" }}
      >
        {/* Evolución del saldo */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>
                <TrendingDown className={styles.buttonIcon} />
                Evolución del Saldo
              </p>
              <p className={styles.housingSubheadline}>
                Saldo pendiente del crédito a lo largo del tiempo.
              </p>
            </div>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={balanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) =>
                    formatCurrency(Number(value), currency)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Composición de cuotas */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>
                <PieChartIcon className={styles.buttonIcon} />
                Composición de Cuotas
              </p>
              <p className={styles.housingSubheadline}>
                Relación entre intereses y amortización del capital.
              </p>
            </div>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value), currency),
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CRONOGRAMA DE PAGOS – COMPLETO */}
      <div style={{ marginTop: "1.5rem" }}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardTitle}>
              <FileBarChart2 className={styles.buttonIcon} />
              Cronograma de Pagos
            </p>
            <p className={styles.housingSubheadline}>
              Cronograma completo generado por la simulación. Puedes filtrarlo
              por tramo y descargarlo en PDF o Excel.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {/* Filtro rápido de vista */}
            {totalYears > 1 && (
              <select
                className={styles.filterSelect}
                value={scheduleView}
                onChange={(e) =>
                  setScheduleView(e.target.value as typeof scheduleView)
                }
              >
                <option value="ALL">Todas las cuotas</option>
                <option value="FIRST_YEAR">Solo 1er año</option>
                <option value="LAST_YEAR">Último año</option>
              </select>
            )}

            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={onExportPdf}
            >
              <Download className={styles.buttonIcon} />
              PDF
            </button>

            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={onExportExcel}
            >
              <Download className={styles.buttonIcon} />
              Excel
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Cuota</th>
                <th className={styles.tableHeader}>Fecha</th>
                <th className={styles.tableHeader}>Saldo inicial</th>
                <th className={styles.tableHeader}>Interés</th>
                <th className={styles.tableHeader}>Amortización</th>
                <th className={styles.tableHeader}>Cuota total</th>
                <th className={styles.tableHeader}>Saldo final</th>
              </tr>
            </thead>
            <tbody>
              {filteredScheduleRows.map((row) => {
                const saldoInicial =
                  row.balance + row.principal; // antes de pagar
                return (
                  <tr key={row.period} className={styles.tableRow}>
                    <td className={styles.tableCell}>{row.period}</td>
                    <td className={styles.tableCell}>
                      {formatMonthLabel(row)}
                    </td>
                    <td className={styles.tableCell}>
                      {formatCurrency(saldoInicial, currency)}
                    </td>
                    <td
                      className={styles.tableCell}
                      style={{ color: "#ef4444", fontWeight: 500 }}
                    >
                      {formatCurrency(row.interest, currency)}
                    </td>
                    <td
                      className={styles.tableCell}
                      style={{ color: "#2563eb", fontWeight: 500 }}
                    >
                      {formatCurrency(row.principal, currency)}
                    </td>
                    <td className={styles.tableCell}>
                      {formatCurrency(row.payment, currency)}
                    </td>
                    <td className={styles.tableCell}>
                      {formatCurrency(row.balance, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INFORMACIÓN DE TRANSPARENCIA – SBS (CUADRO AMARILLO) */}
      <div
        style={{
          marginTop: "1.5rem",
          borderRadius: "0.75rem",
          padding: "1.25rem 1.5rem",
          backgroundColor: "#FEF3C7",
          border: "1px solid #FDE68A",
        }}
      >
        <p
          className={styles.cardTitle}
          style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "999px",
              backgroundColor: "#F59E0B",
              marginTop: 8,
            }}
          />
          Información de Transparencia - SBS
        </p>

        <p className={styles.housingSubheadline}>
          <strong>TCEA (Tasa de Costo Efectivo Anual):</strong> {tceaText}. Esta
          tasa incluye todos los costos y gastos asociados al préstamo simulados
          (intereses, comisiones y seguros).
        </p>

        <p className={styles.housingSubheadline}>
          <strong>Comisiones:</strong>{" "}
          Comisión de evaluación: {formatPercent(evalPct)} (
          {formatCurrency(evalAmount, currency)}). Comisión administrativa:{" "}
          {formatPercent(adminPct)} (
          {formatCurrency(adminAmount, currency)}). Monto neto aproximado a
          desembolsar al cliente:{" "}
          {formatCurrency(netDisbursement, currency)}.
        </p>

        <p className={styles.housingSubheadline}>
          <strong>Seguros:</strong>{" "}
          Seguro de desgravamen referencial de {formatPercent(lifePct)} anual,
          equivalente aproximadamente a{" "}
          {formatCurrency(lifeTotal, currency)} durante todo el plazo del
          crédito (estimado en función de la simulación).
        </p>

        <p className={styles.housingSubheadline}>
          <strong>Período de gracia:</strong>{" "}
          {graceMonths > 0
            ? `${graceMonths} meses de gracia considerados en la simulación.`
            : "No se ha considerado período de gracia en la simulación."}
        </p>

        <p
          className={styles.housingSubheadline}
          style={{ fontSize: "0.75rem", marginTop: "0.75rem" }}
        >
          <strong>Importante:</strong> Los cálculos son referenciales. Las
          condiciones finales pueden variar según la evaluación crediticia y la
          política vigente del banco. Esta información se presenta solo como
          apoyo para la conversación de transparencia con el cliente.
        </p>
      </div>

      {/* BOTONES FINALES */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={onExportPdf}
          style={{ backgroundColor: "#ef4444", borderColor: "#ef4444" }}
        >
          <Download className={styles.buttonIcon} />
          Descargar PDF
        </button>

        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={onExportExcel}
        >
          <Download className={styles.buttonIcon} />
          Descargar Excel
        </button>

        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={onNewSimulation}
        >
          <Plus className={styles.buttonIcon} />
          Nueva simulación
        </button>
      </div>
    </section>
  );
}
