"use client";

import { Download, Mail, FileSpreadsheet, Plus } from "lucide-react";
import styles from "@/styles/dashboard.module.css";

import type { ClientDto } from "@/features/clients/services/clientsApi";
import type { StoredSimulationData } from "@/features/dashboard/components/DashboardShell";

interface LoanResultsDashboardProps {
  client: ClientDto | null;
  simulationData: StoredSimulationData | null;
  onNewSimulation: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

function formatCurrency(
  value: number | null | undefined,
  currency: "PEN" | "USD"
) {
  if (value == null || Number.isNaN(value)) {
    return currency === "PEN" ? "S/ -" : "US$ -";
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function LoanResultsDashboard({
  client,
  simulationData,
  onNewSimulation,
  onExportPdf,
  onExportExcel,
}: LoanResultsDashboardProps) {
  // Si no hay cliente o simulación guardada
  if (!client || !simulationData) {
    return (
      <div className={styles.loanResultsContainer}>
        <div className={styles.loanResultsHeader}>
          <h1 className={styles.loanResultsTitle}>Resultados del Préstamo</h1>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={onNewSimulation}
          >
            <Plus className={styles.buttonIcon} />
            Nueva Simulación
          </button>
        </div>

        <section className={styles.loanSummaryCard}>
          <h2 className={styles.loanSectionTitle}>Resumen del Préstamo</h2>
          <p className="mt-2 text-sm text-slate-500">
            Selecciona un cliente y guarda al menos una simulación para ver el
            reporte.
          </p>
        </section>
      </div>
    );
  }

  const { summary, schedule, property, bank, currency } = simulationData;
  const fullName = `${client.firstName} ${client.lastName}`;

  const totalPrincipal =
    schedule.reduce((acc, r) => acc + (r.principal ?? 0), 0) || 0;
  const totalInterest =
    schedule.reduce((acc, r) => acc + (r.interest ?? 0), 0) || 0;
  const totalCuotas = totalPrincipal + totalInterest || 1;

  const interestPct = (totalInterest / totalCuotas) * 100;
  const principalPct = (totalPrincipal / totalCuotas) * 100;

 // Mostrar solo las cuotas donde realmente hay amortización
 const amortizingRows = schedule.filter(
   (row) => (row.principal ?? 0) > 0.0001
 );

 const firstRows = amortizingRows.slice(0, 3);
 const remaining =
   amortizingRows.length > 3 ? amortizingRows.length - 3 : 0;

const saldoInicial =
  amortizingRows.length > 0
    ? amortizingRows[0].balance + amortizingRows[0].principal
    : schedule.length > 0
    ? schedule[0].balance + schedule[0].principal
    : summary.amount;

const saldoFinal =
  amortizingRows.length > 0
    ? amortizingRows[amortizingRows.length - 1].balance
    : schedule.length > 0
    ? schedule[schedule.length - 1].balance
    : 0;


  return (
    <div className={styles.loanResultsContainer}>
      {/* Header */}
      <div className={styles.loanResultsHeader}>
        <h1 className={styles.loanResultsTitle}>Resultados del Préstamo</h1>
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={onNewSimulation}
        >
          <Plus className={styles.buttonIcon} />
          Nueva Simulación
        </button>
      </div>

      {/* Resumen del Préstamo */}
      <section className={styles.loanSummaryCard}>
        <h2 className={styles.loanSectionTitle}>Resumen del Préstamo</h2>

        <p className={styles.loanScheduleNote}>
          Cliente: <strong>{fullName}</strong> — Vivienda:{" "}
          <strong>{property.name}</strong> — Banco:{" "}
          <strong>{bank.name}</strong>
        </p>

        <div className={styles.loanSummaryGrid}>
          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>Banco Seleccionado</span>
            <span className={styles.loanSummaryValue}>{bank.name}</span>
          </div>

          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>TCEA referencial</span>
            <span className={styles.loanSummaryValue}>
              {summary.tcea == null
                ? "-"
                : typeof summary.tcea === "number"
                ? `${summary.tcea.toFixed(2)}%`
                : String(summary.tcea)}
            </span>
          </div>

          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>Plazo</span>
            <span className={styles.loanSummaryValue}>
              {summary.termYears != null
                ? `${summary.termYears} años`
                : "—"}
            </span>
          </div>

          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>Monto financiado</span>
            <span className={styles.loanSummaryValue}>
              {formatCurrency(summary.amount, currency)}
            </span>
          </div>

          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>Cuota mensual</span>
            <span className={styles.loanSummaryValue}>
              {formatCurrency(summary.monthlyPayment, currency)}
            </span>
          </div>

          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>Total de intereses</span>
            <span className={styles.loanSummaryValue}>
              {formatCurrency(summary.totalInterests, currency)}
            </span>
          </div>

          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>TIR del proyecto</span>
            <span className={styles.loanSummaryValue}>
              {summary.tir == null
                ? "—"
                : typeof summary.tir === "number"
                ? `${summary.tir.toFixed(2)}%`
                : String(summary.tir)}
            </span>
          </div>

          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>VAN</span>
            <span
              className={`${styles.loanSummaryValue} ${styles.loanSummaryHighlight}`}
            >
              {summary.van == null
                ? "—"
                : typeof summary.van === "number"
                ? formatCurrency(summary.van, currency)
                : String(summary.van)}
            </span>
          </div>

          <div className={styles.loanSummaryItem}>
            <span className={styles.loanSummaryLabel}>Total a pagar</span>
            <span className={styles.loanSummaryValue}>
              {formatCurrency(summary.totalPayable, currency)}
            </span>
          </div>
        </div>
      </section>

      {/* Gráficos / placeholders descriptivos */}
      <div className={styles.loanChartsGrid}>
        {/* Evolución del Saldo */}
 <section className={styles.loanChartCard}>
   <h2 className={styles.loanSectionTitle}>Evolución del Saldo</h2>
   <div
     style={{
       padding: "16px",
       borderRadius: "12px",
       background: "#f8fafc",
       border: "1px solid #e2e8f0",
     }}
   >
     <p
       style={{
         fontSize: "0.9rem",
         color: "#475569",
         marginBottom: "8px",
       }}
     >
       Saldo inicial:{" "}
       <strong>
         {formatCurrency(saldoInicial ?? summary.amount, currency)}
       </strong>{" "}
       → Saldo final:{" "}
       <strong>{formatCurrency(saldoFinal, currency)}</strong> en{" "}
       <strong>{schedule.length}</strong> cuotas.
     </p>

     <div
       style={{
         width: "100%",
         height: "10px",
         borderRadius: "999px",
         background: "#e5e7eb",
         overflow: "hidden",
       }}
     >
       <div
         style={{
           width: "100%",
           height: "100%",
           background:
             "linear-gradient(90deg, #22c55e 0%, #3b82f6 40%, #0f172a 100%)",
         }}
       />
     </div>
   </div>
 </section>

        {/* Composición de Cuotas */}
<section className={styles.loanChartCard}>
  <h2 className={styles.loanSectionTitle}>Composición de Cuotas</h2>
  <div
    style={{
      padding: "16px",
      borderRadius: "12px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
    }}
  >
    <p
      style={{
        fontSize: "0.9rem",
        color: "#475569",
        marginBottom: "12px",
      }}
    >
      Intereses:{" "}
      <strong>{interestPct.toFixed(1)}%</strong> — Amortización:{" "}
      <strong>{principalPct.toFixed(1)}%</strong>
    </p>

    <div
      style={{
        width: "100%",
        height: "16px",
        borderRadius: "999px",
        background: "#e5e7eb",
        overflow: "hidden",
        display: "flex",
      }}
    >
      <div
        style={{
          width: `${interestPct}%`,
          height: "100%",
          background: "#f97373", // Intereses (rojo)
        }}
      />
      <div
        style={{
          width: `${principalPct}%`,
          height: "100%",
          background: "#3b82f6", // Amortización (azul)
        }}
      />
    </div>

    <div
      style={{
        display: "flex",
        gap: "16px",
        marginTop: "10px",
        fontSize: "0.85rem",
        color: "#64748b",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "999px",
            background: "#f97373",
          }}
        />
        Intereses
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "999px",
            background: "#3b82f6",
          }}
        />
        Amortización
      </span>
    </div>
  </div>
</section>
      </div>

      {/* Cronograma de Pagos */}
      <section className={styles.loanScheduleCard}>
        <div className={styles.loanScheduleHeader}>
          <h2 className={styles.loanSectionTitle}>Cronograma de Pagos</h2>
          <button
            type="button"
            className={`${styles.buttonPrimary} ${styles.actionPurple}`}
            onClick={onExportExcel}
          >
            <FileSpreadsheet className={styles.buttonIcon} />
            Descargar Excel
          </button>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Cuota</th>
                <th className={styles.tableHeader}>Período</th>
                <th className={styles.tableHeader}>Saldo Inicial</th>
                <th className={styles.tableHeader}>Interés</th>
                <th className={styles.tableHeader}>Amortización</th>
                <th className={styles.tableHeader}>Cuota Total</th>
                <th className={styles.tableHeader}>Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              {firstRows.map((row) => {
                const saldoIni = row.balance + row.principal;
                return (
                  <tr key={row.period} className={styles.tableRow}>
                    <td className={styles.tableCell}>{row.period}</td>
                    <td className={styles.tableCell}>Mes {row.period}</td>
                    <td className={styles.tableCell}>
                      {formatCurrency(saldoIni, currency)}
                    </td>
                    <td className={styles.tableCell}>
                      {formatCurrency(row.interest, currency)}
                    </td>
                    <td className={styles.tableCell}>
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
        {remaining > 0 && (
          <p className={styles.loanScheduleNote}>
            ... {remaining} cuotas adicionales...
          </p>
        )}
      </section>

      {/* Información de Transparencia */}
      <section className={styles.loanTransparencyCard}>
        <h2 className={styles.loanSectionTitle}>
          Información de Transparencia - SBS
        </h2>
        <div className={styles.loanTransparencyContent}>
          <div className={styles.loanTransparencyItem}>
            <strong>TCEA referencial:</strong>{" "}
            {summary.tcea == null
              ? "-"
              : typeof summary.tcea === "number"
              ? `${summary.tcea.toFixed(2)}%`
              : String(summary.tcea)}
            <br />
            Incluye costos y gastos asociados al préstamo de forma estimada.
          </div>
          <div className={styles.loanTransparencyImportant}>
            <strong>Importante:</strong> Los cálculos son referenciales. Las
            condiciones finales dependerán de la evaluación crediticia y de las
            políticas vigentes del banco. Consulte la Superintendencia de Banca,
            Seguros y AFP (www.sbs.gob.pe).
          </div>
        </div>
      </section>

      {/* Botones de Acción */}
      <div className={styles.loanActionsFooter}>
        <button
          type="button"
          className={`${styles.buttonPrimary} ${styles.actionRed}`}
          onClick={onExportPdf}
        >
          <Download className={styles.buttonIcon} />
          Descargar PDF
        </button>
        <button
          type="button"
          className={`${styles.buttonPrimary} ${styles.actionBlue}`}
          disabled
        >
          <Mail className={styles.buttonIcon} />
          Enviar por Correo
        </button>
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={onNewSimulation}
        >
          <Plus className={styles.buttonIcon} />
          Nueva Simulación
        </button>
      </div>
    </div>
  );
}
