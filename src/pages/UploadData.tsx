import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface ConsumptionRecord {
  id: string;
  date: string;
  sector: string;
  subsector: string;
  activity: string;
  sourceOfEmission: string;
  fuelType: string;
  volumeConsumed: number;
  unit: string;
  co2?: number;
  ch4?: number;
  n2o?: number;
}

const requiredColumns = [
  "Date",
  "Sector",
  "Subsector",
  "Activity",
  "Source of Emission",
  "Fuel Type",
  "Volume Consumed",
  "Unit",
];

// Mock emission factors (these would come from DB)
const emissionFactors: Record<string, { co2: number; ch4: number; n2o: number }> = {
  Gasoline: { co2: 2.31, ch4: 0.0001, n2o: 0.00002 },
  Diesel: { co2: 2.68, ch4: 0.00012, n2o: 0.00002 },
  "Natural Gas": { co2: 1.89, ch4: 0.00001, n2o: 0.00001 },
  Electricity: { co2: 0.42, ch4: 0.00001, n2o: 0.000005 },
};

const UploadData = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const calculateEmissions = (record: Omit<ConsumptionRecord, "co2" | "ch4" | "n2o">) => {
    const factors = emissionFactors[record.fuelType] || { co2: 0, ch4: 0, n2o: 0 };
    return {
      co2: record.volumeConsumed * factors.co2,
      ch4: record.volumeConsumed * factors.ch4,
      n2o: record.volumeConsumed * factors.n2o,
    };
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      if (jsonData.length < 2) {
        setErrors(["File is empty or has no data rows"]);
        setIsProcessing(false);
        return;
      }

      const headers = jsonData[0].map((h) => h?.toString().trim());
      const missingColumns = requiredColumns.filter(
        (col) => !headers.some((h) => h?.toLowerCase() === col.toLowerCase())
      );

      if (missingColumns.length > 0) {
        setErrors([`Missing required columns: ${missingColumns.join(", ")}`]);
        setIsProcessing(false);
        return;
      }

      const columnIndexes: Record<string, number> = {};
      requiredColumns.forEach((col) => {
        const index = headers.findIndex(
          (h) => h?.toLowerCase() === col.toLowerCase()
        );
        columnIndexes[col] = index;
      });

      const newRecords: ConsumptionRecord[] = [];
      const rowErrors: string[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.every((cell) => !cell)) continue;

        const volume = parseFloat(row[columnIndexes["Volume Consumed"]]);
        if (isNaN(volume)) {
          rowErrors.push(`Row ${i + 1}: Invalid volume value`);
          continue;
        }

        const record: Omit<ConsumptionRecord, "co2" | "ch4" | "n2o"> = {
          id: crypto.randomUUID(),
          date: row[columnIndexes["Date"]]?.toString() || "",
          sector: row[columnIndexes["Sector"]]?.toString() || "",
          subsector: row[columnIndexes["Subsector"]]?.toString() || "",
          activity: row[columnIndexes["Activity"]]?.toString() || "",
          sourceOfEmission: row[columnIndexes["Source of Emission"]]?.toString() || "",
          fuelType: row[columnIndexes["Fuel Type"]]?.toString() || "",
          volumeConsumed: volume,
          unit: row[columnIndexes["Unit"]]?.toString() || "",
        };

        const emissions = calculateEmissions(record);
        newRecords.push({ ...record, ...emissions });
      }

      if (rowErrors.length > 0) {
        setErrors(rowErrors.slice(0, 5));
        if (rowErrors.length > 5) {
          setErrors((prev) => [...prev, `...and ${rowErrors.length - 5} more errors`]);
        }
      }

      setRecords(newRecords);
      
      if (newRecords.length > 0) {
        toast({
          title: "File processed successfully",
          description: `${newRecords.length} records imported with emissions calculated`,
        });
      }
    } catch (error) {
      setErrors(["Error analizando el excel. Por favor asegurarse que el documento es un .xlsx o .xls valido."]);
    }

    setIsProcessing(false);
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        processFile(file);
      } else {
        setErrors(["Favor de subir un archivo válido de Excel (.xlsx o .xls)"]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const removeRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = () => {
    setRecords([]);
    setErrors([]);
  };

  const saveToDatabase = () => {
    toast({
      title: "Data saved",
      description: `${records.length} registros guardados en la base de datos`,
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Upload Data</h1>
        <p className="page-description">
          Subir Archivos de excel con datos de consumo para calcular emisiones.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={cn("upload-zone mb-8", isDragging && "upload-zone-active")}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">
          {isProcessing ? "Processing..." : "Drop your Excel file here"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          O click para buscar tus archivos
        </p>
        <p className="text-xs text-muted-foreground">
          Required columns: {requiredColumns.join(", ")}
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Validación de errores</span>
          </div>
          <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Table */}
      {records.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{records.length} registros cargados</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearAll}>
                Clear All
              </Button>
              <Button onClick={saveToDatabase}>
                <Upload className="h-4 w-4 mr-2" />
                Save to Database
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Sector</th>
                  <th>Actividad</th>
                  <th>Tipo de combustible</th>
                  <th>Volumen</th>
                  <th>Unidad</th>
                  <th className="text-right">CO₂ (t)</th>
                  <th className="text-right">CH₄ (kg)</th>
                  <th className="text-right">N₂O (kg)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 10).map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.sector}</td>
                    <td className="max-w-[200px] truncate">{record.activity}</td>
                    <td>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        {record.fuelType}
                      </span>
                    </td>
                    <td>{record.volumeConsumed.toLocaleString()}</td>
                    <td>{record.unit}</td>
                    <td className="text-right font-mono">
                      {record.co2?.toFixed(2)}
                    </td>
                    <td className="text-right font-mono">
                      {((record.ch4 || 0) * 1000).toFixed(3)}
                    </td>
                    <td className="text-right font-mono">
                      {((record.n2o || 0) * 1000).toFixed(4)}
                    </td>
                    <td>
                      <button
                        onClick={() => removeRecord(record.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {records.length > 10 && (
            <div className="border-t px-6 py-3 text-sm text-muted-foreground">
              Mostrando 10 de {records.length} registros
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadData;
