import * as XLSX from "xlsx";
import type {
  AtmosphericEmissionsData,
  FixedSourceRecord,
  MobileSourceRecord,
  FugitiveEmissionRecord,
} from "@/types/atmosphericEmissions";
import {
  normalizeColumnName,
  FIXED_SOURCE_COLUMN_MAP,
  MOBILE_SOURCE_COLUMN_MAP,
  FUGITIVE_EMISSION_COLUMN_MAP,
  EQUIPMENT_TYPES,
  FUGITIVE_SOURCES,
} from "@/types/atmosphericEmissions";

interface ParseResult {
  data: AtmosphericEmissionsData | null;
  errors: string[];
  warnings: string[];
}

const REQUIRED_SHEETS = ["Fixed Sources", "Mobile Sources", "Fugitive Emissions"];

const findSheet = (workbook: XLSX.WorkBook, targetName: string): string | null => {
  const normalizedTarget = targetName.toLowerCase().replace(/\s+/g, "");
  
  for (const sheetName of workbook.SheetNames) {
    const normalizedSheet = sheetName.toLowerCase().replace(/\s+/g, "");
    if (normalizedSheet.includes(normalizedTarget) || normalizedTarget.includes(normalizedSheet)) {
      return sheetName;
    }
  }
  
  // Try partial matches
  const keywords = targetName.toLowerCase().split(" ");
  for (const sheetName of workbook.SheetNames) {
    const lowerSheet = sheetName.toLowerCase();
    if (keywords.every((k) => lowerSheet.includes(k))) {
      return sheetName;
    }
  }
  
  return null;
};

const parseNumericValue = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? null : num;
};

const parseFixedSources = (
  worksheet: XLSX.WorkSheet
): { records: FixedSourceRecord[]; errors: string[] } => {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
  const errors: string[] = [];
  const records: FixedSourceRecord[] = [];

  if (jsonData.length < 2) {
    errors.push("Fixed Sources sheet is empty or has no data rows");
    return { records, errors };
  }

  const headers = jsonData[0].map((h) => normalizeColumnName(String(h || "")));
  
  // Map columns
  const columnIndexes: Record<string, number> = {};
  Object.keys(FIXED_SOURCE_COLUMN_MAP).forEach((normalizedCol) => {
    const index = headers.findIndex((h) => h === normalizedCol || h.includes(normalizedCol));
    if (index !== -1) {
      columnIndexes[normalizedCol] = index;
    }
  });

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.every((cell) => !cell)) continue;

    const errorFields: string[] = [];
    
    const equipmentType = String(row[columnIndexes["equipmenttype"]] || "").trim();
    const fuel = String(row[columnIndexes["fuel"]] || "").trim();
    const annualConsumption = parseNumericValue(row[columnIndexes["annualconsumption"]]);
    const operatingHours = parseNumericValue(row[columnIndexes["operatinghours"]]);
    const estimationMethod = String(row[columnIndexes["estimationmethod"]] || "").trim();
    const co2Emissions = parseNumericValue(row[columnIndexes["co2emissions"]]);
    const ch4Emissions = parseNumericValue(row[columnIndexes["ch4emissions"]]);
    const n2oEmissions = parseNumericValue(row[columnIndexes["n2oemissions"]]);

    // Validate
    if (!EQUIPMENT_TYPES.includes(equipmentType as typeof EQUIPMENT_TYPES[number]) && equipmentType) {
      errorFields.push("equipmentType");
    }
    if (annualConsumption === null) errorFields.push("annualConsumption");
    if (operatingHours === null) errorFields.push("operatingHours");
    if (co2Emissions === null) errorFields.push("co2Emissions");
    if (ch4Emissions === null) errorFields.push("ch4Emissions");
    if (n2oEmissions === null) errorFields.push("n2oEmissions");

    if (errorFields.length > 0) {
      errors.push(`Fixed Sources row ${i + 1}: Invalid values in ${errorFields.join(", ")}`);
    }

    records.push({
      id: crypto.randomUUID(),
      equipmentType: equipmentType || "Other",
      fuel,
      annualConsumption: annualConsumption ?? 0,
      operatingHours: operatingHours ?? 0,
      estimationMethod,
      co2Emissions: co2Emissions ?? 0,
      ch4Emissions: ch4Emissions ?? 0,
      n2oEmissions: n2oEmissions ?? 0,
      hasError: errorFields.length > 0,
      errorFields,
    });
  }

  return { records, errors };
};

