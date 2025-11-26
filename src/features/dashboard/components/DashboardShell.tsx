"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Image from "next/image";
import { ClientRegistrationForm } from "@/features/clients/components/ClientRegistrationForm";
import { LoanResultsDashboard } from "@/features/reports/components/LoanResultsDashboard";
import type { AuthUser } from "@/core/providers/AuthProvider";
import { clientStorage, type Client } from "@/features/clients/services/clientStorage";
import iconImage from "@/app/icon.png";
import styles from "@/styles/dashboard.module.css";

type NavSection = "clients" | "projects" | "simulations" | "reports";

interface DashboardShellProps {
    user: AuthUser;
    onLogout: () => void;
}

const navItems = [
    { icon: FileText, label: "Clientes", key: "clients" as NavSection },
    { icon: Building2, label: "Proyectos / Viviendas", key: "projects" as NavSection },
    { icon: LayoutDashboard, label: "Simulaciones", key: "simulations" as NavSection },
    { icon: FileBarChart, label: "Reportes", key: "reports" as NavSection },
];

const filterFields = [
    { label: "Bono", placeholder: "Todos los bonos" },
    { label: "Banco", placeholder: "Todos los bancos" },
    { label: "Estado del Crédito", placeholder: "Todos los estados" },
    { label: "Asesor Asignado", placeholder: "Todos los asesores" },
];

