import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { parseAtmosphericEmissionsExcel } from "@/utils/atmosphericEmissionsParser";
import { AtmosphericDataPreview } from "@/components/atmospheric/AtmosphericDataPreview";
import { useAtmosphericData } from "@/contexts/AtmosphericDataContext.tsx";
import type { AtmosphericEmissionsData, FixedSourceRecord, MobileSourceRecord, FugitiveEmissionRecord } from "@/types/atmosphericEmissions";

const UploadAtmospheric = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [data, setData] = useState<AtmosphericEmissionsData | null>(null);
  const { toast } = useToast();
  const { setSavedData } = useAtmosphericData();

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setErrors([]);
    setData(null);

    const result = await parseAtmosphericEmissionsExcel(file);

    if (result.errors.length > 0) {
      setErrors(result.errors.slice(0, 10));
      if (result.errors.length > 10) {
        setErrors((prev) => [...prev, `...and ${result.errors.length - 10} more errors`]);
      }
    }

    if (result.data) {
      setData(result.data);
      toast({
        title: "Archivo procesado",
        description: `Loaded ${result.data.fixedSources.length} fixed sources, ${result.data.mobileSources.length} mobile sources, ${result.data.fugitiveEmissions.length} fugitive emissions`,
      });
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
          setErrors(["Favor de subir un archivo Excel válido (.xlsx o .xls)"]);
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

  const handleUpdateFixedSource = (id: string, updates: Partial<FixedSourceRecord>) => {
    if (!data) return;
    setData({
      ...data,
      fixedSources: data.fixedSources.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });
  };

  const handleUpdateMobileSource = (id: string, updates: Partial<MobileSourceRecord>) => {
    if (!data) return;
    setData({
      ...data,
      mobileSources: data.mobileSources.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });
  };

  const handleUpdateFugitiveEmission = (id: string, updates: Partial<FugitiveEmissionRecord>) => {
    if (!data) return;
    setData({
      ...data,
      fugitiveEmissions: data.fugitiveEmissions.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });
  };

  const handleRemoveFixedSource = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      fixedSources: data.fixedSources.filter((r) => r.id !== id),
    });
  };

  const handleRemoveMobileSource = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      mobileSources: data.mobileSources.filter((r) => r.id !== id),
    });
  };

  const handleRemoveFugitiveEmission = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      fugitiveEmissions: data.fugitiveEmissions.filter((r) => r.id !== id),
    });
  };

  const hasErrors = data && (
      data.fixedSources.some((r) => r.hasError) ||
      data.mobileSources.some((r) => r.hasError) ||
      data.fugitiveEmissions.some((r) => r.hasError)
  );

  const clearAll = () => {
    setData(null);
    setErrors([]);
  };

  // Guarda los datos en el contexto global
  const saveData = () => {
    if (hasErrors) {
      toast({
        title: "Cannot save",
        description: "Please fix all errors before saving",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setSavedData(data);
      toast({
        title: "Data saved",
        description: "Atmospheric emissions data saved to database",
      });
    }
  };

  return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Subir emisiones atmósfericas</h1>
          <p className="page-description">
            Subir archivos de Excel con RENE Sección II Datos de emisiones atmosféricas (Fuentes Fijas, Fuentes móviles, Fuentes Fugitivas)
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
            onClick={() => document.getElementById("atmospheric-file-input")?.click()}
        >
          <input
              id="atmospheric-file-input"
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
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Required sheets:</p>
            <p>• Fuentes Fijas (Tipo de equipo, Combustible, Consumo Anual, Horas Operativas, etc.)</p>
            <p>• Fuentes Móviles (Tipo de Vehículo, Combustible, Consumo Anual, Método para Calcular, Emisiones GyGEI)</p>
            <p>• Emisiones fugitivas (Tipo de gasolina, Fuente, Cantidad Estimada, Metodologia)</p>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Errores de validación</span>
              </div>
              <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1">
                {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
        )}

        {/* Data Preview */}
        {data && (
            <div className="card-elevated overflow-hidden">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Datos cargados - Revisar y editar antes de entregar</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={clearAll}>
                    Clear All
                  </Button>
                  <Button onClick={saveData} disabled={hasErrors}>
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Save to Database
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <AtmosphericDataPreview
                    data={data}
                    onUpdateFixedSource={handleUpdateFixedSource}
                    onUpdateMobileSource={handleUpdateMobileSource}
                    onUpdateFugitiveEmission={handleUpdateFugitiveEmission}
                    onRemoveFixedSource={handleRemoveFixedSource}
                    onRemoveMobileSource={handleRemoveMobileSource}
                    onRemoveFugitiveEmission={handleRemoveFugitiveEmission}
                />
              </div>
            </div>
        )}
      </div>
  );
};

export default UploadAtmospheric;