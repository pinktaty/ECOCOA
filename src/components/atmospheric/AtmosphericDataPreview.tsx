import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FixedSourceRecord,
  MobileSourceRecord,
  FugitiveEmissionRecord,
  AtmosphericEmissionsData,
} from "@/types/atmosphericEmissions";
import { EQUIPMENT_TYPES, FUGITIVE_SOURCES } from "@/types/atmosphericEmissions";

interface AtmosphericDataPreviewProps {
  data: AtmosphericEmissionsData;
  onUpdateFixedSource: (id: string, updates: Partial<FixedSourceRecord>) => void;
  onUpdateMobileSource: (id: string, updates: Partial<MobileSourceRecord>) => void;
  onUpdateFugitiveEmission: (id: string, updates: Partial<FugitiveEmissionRecord>) => void;
  onRemoveFixedSource: (id: string) => void;
  onRemoveMobileSource: (id: string) => void;
  onRemoveFugitiveEmission: (id: string) => void;
}

export function AtmosphericDataPreview({
  data,
  onUpdateFixedSource,
  onUpdateMobileSource,
  onUpdateFugitiveEmission,
  onRemoveFixedSource,
  onRemoveMobileSource,
  onRemoveFugitiveEmission,
}: AtmosphericDataPreviewProps) {
  const [activeTab, setActiveTab] = useState("fixed");

  const hasErrors =
    data.fixedSources.some((r) => r.hasError) ||
    data.mobileSources.some((r) => r.hasError) ||
    data.fugitiveEmissions.some((r) => r.hasError);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            Fixed: {data.fixedSources.length} | Mobile: {data.mobileSources.length} | Fugitive: {data.fugitiveEmissions.length}
          </span>
          {hasErrors && (
            <span className="text-sm text-destructive font-medium">
              ⚠️ Algunos registros tienen errores (Subrayados en rojo)
            </span>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fixed">
            Fixed Sources {data.fixedSources.some((r) => r.hasError) && "⚠️"}
          </TabsTrigger>
          <TabsTrigger value="mobile">
            Mobile Sources {data.mobileSources.some((r) => r.hasError) && "⚠️"}
          </TabsTrigger>
          <TabsTrigger value="fugitive">
            Fugitive Emissions {data.fugitiveEmissions.some((r) => r.hasError) && "⚠️"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="mt-4">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary">
                  <TableHead className="text-primary-foreground font-semibold">Tipo de Equipo</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Combustible</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">Consumo anual</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">Horas operativas</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Metodo de estimacion</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">CO₂ </TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">CH₄ </TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">N₂O </TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.fixedSources.map((record, index) => (
                  <TableRow
                    key={record.id}
                    className={cn(
                      index % 2 === 1 && "bg-muted/50",
                      record.hasError && "bg-destructive/10"
                    )}
                  >
                    <TableCell>
                      <Select
                        value={record.equipmentType}
                        onValueChange={(value) => onUpdateFixedSource(record.id, { equipmentType: value, hasError: false })}
                      >
                        <SelectTrigger className={cn("w-32", record.errorFields?.includes("equipmentType") && "border-destructive")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EQUIPMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={record.fuel}
                        onChange={(e) => onUpdateFixedSource(record.id, { fuel: e.target.value })}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={record.annualConsumption}
                        onChange={(e) => onUpdateFixedSource(record.id, { annualConsumption: parseFloat(e.target.value) || 0, hasError: false })}
                        className={cn("w-28 text-right", record.errorFields?.includes("annualConsumption") && "border-destructive")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={record.operatingHours}
                        onChange={(e) => onUpdateFixedSource(record.id, { operatingHours: parseFloat(e.target.value) || 0, hasError: false })}
                        className={cn("w-24 text-right", record.errorFields?.includes("operatingHours") && "border-destructive")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={record.estimationMethod}
                        onChange={(e) => onUpdateFixedSource(record.id, { estimationMethod: e.target.value })}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={record.co2Emissions}
                        onChange={(e) => onUpdateFixedSource(record.id, { co2Emissions: parseFloat(e.target.value) || 0, hasError: false })}
                        className={cn("w-24 text-right", record.errorFields?.includes("co2Emissions") && "border-destructive")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.001"
                        value={record.ch4Emissions}
                        onChange={(e) => onUpdateFixedSource(record.id, { ch4Emissions: parseFloat(e.target.value) || 0, hasError: false })}
                        className={cn("w-24 text-right", record.errorFields?.includes("ch4Emissions") && "border-destructive")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.001"
                        value={record.n2oEmissions}
                        onChange={(e) => onUpdateFixedSource(record.id, { n2oEmissions: parseFloat(e.target.value) || 0, hasError: false })}
                        className={cn("w-24 text-right", record.errorFields?.includes("n2oEmissions") && "border-destructive")}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => onRemoveFixedSource(record.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="mt-4">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary">
                  <TableHead className="text-primary-foreground font-semibold">Tipo de Vehiculo</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Combustible</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">econsumo anual</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Método de cálculo</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">Emisiones GyGEI</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.mobileSources.map((record, index) => (
                  <TableRow
                    key={record.id}
                    className={cn(
                      index % 2 === 1 && "bg-muted/50",
                      record.hasError && "bg-destructive/10"
                    )}
                  >
                    <TableCell>
                      <Input
                        value={record.vehicleType}
                        onChange={(e) => onUpdateMobileSource(record.id, { vehicleType: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={record.fuel}
                        onChange={(e) => onUpdateMobileSource(record.id, { fuel: e.target.value })}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={record.annualConsumption}
                        onChange={(e) => onUpdateMobileSource(record.id, { annualConsumption: parseFloat(e.target.value) || 0, hasError: false })}
                        className={cn("w-32 text-right", record.errorFields?.includes("annualConsumption") && "border-destructive")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={record.calculationMethod}
                        onChange={(e) => onUpdateMobileSource(record.id, { calculationMethod: e.target.value })}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={record.ghgEmissions}
                        onChange={(e) => onUpdateMobileSource(record.id, { ghgEmissions: parseFloat(e.target.value) || 0, hasError: false })}
                        className={cn("w-28 text-right", record.errorFields?.includes("ghgEmissions") && "border-destructive")}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => onRemoveMobileSource(record.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="fugitive" className="mt-4">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary">
                  <TableHead className="text-primary-foreground font-semibold">Tipo de Gasolina</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Fuente</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">CAntidad estimada</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Metodologia</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.fugitiveEmissions.map((record, index) => (
                  <TableRow
                    key={record.id}
                    className={cn(
                      index % 2 === 1 && "bg-muted/50",
                      record.hasError && "bg-destructive/10"
                    )}
                  >
                    <TableCell>
                      <Input
                        value={record.gasType}
                        onChange={(e) => onUpdateFugitiveEmission(record.id, { gasType: e.target.value })}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={record.source}
                        onValueChange={(value) => onUpdateFugitiveEmission(record.id, { source: value, hasError: false })}
                      >
                        <SelectTrigger className={cn("w-32", record.errorFields?.includes("source") && "border-destructive")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FUGITIVE_SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={record.estimatedQuantity}
                        onChange={(e) => onUpdateFugitiveEmission(record.id, { estimatedQuantity: parseFloat(e.target.value) || 0, hasError: false })}
                        className={cn("w-32 text-right", record.errorFields?.includes("estimatedQuantity") && "border-destructive")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={record.methodology}
                        onChange={(e) => onUpdateFugitiveEmission(record.id, { methodology: e.target.value })}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => onRemoveFugitiveEmission(record.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
