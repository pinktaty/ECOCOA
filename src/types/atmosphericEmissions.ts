// Types for Atmospheric Emissions (RENE Section II)

export interface FixedSourceRecord {
  id: string;
  equipmentType: string;
  fuel: string;
  annualConsumption: number;
  operatingHours: number;
  estimationMethod: string;
  co2Emissions: number;
  ch4Emissions: number;
  n2oEmissions: number;
  hasError?: boolean;
  errorFields?: string[];
}

export interface MobileSourceRecord {
  id: string;
  vehicleType: string;
  fuel: string;
  annualConsumption: number;
  calculationMethod: string;
  ghgEmissions: number;
  hasError?: boolean;
  errorFields?: string[];
}

export interface FugitiveEmissionRecord {
  id: string;
  gasType: string;
  source: string;
  estimatedQuantity: number;
  methodology: string;
  hasError?: boolean;
  errorFields?: string[];
}

export interface AtmosphericEmissionsData {
  fixedSources: FixedSourceRecord[];
  mobileSources: MobileSourceRecord[];
  fugitiveEmissions: FugitiveEmissionRecord[];
}

// Allowed values
export const EQUIPMENT_TYPES = [
  "Boiler",
  "Furnace",
  "Generator",
  "Incinerator",
  "Heater",
  "Other",
] as const;

export const FUGITIVE_SOURCES = [
  "Valves",
  "Tanks",
  "Refrigeration",
  "Pipes",
  "Other",
] as const;

// Required columns for each sheet
export const FIXED_SOURCE_COLUMNS = [
  "Equipment Type",
  "Fuel",
  "Annual Consumption",
  "Operating Hours",
  "Estimation Method",
  "CO₂ Emissions",
  "CH₄ Emissions",
  "N₂O Emissions",
] as const;

export const MOBILE_SOURCE_COLUMNS = [
  "Vehicle Type",
  "Fuel",
  "Annual Consumption",
  "Calculation Method",
  "GHG Emissions",
] as const;

export const FUGITIVE_EMISSION_COLUMNS = [
  "Gas Type",
  "Source",
  "Estimated Quantity",
  "Methodology",
] as const;

// Column mapping helpers
export const normalizeColumnName = (name: string): string => {
  return name.toLowerCase().replace(/[\s_-]+/g, "").replace(/[₂₄]/g, (match) => {
    return match === "₂" ? "2" : "4";
  });
};

export const FIXED_SOURCE_COLUMN_MAP: Record<string, keyof FixedSourceRecord> = {
  equipmenttype: "equipmentType",
  fuel: "fuel",
  annualconsumption: "annualConsumption",
  operatinghours: "operatingHours",
  estimationmethod: "estimationMethod",
  co2emissions: "co2Emissions",
  ch4emissions: "ch4Emissions",
  n2oemissions: "n2oEmissions",
};

export const MOBILE_SOURCE_COLUMN_MAP: Record<string, keyof MobileSourceRecord> = {
  vehicletype: "vehicleType",
  fuel: "fuel",
  annualconsumption: "annualConsumption",
  calculationmethod: "calculationMethod",
  ghgemissions: "ghgEmissions",
};

export const FUGITIVE_EMISSION_COLUMN_MAP: Record<string, keyof FugitiveEmissionRecord> = {
  gastype: "gasType",
  source: "source",
  estimatedquantity: "estimatedQuantity",
  methodology: "methodology",
};
