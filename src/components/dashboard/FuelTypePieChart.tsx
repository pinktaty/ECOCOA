import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const data = [
  { name: "Gasoline", value: 35, color: "hsl(var(--chart-gasoline))" },
  { name: "Diesel", value: 28, color: "hsl(var(--chart-diesel))" },
  { name: "Natural Gas", value: 22, color: "hsl(var(--chart-natural-gas))" },
  { name: "Electricity", value: 15, color: "hsl(var(--chart-electricity))" },
];

export function FuelTypePieChart() {
  return (
    <div className="chart-container animate-slide-up">
      <h3 className="text-lg font-semibold mb-6">Emissions by Fuel Type</h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "var(--shadow-md)",
            }}
            formatter={(value: number) => [`${value}%`, "Share"]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
