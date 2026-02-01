import { FileSpreadsheet, FileText, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "upload",
    title: "Data uploaded",
    description: "Q4 2024 consumption data - 156 records",
    time: "2 hours ago",
    icon: FileSpreadsheet,
  },
  {
    id: 2,
    type: "calculation",
    title: "Emissions calculated",
    description: "4,285 tonnes CO₂e total emissions",
    time: "2 hours ago",
    icon: Calculator,
  },
  {
    id: 3,
    type: "report",
    title: "Report generated",
    description: "Annual GHG Inventory 2024",
    time: "1 day ago",
    icon: FileText,
  },
  {
    id: 4,
    type: "upload",
    title: "Data uploaded",
    description: "Q3 2024 consumption data - 142 records",
    time: "5 days ago",
    icon: FileSpreadsheet,
  },
];

export function RecentActivity() {
  return (
    <div className="chart-container animate-slide-up">
      <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
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
