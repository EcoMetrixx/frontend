import type { PropertyDto } from "@/features/properties/services/propertiesApi";

export type BonusProgram = "MiVivienda" | "Techo Propio";

export interface BonusEligibility {
  eligible: boolean;
  program: BonusProgram | null;
  reason: string;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function evaluateBonusEligibility(
  client: { [key: string]: any },
  property?: PropertyDto | null
): BonusEligibility {
  const firstHome =
    client.firstHome === undefined ? true : Boolean(client.firstHome);

  const familyIncome = toNumber(
    client.familyIncome ?? client.income ?? client.monthlyIncome
  );

  const price =
    property && (property as any).price !== undefined
      ? toNumber((property as any).price)
      : 0;

  if (!firstHome) {
    return {
      eligible: false,
      program: null,
      reason: "El cliente no declara compra de primera vivienda.",
    };
  }

  if (familyIncome <= 0) {
    return {
      eligible: false,
      program: null,
      reason: "No se ha registrado el ingreso familiar mensual del cliente.",
    };
  }

  if (!price || price <= 0) {
    if (familyIncome <= 3715) {
      return {
        eligible: true,
        program: "Techo Propio",
        reason:
          "Ingreso familiar dentro del rango de Techo Propio. Falta confirmar con el valor de la vivienda.",
      };
    }

    if (familyIncome >= 1000 && familyIncome <= 12500) {
      return {
        eligible: true,
        program: "MiVivienda",
        reason:
          "Ingreso familiar dentro del rango de MiVivienda. Falta confirmar con el valor de la vivienda.",
      };
    }

    return {
      eligible: false,
      program: null,
      reason:
        "Ingreso familiar fuera de los rangos de MiVivienda y Techo Propio con la información actual.",
    };
  }

  const techoPropioIncomeOk = familyIncome <= 3715;
  const techoPropioPriceOk = price <= 136000;

  if (techoPropioIncomeOk && techoPropioPriceOk) {
    return {
      eligible: true,
      program: "Techo Propio",
      reason:
        "Cumple con el rango de ingresos y valor de vivienda para Techo Propio.",
    };
  }

  const miViviendaIncomeOk =
    familyIncome >= 1000 && familyIncome <= 12500;
  const miViviendaPriceOk = price >= 68800 && price <= 362100;

  if (miViviendaIncomeOk && miViviendaPriceOk) {
    return {
      eligible: true,
      program: "MiVivienda",
      reason:
        "Cumple con el rango de ingresos y valor de vivienda para MiVivienda.",
    };
  }

  return {
    eligible: false,
    program: null,
    reason:
      "No cumple simultáneamente con las condiciones de ingreso y valor de la vivienda para los bonos evaluados.",
  };
}
