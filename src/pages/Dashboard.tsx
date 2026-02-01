import { Factory, Flame, Zap, Wind } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmissionsBarChart } from "@/components/dashboard/EmissionsBarChart";
import { FuelTypePieChart } from "@/components/dashboard/FuelTypePieChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Panel de Emsiones</h1>
        <p className="page-description">
          Descripción general de las emisiones de gases de efecto invernadero de su organización          
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total CO₂"
          value="24,156"
          unit="tonnes"
          icon={Factory}
          trend={{ value: 5.2, isPositive: true }}
          iconClassName="bg-chart-co2/10 text-chart-co2"
        />
        <StatCard
          title="Total CH₄"
          value="487"
          unit="kg"
          icon={Flame}
          trend={{ value: 2.8, isPositive: true }}
          iconClassName="bg-chart-ch4/10 text-chart-ch4"
        />
        <StatCard
          title="Total N₂O"
          value="66"
          unit="kg"
          icon={Wind}
          trend={{ value: 1.5, isPositive: false }}
          iconClassName="bg-chart-n2o/10 text-chart-n2o"
        />
        <StatCard
          title="CO₂ Equivalent"
          value="24,892"
          unit="tCO₂e"
          icon={Zap}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <EmissionsBarChart />
        <FuelTypePieChart />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;
