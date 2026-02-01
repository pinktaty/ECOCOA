import { FileSpreadsheet, FileText, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "upload",
    title: "Datos subidos",
    description: "Datos de consumo del cuarto trimestre de 2024: 156 registros",
    time: "Hace 2 horas",
    icon: FileSpreadsheet,
  },
  {
    id: 2,
    type: "calculation",
    title: "Cálculo de emisiones",
    description: "4,285 toneladas de CO₂e totales",
    time: "Hace 2 horas",
    icon: Calculator,
  },
  {
    id: 3,
    type: "report",
    title: "Reporte generado",
    description: "Inventario Anual de GEI 2024",
    time: "Hace 1 día",
    icon: FileText,
  },
  {
    id: 4,
    type: "upload",
    title: "Datos subidos",
    description: "Datos de consumo del tercer trimestre de 2024: 142 registros",
    time: "5 days ago",
    icon: FileSpreadsheet,
  },
];

export function RecentActivity() {
  return (
    <div className="chart-container animate-slide-up">
      <h3 className="text-lg font-semibold mb-6">Actividad Reciente</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                activity.type === "upload" && "bg-info/10 text-info",
                activity.type === "calculation" && "bg-success/10 text-success",
                activity.type === "report" && "bg-primary/10 text-primary"
              )}
            >
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{activity.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
