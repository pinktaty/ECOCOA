import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Jan", CO2: 4200, CH4: 85, N2O: 12 },
  { month: "Feb", CO2: 3800, CH4: 78, N2O: 10 },
  { month: "Mar", CO2: 4500, CH4: 92, N2O: 14 },
  { month: "Apr", CO2: 4100, CH4: 81, N2O: 11 },
  { month: "May", CO2: 3600, CH4: 72, N2O: 9 },
  { month: "Jun", CO2: 3900, CH4: 79, N2O: 10 },
];

export function EmissionsBarChart() {
  return (
    <div className="chart-container animate-slide-up">
      <h3 className="text-lg font-semibold mb-6">Emissions by Pollutant</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "var(--shadow-md)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          />
          <Legend />
          <Bar
            dataKey="CO2"
            fill="hsl(var(--chart-co2))"
            radius={[4, 4, 0, 0]}
            name="CO₂ (tonnes)"
          />
          <Bar
            dataKey="CH4"
            fill="hsl(var(--chart-ch4))"
            radius={[4, 4, 0, 0]}
            name="CH₄ (kg)"
          />
          <Bar
            dataKey="N2O"
            fill="hsl(var(--chart-n2o))"
            radius={[4, 4, 0, 0]}
            name="N₂O (kg)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