export function DashboardShell({ user, onLogout }: DashboardShellProps) {
    const [showActiveClientBanner, setShowActiveClientBanner] = useState(true);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeNav, setActiveNav] = useState<NavSection>("clients");
    const [simulationTab, setSimulationTab] = useState<"base" | "conditions" | "advanced">("base");
    const itemsPerPage = 3;
    const totalResults = clients.length;
    const totalPages = Math.ceil(totalResults / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentClients = clients.slice(startIndex, endIndex);

    const housingFilters = [
        { label: "Bono Aplicable", placeholder: "MiVivienda" },
        { label: "Rango de Precios", placeholder: "S/ 80,000 - S/ 120,000" },
        { label: "Banco", placeholder: "BCP" },
        { label: "Ubicación", placeholder: "Lima Norte" },
        { label: "Estado", placeholder: "Disponible" },
        { label: "Ordenar por", placeholder: "Precio (menor a mayor)" },
    ];

    const housingActiveFilters = ["MiVivienda", "S/ 80K - S/ 120K"];

    const housingProjects = [
        {
            id: "1",
            title: "Residencial Los Jardines",
            type: "Vivienda Social",
            location: "San Juan de Lurigancho",
            financing: "BCP, Interbank",
            price: "S/ 95,000",
            van: "S/ 12,500",
            tir: "18.9%",
            compatibility: "Compatible con MiVivienda",
            availability: "DISPONIBLE",
            availabilityVariant: "blue",
            actionLabel: "Seleccionar",
            actionDisabled: false,
            image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=60",
        },
        {
            id: "2",
            title: "Condominio Vista Alegre",
            type: "Vivienda Social",
            location: "Villa El Salvador",
            financing: "BBVA, Scotiabank",
            price: "S/ 110,000",
            van: "S/ 15,200",
            tir: "19.2%",
            compatibility: "Compatible con MiVivienda",
            availability: "DISPONIBLE",
            availabilityVariant: "blue",
            actionLabel: "Seleccionar",
            actionDisabled: false,
            image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=60",
        },
        {
            id: "3",
            title: "Proyecto Nuevo Horizonte",
            type: "Vivienda Comercial",
            location: "Los Olivos",
            financing: "Financiamiento Propio",
            price: "S/ 185,000",
            van: "S/ 28,500",
            tir: "22.1%",
            compatibility: "Solo financiamiento interno",
            availability: "RESERVADO",
            availabilityVariant: "orange",
            actionLabel: "No Disponible",
            actionDisabled: true,
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60",
        },
        {
            id: "4",
            title: "Residencial San Martín",
            type: "Vivienda Social",
            location: "Ate Vitarte",
            financing: "BCP, BBVA, Interbank",
            price: "S/ 88,500",
            van: "S/ 11,200",
            tir: "17.8%",
            compatibility: "Compatible con MiVivienda",
            availability: "DISPONIBLE",
            availabilityVariant: "blue",
            actionLabel: "Seleccionar",
            actionDisabled: false,
            image: "https://images.unsplash.com/photo-1459535653751-d571815e906b?auto=format&fit=crop&w=800&q=60",
        },
    ];

    const simulationFields = [
        { label: "Monto Total del Préstamo", value: "S/ 250,000.00", helper: "Calculado automáticamente" },
        { label: "Aporte Inicial", value: "S/ 50,000.00" },
        { label: "Bono Aplicable", value: "Bono Buen Pagador - 3%", type: "select" },
        { label: "Monto Bono", value: "S/ 7,500.00" },
    ];

    const simulationSummary = [
        { label: "Monto Financiado", value: "S/ 200,000.00" },
        { label: "Cuota Mensual", value: "S/ 1,687.50" },
        { label: "Total de Intereses", value: "S/ 103,500.00" },
        { label: "TCEA", value: "9.25%", highlight: true },
        { label: "Total a Pagar", value: "S/ 303,500.00", emphasis: true },
    ];

    const simulationIndicators = [
        { label: "VAN", value: "S/ 15,250.00", description: "Valor presente neto positivo" },
        { label: "TIR", value: "12.35%", description: "Tasa interna de retorno" },
    ];

    const simulationTabs = [
        { key: "base" as const, label: "Datos Base" },
        { key: "conditions" as const, label: "Condiciones" },
        { key: "advanced" as const, label: "Avanzadas" },
    ];

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        if (activeNav !== "clients") {
            setShowRegistrationForm(false);
        }
    }, [activeNav]);

    const loadClients = () => {
        const storedClients = clientStorage.getAll();
        setClients(storedClients);
    };

    const handleClientRegistered = () => {
        loadClients();
        setShowRegistrationForm(false);
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
                return styles.badgeGrey;
            default:
                return styles.badgeGrey;
        }
    };

    if (showRegistrationForm && activeNav === "clients") {
        return <ClientRegistrationForm onClose={handleClientRegistered} />;
    }

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

    const renderClientsSection = () => (
        <>
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <p className={styles.cardTitle}>Filtros</p>
                    </div>
                    <div className={styles.cardActions}>
                        <button type="button" className={styles.buttonSecondary}>
                            <RotateCcw className={styles.buttonIcon} />
                            Limpiar
                        </button>
                        <button type="button" className={styles.buttonPrimary}>
                            <Search className={styles.buttonIcon} />
                            Aplicar Filtros
                        </button>
                    </div>
                </div>

                <div className={styles.filterGrid}>
                    {filterFields.map((field) => (
                        <div key={field.label} className={styles.filterField}>
                            <label className={styles.filterLabel}>{field.label}</label>
                            <select className={styles.filterSelect}>
                                <option>{field.placeholder}</option>
                            </select>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Clientes Registrados</h2>
                </div>

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
                            {currentClients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={styles.tableCell} style={{ textAlign: "center", padding: "3rem" }}>
                                        <p className="text-slate-500">No hay clientes registrados aún</p>
                                        <p className="text-sm text-slate-400 mt-2">Haz clic en "Registrar Cliente" para comenzar</p>
                                    </td>
                                </tr>
                            ) : (
                                currentClients.map((client) => (
                                    <tr key={client.id} className={styles.tableRow}>
                                        <td className={styles.tableCell}>
                                            <div className={styles.clientCell}>
                                                <div className={styles.clientAvatar}>{getClientInitials(client.personal.firstName, client.personal.lastName)}</div>
                                                <div className={styles.clientInfo}>
                                                    <p className={styles.clientName}>
                                                        {client.personal.firstName} {client.personal.lastName}
                                                    </p>
                                                    <p className={styles.clientEmail}>{client.personal.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>{client.personal.dni}</td>
                                        <td className={styles.tableCell}>
                                            <span className={`${styles.badge} ${getBadgeClass(getBonusBadge(client.bonus))}`}>{client.bonus || "Ninguno"}</span>
                                        </td>
                                        <td className={styles.tableCell}>-</td>
                                        <td className={styles.tableCell}>
                                            <span className={`${styles.badge} ${getBadgeClass("yellow")}`}>{client.creditStatus || "En Proceso"}</span>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <div className={styles.actionButtons}>
                                                <button type="button" className={styles.actionButton} aria-label="Ver cliente">
                                                    <Eye className={styles.actionButtonIcon} />
                                                </button>
                                                <button type="button" className={styles.actionButton} aria-label="Editar cliente">
                                                    <Edit className={styles.actionButtonIcon} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.actionButton}
                                                    aria-label="Eliminar cliente"
                                                    onClick={() => {
                                                        clientStorage.delete(client.id);
                                                        loadClients();
                                                    }}
                                                >
                                                    <Trash2 className={styles.actionButtonIcon} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>{totalResults === 0 ? "No hay resultados" : `Mostrando ${startIndex + 1} a ${Math.min(endIndex, totalResults)} de ${totalResults} resultados`}</div>
                    {totalPages > 0 && (
                        <div className={styles.paginationControls}>
                            <button
                                type="button"
                                className={styles.paginationButton}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        type="button"
                                        className={`${styles.paginationButton} ${currentPage === page ? styles.paginationButtonActive : ""}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                className={styles.paginationButton}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );

    const renderHousingSection = () => (
        <section className={styles.card}>
            <div className={styles.housingHeader}>
                <div>
                    <p className={styles.housingHeadline}>Cliente: María González</p>
                    <p className={styles.housingSubheadline}>
                        Bono activo: <span className={styles.housingBadgeHighlight}>MiVivienda</span>
                    </p>
                </div>
                <div className={styles.housingSummary}>
                    <div>
                        <p className={styles.housingSummaryLabel}>Viviendas encontradas</p>
                        <p className={styles.housingSummaryValue}>24</p>
                    </div>
                    <button type="button" className={styles.buttonSecondary}>
                        <Filter className={styles.buttonIcon} />
                        Limpiar filtros
                    </button>
                </div>
            </div>

            <div className={styles.housingFiltersGrid}>
                {housingFilters.map((field) => (
                    <div key={field.label} className={styles.filterField}>
                        <label className={styles.filterLabel}>{field.label}</label>
                        <select className={styles.filterSelect}>
                            <option>{field.placeholder}</option>
                        </select>
                    </div>
                ))}
            </div>

            <div className={styles.housingChips}>
                {housingActiveFilters.map((chip) => (
                    <span key={chip} className={styles.housingChip}>
                        {chip}
                    </span>
                ))}
                <button type="button" className={styles.housingChipReset}>
                    Limpiar filtros
                </button>
            </div>

            <div className={styles.housingCardsGrid}>
                {housingProjects.map((project) => (
                    <article key={project.id} className={styles.housingCard}>
                        <div className={styles.housingCardImageWrapper}>
                            <img src={project.image} alt={project.title} className={styles.housingCardImage} />
                            <div className={styles.housingCardBadges}>
                                <span className={`${styles.housingBadge} ${styles.housingBadgeGreen}`}>{project.compatibility}</span>
                                <span
                                    className={`${styles.housingBadge} ${project.availabilityVariant === "blue"
                                        ? styles.housingBadgeBlue
                                        : project.availabilityVariant === "orange"
                                            ? styles.housingBadgeOrange
                                            : styles.housingBadgeGrey
                                        }`}
                                >
                                    {project.availability}
                                </span>
                            </div>
                        </div>

                        <div className={styles.housingCardBody}>
                            <div>
                                <h3 className={styles.housingCardTitle}>{project.title}</h3>
                                <p className={styles.housingCardMeta}>{project.type}</p>
                            </div>
                            <div className={styles.housingCardInfo}>
                                <p>
                                    <MapPin className={styles.housingCardIcon} />
                                    {project.location}
                                </p>
                                <p>
                                    <Banknote className={styles.housingCardIcon} />
                                    {project.financing}
                                </p>
                            </div>
                            <div className={styles.housingCardFooter}>
                                <div className={styles.housingPriceBlock}>
                                    <p className={styles.housingCardPrice}>{project.price}</p>
                                    <p className={styles.housingCardMeta}>Precio total</p>
                                </div>
                                <div className={styles.housingMetrics}>
                                    <p>
                                        VAN: <strong>{project.van}</strong>
                                    </p>
                                    <p>
                                        TIR: <strong>{project.tir}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.housingCardActions}>
                            <button type="button" className={styles.buttonPrimary} disabled={project.actionDisabled}>
                                {project.actionLabel}
                            </button>
                            <button type="button" className={styles.buttonSecondary}>
                                <Search className={styles.buttonIcon} />
                                Ver detalle
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );

    const renderSimulationSection = () => (
        <section className={styles.simulationLayout}>
            <div className={styles.simulationLeft}>
                <div className={styles.simulationCard}>
                    <div className={styles.simulationHeader}>
                        <div className={styles.simulationTitleGroup}>
                            <p className={styles.simulationHeadline}>Simulación del Crédito</p>
                            <p className={styles.simulationSubheadline}>Configure los parámetros financieros para generar el cronograma</p>
                        </div>
                        <div className={styles.simulationTabs}>
                            {simulationTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`${styles.simulationTab} ${simulationTab === tab.key ? styles.simulationTabActive : ""}`}
                                    onClick={() => setSimulationTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.simulationFields}>
                        {simulationFields.map((field) => (
                            <div key={field.label} className={styles.simulationField}>
                                <label className={styles.simulationFieldLabel}>{field.label}</label>
                                {field.type === "select" ? (
                                    <select className={styles.simulationFieldSelect} defaultValue={field.value} disabled>
                                        <option>{field.value}</option>
                                    </select>
                                ) : (
                                    <input className={styles.simulationFieldInput} value={field.value} readOnly />
                                )}
                                {field.helper ? <small className={styles.simulationFieldHelper}>{field.helper}</small> : null}
                            </div>
                        ))}
                        <div className={styles.simulationBadge}>
                            <CheckCircle2 className={styles.simulationBadgeIcon} />
                            Cliente califica para este bono
                        </div>
                    </div>

                    <div className={styles.simulationActions}>
                        <button type="button" className={`${styles.buttonPrimary} ${styles.actionBlue}`}>
                            Calcular Crédito
                        </button>
                        <button type="button" className={`${styles.buttonPrimary} ${styles.actionGreen}`}>
                            Ver Cronograma
                        </button>
                        <button type="button" className={`${styles.buttonPrimary} ${styles.actionPurple}`}>
                            Guardar Simulación
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.simulationRight}>
                <div className={styles.simulationSummaryCard}>
                    <p className={styles.simulationSectionTitle}>Resumen del Préstamo</p>
                    <div className={styles.simulationSummaryList}>
                        {simulationSummary.map((item) => (
                            <div key={item.label} className={`${styles.simulationSummaryItem} ${item.emphasis ? styles.summaryEmphasis : ""}`}>
                                <span>{item.label}</span>
                                <strong className={item.highlight ? styles.summaryHighlight : ""}>{item.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.simulationIndicatorsCard}>
                    <p className={styles.simulationSectionTitle}>Indicadores</p>
                    <div className={styles.simulationIndicatorList}>
                        {simulationIndicators.map((indicator) => (
                            <div key={indicator.label} className={styles.simulationIndicator}>
                                <div>
                                    <p className={styles.simulationIndicatorLabel}>{indicator.label}</p>
                                    <p className={styles.simulationIndicatorDescription}>{indicator.description}</p>
                                </div>
                                <strong>{indicator.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.simulationExportCard}>
                    <p className={styles.simulationSectionTitle}>Exportar</p>
                    <div className={styles.simulationExportActions}>
                        <button type="button" className={styles.simulationExportButton}>
                            <Download className={styles.simulationExportIcon} />
                            Exportar PDF
                        </button>
                        <button type="button" className={`${styles.simulationExportButton} ${styles.simulationExportButtonSecondary}`}>
                            <Download className={styles.simulationExportIcon} />
                            Exportar Excel
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );

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
                            className={`${styles.navItem} ${activeNav === item.key ? styles.navItemActive : ""}`}
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
                    </div>
                </header>

                <div className={styles.contentArea}>
                    <div className={styles.contentGrid}>
                        {activeNav === "clients" && showActiveClientBanner && (
                            <div className={styles.activeClientBanner}>
                                <div className={styles.activeClientBannerContent}>
                                    <div className={styles.activeClientBannerIcon} />
                                    <span>
                                        Cliente activo: José Pérez (DNI 12345678) - Aplica: MiVivienda
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
                                {activeNav === "projects" ? "Selección de Vivienda" : "Dashboard Principal"}
                            </h1>
                            {activeNav === "clients" && (
                                <button
                                    type="button"
                                    className={styles.registerClientButton}
                                    onClick={() => setShowRegistrationForm(!showRegistrationForm)}
                                >
                                    <Plus className={styles.registerClientButtonIcon} />
                                    Registrar Cliente
                                </button>
                            )}
                        </div>

                        {activeNav === "clients" ? renderClientsSection() : null}
                        {activeNav === "projects" ? renderHousingSection() : null}
                        {activeNav === "simulations" ? renderSimulationSection() : null}
                        {activeNav === "reports" ? <LoanResultsDashboard /> : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