const parseMobileSources = (
  worksheet: XLSX.WorkSheet
): { records: MobileSourceRecord[]; errors: string[] } => {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
  const errors: string[] = [];
  const records: MobileSourceRecord[] = [];

  if (jsonData.length < 2) {
    errors.push("Mobile Sources sheet is empty or has no data rows");
    return { records, errors };
  }

  const headers = jsonData[0].map((h) => normalizeColumnName(String(h || "")));
  
  const columnIndexes: Record<string, number> = {};
  Object.keys(MOBILE_SOURCE_COLUMN_MAP).forEach((normalizedCol) => {
    const index = headers.findIndex((h) => h === normalizedCol || h.includes(normalizedCol));
    if (index !== -1) {
      columnIndexes[normalizedCol] = index;
    }
  });

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.every((cell) => !cell)) continue;

    const errorFields: string[] = [];
    
    const vehicleType = String(row[columnIndexes["vehicletype"]] || "").trim();
    const fuel = String(row[columnIndexes["fuel"]] || "").trim();
    const annualConsumption = parseNumericValue(row[columnIndexes["annualconsumption"]]);
    const calculationMethod = String(row[columnIndexes["calculationmethod"]] || "").trim();
    const ghgEmissions = parseNumericValue(row[columnIndexes["ghgemissions"]]);

    if (annualConsumption === null) errorFields.push("annualConsumption");
    if (ghgEmissions === null) errorFields.push("ghgEmissions");

    if (errorFields.length > 0) {
      errors.push(`Mobile Sources row ${i + 1}: Invalid values in ${errorFields.join(", ")}`);
    }

    records.push({
      id: crypto.randomUUID(),
      vehicleType,
      fuel,
      annualConsumption: annualConsumption ?? 0,
      calculationMethod,
      ghgEmissions: ghgEmissions ?? 0,
      hasError: errorFields.length > 0,
      errorFields,
    });
  }

  return { records, errors };
};

const parseFugitiveEmissions = (
  worksheet: XLSX.WorkSheet
): { records: FugitiveEmissionRecord[]; errors: string[] } => {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
  const errors: string[] = [];
  const records: FugitiveEmissionRecord[] = [];

  if (jsonData.length < 2) {
    errors.push("Fugitive Emissions sheet is empty or has no data rows");
    return { records, errors };
  }

  const headers = jsonData[0].map((h) => normalizeColumnName(String(h || "")));
  
  const columnIndexes: Record<string, number> = {};
  Object.keys(FUGITIVE_EMISSION_COLUMN_MAP).forEach((normalizedCol) => {
    const index = headers.findIndex((h) => h === normalizedCol || h.includes(normalizedCol));
    if (index !== -1) {
      columnIndexes[normalizedCol] = index;
    }
  });

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.every((cell) => !cell)) continue;

    const errorFields: string[] = [];
    
    const gasType = String(row[columnIndexes["gastype"]] || "").trim();
    const source = String(row[columnIndexes["source"]] || "").trim();
    const estimatedQuantity = parseNumericValue(row[columnIndexes["estimatedquantity"]]);
    const methodology = String(row[columnIndexes["methodology"]] || "").trim();

    if (!FUGITIVE_SOURCES.includes(source as typeof FUGITIVE_SOURCES[number]) && source) {
      errorFields.push("source");
    }
    if (estimatedQuantity === null) errorFields.push("estimatedQuantity");

    if (errorFields.length > 0) {
      errors.push(`Fugitive Emissions row ${i + 1}: Invalid values in ${errorFields.join(", ")}`);
    }

    records.push({
      id: crypto.randomUUID(),
      gasType,
      source: source || "Other",
      estimatedQuantity: estimatedQuantity ?? 0,
      methodology,
      hasError: errorFields.length > 0,
      errorFields,
    });
  }

  return { records, errors };
};

export const parseAtmosphericEmissionsExcel = async (file: File): Promise<ParseResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // Validate required sheets exist
    const fixedSourcesSheet = findSheet(workbook, "Fixed Sources");
    const mobileSourcesSheet = findSheet(workbook, "Mobile Sources");
    const fugitiveEmissionsSheet = findSheet(workbook, "Fugitive Emissions");

    const missingSheets: string[] = [];
    if (!fixedSourcesSheet) missingSheets.push("Fixed Sources");
    if (!mobileSourcesSheet) missingSheets.push("Mobile Sources");
    if (!fugitiveEmissionsSheet) missingSheets.push("Fugitive Emissions");

    if (missingSheets.length > 0) {
      errors.push(`Missing required sheets: ${missingSheets.join(", ")}`);
      errors.push(`Found sheets: ${workbook.SheetNames.join(", ")}`);
      return { data: null, errors, warnings };
    }

    // Parse each sheet
    const fixedResult = parseFixedSources(workbook.Sheets[fixedSourcesSheet!]);
    const mobileResult = parseMobileSources(workbook.Sheets[mobileSourcesSheet!]);
    const fugitiveResult = parseFugitiveEmissions(workbook.Sheets[fugitiveEmissionsSheet!]);

    errors.push(...fixedResult.errors, ...mobileResult.errors, ...fugitiveResult.errors);

    return {
      data: {
        fixedSources: fixedResult.records,
        mobileSources: mobileResult.records,
        fugitiveEmissions: fugitiveResult.records,
      },
      errors,
      warnings,
    };
  } catch (error) {
    errors.push("Falla al analizar el archivo de excel, por favor asegurarse de que es un archivo valido.");
    return { data: null, errors, warnings };
  }
};
