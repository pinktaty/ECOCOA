import { useState, useMemo } from "react";
import { Download, FileText, FileSpreadsheet, AlertCircle, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAtmosphericEmissions } from "@/hooks/useAtmosphericEmissions";
import { exportAtmosphericToPDF, exportAtmosphericToExcel, exportAtmosphericToWord } from "@/utils/atmosphericExports";
import { AIConsultant } from "@/components/atmospheric/AIConsultant";
import type { FixedSourceRecord, MobileSourceRecord, FugitiveEmissionRecord } from "@/types/atmosphericEmissions";
import { EQUIPMENT_TYPES, FUGITIVE_SOURCES } from "@/types/atmosphericEmissions";
import {AtmosphericDataProvider} from "@/contexts/AtmosphericDataContext.tsx";

type SortField = string;
type SortDirection = "asc" | "desc";

const AtmosphericReports = () => {
  const { data } = useAtmosphericEmissions();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fixed");
  
  // Filters
  const [fixedFilter, setFixedFilter] = useState<string>("all");
  const [mobileFilter, setMobileFilter] = useState<string>("");
  const [fugitiveFilter, setFugitiveFilter] = useState<string>("all");
  
  // Sorting
  const [fixedSort, setFixedSort] = useState<{ field: SortField; direction: SortDirection }>({ field: "", direction: "asc" });
  const [mobileSort, setMobileSort] = useState<{ field: SortField; direction: SortDirection }>({ field: "", direction: "asc" });
  const [fugitiveSort, setFugitiveSort] = useState<{ field: SortField; direction: SortDirection }>({ field: "", direction: "asc" });

  // Filtered and sorted data
  const filteredFixedSources = useMemo(() => {
    let filtered = data.fixedSources;
    if (fixedFilter && fixedFilter !== "all") {
      filtered = filtered.filter((r) => r.equipmentType === fixedFilter);
    }
    if (fixedSort.field) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[fixedSort.field as keyof FixedSourceRecord];
        const bVal = b[fixedSort.field as keyof FixedSourceRecord];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return fixedSort.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return fixedSort.direction === "asc" 
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return filtered;
  }, [data.fixedSources, fixedFilter, fixedSort]);

  const filteredMobileSources = useMemo(() => {
    let filtered = data.mobileSources;
    if (mobileFilter) {
      filtered = filtered.filter((r) => 
        r.vehicleType.toLowerCase().includes(mobileFilter.toLowerCase())
      );
    }
    if (mobileSort.field) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[mobileSort.field as keyof MobileSourceRecord];
        const bVal = b[mobileSort.field as keyof MobileSourceRecord];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return mobileSort.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return mobileSort.direction === "asc" 
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return filtered;
  }, [data.mobileSources, mobileFilter, mobileSort]);

  const filteredFugitiveEmissions = useMemo(() => {
    let filtered = data.fugitiveEmissions;
    if (fugitiveFilter && fugitiveFilter !== "all") {
      filtered = filtered.filter((r) => r.source === fugitiveFilter);
    }
    if (fugitiveSort.field) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[fugitiveSort.field as keyof FugitiveEmissionRecord];
        const bVal = b[fugitiveSort.field as keyof FugitiveEmissionRecord];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return fugitiveSort.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return fugitiveSort.direction === "asc" 
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return filtered;
  }, [data.fugitiveEmissions, fugitiveFilter, fugitiveSort]);

  // Totals
  const fixedTotals = useMemo(() => ({
    co2: filteredFixedSources.reduce((sum, r) => sum + r.co2Emissions, 0),
    ch4: filteredFixedSources.reduce((sum, r) => sum + r.ch4Emissions, 0),
    n2o: filteredFixedSources.reduce((sum, r) => sum + r.n2oEmissions, 0),
  }), [filteredFixedSources]);

  const mobileTotals = useMemo(() => ({
    ghg: filteredMobileSources.reduce((sum, r) => sum + r.ghgEmissions, 0),
  }), [filteredMobileSources]);

  const fugitiveTotals = useMemo(() => ({
    quantity: filteredFugitiveEmissions.reduce((sum, r) => sum + r.estimatedQuantity, 0),
  }), [filteredFugitiveEmissions]);

  const toggleSort = (currentSort: { field: SortField; direction: SortDirection }, field: string) => {
    if (currentSort.field === field) {
      return { field, direction: currentSort.direction === "asc" ? "desc" as const : "asc" as const };
    }
    return { field, direction: "asc" as const };
  };

  const SortableHeader = ({ field, label, sortState, onSort }: { 
    field: string; 
    label: string; 
    sortState: { field: SortField; direction: SortDirection };
    onSort: (field: string) => void;
  }) => (
    <TableHead 
      className="text-primary-foreground font-semibold cursor-pointer hover:bg-primary/80 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("h-3 w-3", sortState.field === field && "text-accent")} />
      </div>
    </TableHead>
  );

  const handleExportPDF = () => {
    exportAtmosphericToPDF(data);
    toast({ title: "PDF Downloaded", description: "Atmospheric emissions report exported to PDF" });
  };

  const handleExportExcel = () => {
    exportAtmosphericToExcel(data);
    toast({ title: "Excel Downloaded", description: "Atmospheric emissions report exported to Excel" });
  };

  const handleExportWord = () => {
    exportAtmosphericToWord(data);
    toast({ title: "Word Downloaded", description: "Atmospheric emissions report exported to Word" });
  };

  const hasNoData = 
    data.fixedSources.length === 0 && 
    data.mobileSources.length === 0 && 
    data.fugitiveEmissions.length === 0;

  if (hasNoData) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Informes de emisiones atmosféricas</h1>
          <p className="page-description">
              Sección II de la RENE - Fuentes fijas, fuentes móviles y emisiones fugitivas
          </p>
        </div>
        
        <div className="card-elevated p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Cargar datos de emisiones atmosféricas para generar informes
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/upload-atmospheric"}>
            Upload Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Informes de emisiones atmosféricas</h1>
          <p className="page-description">
            Sección II de la RENE - Fuentes fijas, fuentes móviles y emisiones fugitivas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportWord}>
            <FileText className="h-4 w-4 mr-2" />
            Word
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* AI Consultant Section */}
      <AtmosphericDataProvider>
        {<AIConsultant data={data} />}
      </AtmosphericDataProvider>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="fixed">3.1 Fuentes Fijas</TabsTrigger>
          <TabsTrigger value="mobile">3.2 Fuentes Móviles</TabsTrigger>
          <TabsTrigger value="fugitive">3.3 Emisiones Fugitivas</TabsTrigger>
        </TabsList>

        {/* Fixed Sources */}
        <TabsContent value="fixed">
          <div className="card-elevated overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={fixedFilter} onValueChange={setFixedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tipo de equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos de equipo</SelectItem>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <SortableHeader field="equipmentType" label="Equipment Type" sortState={fixedSort} onSort={(f) => setFixedSort(toggleSort(fixedSort, f))} />
                    <SortableHeader field="fuel" label="Fuel" sortState={fixedSort} onSort={(f) => setFixedSort(toggleSort(fixedSort, f))} />
                    <SortableHeader field="annualConsumption" label="Annual Consumption" sortState={fixedSort} onSort={(f) => setFixedSort(toggleSort(fixedSort, f))} />
                    <SortableHeader field="operatingHours" label="Operating Hours" sortState={fixedSort} onSort={(f) => setFixedSort(toggleSort(fixedSort, f))} />
                    <SortableHeader field="estimationMethod" label="Estimation Method" sortState={fixedSort} onSort={(f) => setFixedSort(toggleSort(fixedSort, f))} />
                    <SortableHeader field="co2Emissions" label="CO₂ Emissions" sortState={fixedSort} onSort={(f) => setFixedSort(toggleSort(fixedSort, f))} />
                    <SortableHeader field="ch4Emissions" label="CH₄ Emissions" sortState={fixedSort} onSort={(f) => setFixedSort(toggleSort(fixedSort, f))} />
                    <SortableHeader field="n2oEmissions" label="N₂O Emissions" sortState={fixedSort} onSort={(f) => setFixedSort(toggleSort(fixedSort, f))} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFixedSources.map((record, index) => (
                    <TableRow key={record.id} className={cn(index % 2 === 1 && "bg-muted/50")}>
                      <TableCell className="font-medium">{record.equipmentType}</TableCell>
                      <TableCell>{record.fuel}</TableCell>
                      <TableCell className="text-right font-mono">{record.annualConsumption.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{record.operatingHours.toLocaleString()}</TableCell>
                      <TableCell>{record.estimationMethod}</TableCell>
                      <TableCell className="text-right font-mono">{record.co2Emissions.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">{record.ch4Emissions.toFixed(3)}</TableCell>
                      <TableCell className="text-right font-mono">{record.n2oEmissions.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-secondary font-bold">
                    <TableCell colSpan={5}>TOTAL</TableCell>
                    <TableCell className="text-right font-mono">{fixedTotals.co2.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{fixedTotals.ch4.toFixed(3)}</TableCell>
                    <TableCell className="text-right font-mono">{fixedTotals.n2o.toFixed(3)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Mobile Sources */}
        <TabsContent value="mobile">
          <div className="card-elevated overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by Vehicle Type..."
                value={mobileFilter}
                onChange={(e) => setMobileFilter(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <SortableHeader field="vehicleType" label="Vehicle Type" sortState={mobileSort} onSort={(f) => setMobileSort(toggleSort(mobileSort, f))} />
                    <SortableHeader field="fuel" label="Fuel" sortState={mobileSort} onSort={(f) => setMobileSort(toggleSort(mobileSort, f))} />
                    <SortableHeader field="annualConsumption" label="Annual Consumption" sortState={mobileSort} onSort={(f) => setMobileSort(toggleSort(mobileSort, f))} />
                    <SortableHeader field="calculationMethod" label="Calculation Method" sortState={mobileSort} onSort={(f) => setMobileSort(toggleSort(mobileSort, f))} />
                    <SortableHeader field="ghgEmissions" label="GHG Emissions" sortState={mobileSort} onSort={(f) => setMobileSort(toggleSort(mobileSort, f))} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMobileSources.map((record, index) => (
                    <TableRow key={record.id} className={cn(index % 2 === 1 && "bg-muted/50")}>
                      <TableCell className="font-medium">{record.vehicleType}</TableCell>
                      <TableCell>{record.fuel}</TableCell>
                      <TableCell className="text-right font-mono">{record.annualConsumption.toLocaleString()}</TableCell>
                      <TableCell>{record.calculationMethod}</TableCell>
                      <TableCell className="text-right font-mono">{record.ghgEmissions.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-secondary font-bold">
                    <TableCell colSpan={4}>TOTAL</TableCell>
                    <TableCell className="text-right font-mono">{mobileTotals.ghg.toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Fugitive Emissions */}
        <TabsContent value="fugitive">
          <div className="card-elevated overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={fugitiveFilter} onValueChange={setFugitiveFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {FUGITIVE_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <SortableHeader field="gasType" label="Gas Type" sortState={fugitiveSort} onSort={(f) => setFugitiveSort(toggleSort(fugitiveSort, f))} />
                    <SortableHeader field="source" label="Source" sortState={fugitiveSort} onSort={(f) => setFugitiveSort(toggleSort(fugitiveSort, f))} />
                    <SortableHeader field="estimatedQuantity" label="Estimated Quantity" sortState={fugitiveSort} onSort={(f) => setFugitiveSort(toggleSort(fugitiveSort, f))} />
                    <SortableHeader field="methodology" label="Methodology" sortState={fugitiveSort} onSort={(f) => setFugitiveSort(toggleSort(fugitiveSort, f))} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFugitiveEmissions.map((record, index) => (
                    <TableRow key={record.id} className={cn(index % 2 === 1 && "bg-muted/50")}>
                      <TableCell className="font-medium">{record.gasType}</TableCell>
                      <TableCell>{record.source}</TableCell>
                      <TableCell className="text-right font-mono">{record.estimatedQuantity.toFixed(2)}</TableCell>
                      <TableCell>{record.methodology}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-secondary font-bold">
                    <TableCell colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-right font-mono">{fugitiveTotals.quantity.toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AtmosphericReports;
