"use client";

import { Download, Mail, FileSpreadsheet } from "lucide-react";
import styles from "@/styles/dashboard.module.css";

export function LoanResultsDashboard() {
    // Datos de ejemplo basados en la imagen
    const loanSummary = {
        bank: "Banco de Crédito",
        interestRate: "12.50% TEA",
        term: "60 meses",
        tcea: "14.25%",
        tir: "18.75%",
        van: "S/ 45,230",
        bondAmount: "S/ 8,500",
    };

    const paymentSchedule = [
        {
            cuota: 1,
            fecha: "Ene 2024",
            saldoInicial: "S/ 150,000.00",
            interes: "S/ 1,562.50",
            amortizacion: "S/ 1,937.50",
            cuotaTotal: "S/ 3,500.00",
            saldoFinal: "S/ 148,062.50",
        },
        {
            cuota: 2,
            fecha: "Feb 2024",
            saldoInicial: "S/ 148,062.50",
            interes: "S/ 1,542.31",
            amortizacion: "S/ 1,957.69",
            cuotaTotal: "S/ 3,500.00",
            saldoFinal: "S/ 146,104.81",
        },
        {
            cuota: 3,
            fecha: "Mar 2024",
            saldoInicial: "S/ 146,104.81",
            interes: "S/ 1,521.92",
            amortizacion: "S/ 1,978.08",
            cuotaTotal: "S/ 3,500.00",
            saldoFinal: "S/ 144,126.73",
        },
    ];

    return (
        <div className={styles.loanResultsContainer}>
            {/* Header */}
            <div className={styles.loanResultsHeader}>
                <h1 className={styles.loanResultsTitle}>Resultados del Préstamo</h1>
                <button type="button" className={styles.buttonPrimary}>
                    Nueva Simulación
                </button>
            </div>

            {/* Resumen del Préstamo */}
            <section className={styles.loanSummaryCard}>
                <h2 className={styles.loanSectionTitle}>Resumen del Préstamo</h2>
                <div className={styles.loanSummaryGrid}>
                    <div className={styles.loanSummaryItem}>
                        <span className={styles.loanSummaryLabel}>Banco Seleccionado</span>
                        <span className={styles.loanSummaryValue}>{loanSummary.bank}</span>
                    </div>
                    <div className={styles.loanSummaryItem}>
                        <span className={styles.loanSummaryLabel}>Tasa de Interés</span>
                        <span className={styles.loanSummaryValue}>{loanSummary.interestRate}</span>
                    </div>
                    <div className={styles.loanSummaryItem}>
                        <span className={styles.loanSummaryLabel}>Plazo</span>
                        <span className={styles.loanSummaryValue}>{loanSummary.term}</span>
                    </div>
                    <div className={styles.loanSummaryItem}>
                        <span className={styles.loanSummaryLabel}>TCEA</span>
                        <span className={styles.loanSummaryValue}>{loanSummary.tcea}</span>
                    </div>
                    <div className={styles.loanSummaryItem}>
                        <span className={styles.loanSummaryLabel}>TIR del Proyecto</span>
                        <span className={styles.loanSummaryValue}>{loanSummary.tir}</span>
                    </div>
                    <div className={styles.loanSummaryItem}>
                        <span className={styles.loanSummaryLabel}>VAN</span>
                        <span className={`${styles.loanSummaryValue} ${styles.loanSummaryHighlight}`}>
                            {loanSummary.van}
                        </span>
                    </div>
                    <div className={styles.loanSummaryItem}>
                        <span className={styles.loanSummaryLabel}>Monto del Bono</span>
                        <span className={styles.loanSummaryValue}>{loanSummary.bondAmount}</span>
                    </div>
                </div>
            </section>

            {/* Gráficos y Cronograma */}
            <div className={styles.loanChartsGrid}>
                {/* Evolución del Saldo */}
                <section className={styles.loanChartCard}>
                    <h2 className={styles.loanSectionTitle}>Evolución del Saldo</h2>
                    <div className={styles.loanChartPlaceholder}>
                        <p className={styles.loanChartPlaceholderText}>
                            Gráfico de línea mostrando la evolución del saldo desde S/ 150,000 hasta S/ 0
                        </p>
                    </div>
                </section>

                {/* Composición de Cuotas */}
                <section className={styles.loanChartCard}>
                    <h2 className={styles.loanSectionTitle}>Composición de Cuotas</h2>
                    <div className={styles.loanChartPlaceholder}>
                        <p className={styles.loanChartPlaceholderText}>
                            Gráfico de dona mostrando Intereses (rojo) y Amortización (azul)
                        </p>
                    </div>
                </section>
            </div>

            {/* Cronograma de Pagos */}
            <section className={styles.loanScheduleCard}>
                <div className={styles.loanScheduleHeader}>
                    <h2 className={styles.loanSectionTitle}>Cronograma de Pagos</h2>
                    <button type="button" className={`${styles.buttonPrimary} ${styles.actionPurple}`}>
                        <FileSpreadsheet className={styles.buttonIcon} />
                        Descargar Excel
                    </button>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.tableHeader}>Cuota</th>
                                <th className={styles.tableHeader}>Fecha</th>
                                <th className={styles.tableHeader}>Saldo Inicial</th>
                                <th className={styles.tableHeader}>Interés</th>
                                <th className={styles.tableHeader}>Amortización</th>
                                <th className={styles.tableHeader}>Cuota Total</th>
                                <th className={styles.tableHeader}>Saldo Final</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentSchedule.map((payment) => (
                                <tr key={payment.cuota} className={styles.tableRow}>
                                    <td className={styles.tableCell}>{payment.cuota}</td>
                                    <td className={styles.tableCell}>{payment.fecha}</td>
                                    <td className={styles.tableCell}>{payment.saldoInicial}</td>
                                    <td className={styles.tableCell}>{payment.interes}</td>
                                    <td className={styles.tableCell}>{payment.amortizacion}</td>
                                    <td className={styles.tableCell}>{payment.cuotaTotal}</td>
                                    <td className={styles.tableCell}>{payment.saldoFinal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className={styles.loanScheduleNote}>... 57 cuotas adicionales...</p>
            </section>

            {/* Información de Transparencia */}
            <section className={styles.loanTransparencyCard}>
                <h2 className={styles.loanSectionTitle}>Información de Transparencia - SBS</h2>
                <div className={styles.loanTransparencyContent}>
                    <div className={styles.loanTransparencyItem}>
                        <strong>TCEA (Tasa de Costo Efectivo Anual):</strong> {loanSummary.tcea}
                        <br />
                        Incluye todos los costos asociados al préstamo.
                    </div>
                    <div className={styles.loanTransparencyItem}>
                        <strong>Comisiones:</strong>
                        <br />
                        • Evaluación: S/ 350.00
                        <br />
                        • Desembolso: 1.5% del monto del préstamo
                    </div>
                    <div className={styles.loanTransparencyItem}>
                        <strong>Seguros:</strong>
                        <br />
                        • Seguro de vida: 0.08% mensual sobre el saldo
                        <br />
                        • Seguro todo riesgo: 0.12% mensual sobre el saldo
                    </div>
                    <div className={styles.loanTransparencyItem}>
                        <strong>Penalidades:</strong>
                        <br />
                        • Cuotas vencidas: 2.95% mensual
                        <br />
                        • Prepago: Sin penalidad después del 6to mes
                    </div>
                    <div className={styles.loanTransparencyImportant}>
                        <strong>Importante:</strong> Los cálculos son referenciales. Las condiciones finales pueden variar.
                        Consulte la tarifa vigente en nuestro sitio web y en la Superintendencia de Banca, Seguros y
                        AFP (www.sbs.gob.pe).
                    </div>
                </div>
            </section>

            {/* Botones de Acción */}
            <div className={styles.loanActionsFooter}>
                <button type="button" className={`${styles.buttonPrimary} ${styles.actionRed}`}>
                    <Download className={styles.buttonIcon} />
                    Descargar PDF
                </button>
                <button type="button" className={`${styles.buttonPrimary} ${styles.actionBlue}`}>
                    <Mail className={styles.buttonIcon} />
                    Enviar por Correo
                </button>
                <button type="button" className={styles.buttonPrimary}>
                    Nueva Simulación
                </button>
            </div>
        </div>
    );
}



