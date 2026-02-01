import { useState } from "react";
import type {
  AtmosphericEmissionsData,
  FixedSourceRecord,
  MobileSourceRecord,
  FugitiveEmissionRecord,
} from "@/types/atmosphericEmissions";

const initialData: AtmosphericEmissionsData = {
  fixedSources: [],
  mobileSources: [],
  fugitiveEmissions: [],
};

// Mock data for reports demo
const mockData: AtmosphericEmissionsData = {
  fixedSources: [
    {
      id: "1",
      equipmentType: "Boiler",
      fuel: "Gas Natural",
      annualConsumption: 15000,
      operatingHours: 4500,
      estimationMethod: "Medición directa",
      co2Emissions: 28.35,
      ch4Emissions: 0.015,
      n2oEmissions: 0.003,
    },
    {
      id: "2",
      equipmentType: "Generador",
      fuel: "Diesel",
      annualConsumption: 8500,
      operatingHours: 2200,
      estimationMethod: "Factor de emisión",
      co2Emissions: 22.78,
      ch4Emissions: 0.102,
      n2oEmissions: 0.017,
    },
    {
      id: "3",
      equipmentType: "Horno",
      fuel: "Gas Natural",
      annualConsumption: 25000,
      operatingHours: 6000,
      estimationMethod: "Balance de Masa",
      co2Emissions: 47.25,
      ch4Emissions: 0.025,
      n2oEmissions: 0.005,
    },
  ],
  mobileSources: [
    {
      id: "1",
      vehicleType: "Camión pesado",
      fuel: "Diesel",
      annualConsumption: 45000,
      calculationMethod: "Basado en combustible",
      ghgEmissions: 120.6,
    },
    {
      id: "2",
      vehicleType: "Vehiculo ligero",
      fuel: "Gasoline",
      annualConsumption: 12000,
      calculationMethod: "Basado en distancia",
      ghgEmissions: 27.72,
    },
    {
      id: "3",
      vehicleType: "Máquina elevadora",
      fuel: "LPG",
      annualConsumption: 3500,
      calculationMethod: "Basado en combustible",
      ghgEmissions: 6.3,
    },
  ],
  fugitiveEmissions: [
    {
      id: "1",
      gasType: "R-134a",
      source: "Refrigeración",
      estimatedQuantity: 25.5,
      methodology: "Balance de masa",
    },
    {
      id: "2",
      gasType: "Metano",
      source: "Válvulas",
      estimatedQuantity: 12.3,
      methodology: "Factor de emision",
    },
    {
      id: "3",
      gasType: "R-410A",
      source: "Refrigeración",
      estimatedQuantity: 8.7,
      methodology: "Estimación de ingeniería",
    },
  ],
};

export function useAtmosphericEmissions() {
  const [data, setData] = useState<AtmosphericEmissionsData>(mockData);

  const setFixedSources = (records: FixedSourceRecord[]) => {
    setData((prev) => ({ ...prev, fixedSources: records }));
  };

  const setMobileSources = (records: MobileSourceRecord[]) => {
    setData((prev) => ({ ...prev, mobileSources: records }));
  };

  const setFugitiveEmissions = (records: FugitiveEmissionRecord[]) => {
    setData((prev) => ({ ...prev, fugitiveEmissions: records }));
  };

  const updateFixedSource = (id: string, updates: Partial<FixedSourceRecord>) => {
    setData((prev) => ({
      ...prev,
      fixedSources: prev.fixedSources.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  };

  const updateMobileSource = (id: string, updates: Partial<MobileSourceRecord>) => {
    setData((prev) => ({
      ...prev,
      mobileSources: prev.mobileSources.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  };

  const updateFugitiveEmission = (id: string, updates: Partial<FugitiveEmissionRecord>) => {
    setData((prev) => ({
      ...prev,
      fugitiveEmissions: prev.fugitiveEmissions.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  };

  const clearData = () => {
    setData(initialData);
  };

  const importData = (newData: AtmosphericEmissionsData) => {
    setData(newData);
  };

  return {
    data,
    setFixedSources,
    setMobileSources,
    setFugitiveEmissions,
    updateFixedSource,
    updateMobileSource,
    updateFugitiveEmission,
    clearData,
    importData,
  };
}
