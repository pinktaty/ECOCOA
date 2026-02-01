import { createContext, useContext, useState, ReactNode } from "react";
import type { AtmosphericEmissionsData } from "@/types/atmosphericEmissions";

interface AtmosphericDataContextType {
    savedData: AtmosphericEmissionsData | null;
    setSavedData: (data: AtmosphericEmissionsData | null) => void;
}

const AtmosphericDataContext = createContext<AtmosphericDataContextType | undefined>(undefined);

export const AtmosphericDataProvider = ({ children }: { children: ReactNode }) => {
    const [savedData, setSavedData] = useState<AtmosphericEmissionsData | null>(null);

    return (
        <AtmosphericDataContext.Provider value={{ savedData, setSavedData }}>
            {children}
        </AtmosphericDataContext.Provider>
    );
};

export const useAtmosphericData = () => {
    const context = useContext(AtmosphericDataContext);
    if (context === undefined) {
        throw new Error("useAtmosphericData must be used within an AtmosphericDataProvider");
    }
    return context;
};