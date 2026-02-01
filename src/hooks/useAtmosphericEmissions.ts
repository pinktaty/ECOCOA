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
      fuel: "Natural Gas",
      annualConsumption: 15000,
      operatingHours: 4500,
      estimationMethod: "Direct Measurement",
      co2Emissions: 28.35,
      ch4Emissions: 0.015,
      n2oEmissions: 0.003,
    },
    {
      id: "2",
      equipmentType: "Generator",
      fuel: "Diesel",
      annualConsumption: 8500,
      operatingHours: 2200,
      estimationMethod: "Emission Factor",
      co2Emissions: 22.78,
      ch4Emissions: 0.102,
      n2oEmissions: 0.017,
    },
    {
      id: "3",
      equipmentType: "Furnace",
      fuel: "Natural Gas",
      annualConsumption: 25000,
      operatingHours: 6000,
      estimationMethod: "Mass Balance",
      co2Emissions: 47.25,
      ch4Emissions: 0.025,
      n2oEmissions: 0.005,
    },
  ],
  mobileSources: [
    {
      id: "1",
      vehicleType: "Heavy Truck",
      fuel: "Diesel",
      annualConsumption: 45000,
      calculationMethod: "Fuel-based",
      ghgEmissions: 120.6,
    },
    {
      id: "2",
      vehicleType: "Light Vehicle",
      fuel: "Gasoline",
      annualConsumption: 12000,
      calculationMethod: "Distance-based",
      ghgEmissions: 27.72,
    },
    {
      id: "3",
      vehicleType: "Forklift",
      fuel: "LPG",
      annualConsumption: 3500,
      calculationMethod: "Fuel-based",
      ghgEmissions: 6.3,
    },
  ],
  fugitiveEmissions: [
    {
      id: "1",
      gasType: "R-134a",
      source: "Refrigeration",
      estimatedQuantity: 25.5,
      methodology: "Mass Balance",
    },
    {
      id: "2",
      gasType: "Methane",
      source: "Valves",
      estimatedQuantity: 12.3,
      methodology: "Emission Factor",
    },
    {
      id: "3",
      gasType: "R-410A",
      source: "Refrigeration",
      estimatedQuantity: 8.7,
      methodology: "Engineering Estimate",
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
