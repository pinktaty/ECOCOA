import { useState } from "react";
import { Building2, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EmissionFactor {
  id: string;
  fuelType: string;
  co2Factor: number;
  ch4Factor: number;
  n2oFactor: number;
}

const initialFactors: EmissionFactor[] = [
  { id: "1", fuelType: "Gasoline", co2Factor: 2.31, ch4Factor: 0.0001, n2oFactor: 0.00002 },
  { id: "2", fuelType: "Diesel", co2Factor: 2.68, ch4Factor: 0.00012, n2oFactor: 0.00002 },
  { id: "3", fuelType: "Natural Gas", co2Factor: 1.89, ch4Factor: 0.00001, n2oFactor: 0.00001 },
  { id: "4", fuelType: "Electricity", co2Factor: 0.42, ch4Factor: 0.00001, n2oFactor: 0.000005 },
];

const Settings = () => {
  const { toast } = useToast();
  const [orgName, setOrgName] = useState("Acme Corporation");
  const [orgId, setOrgId] = useState("ORG-2024-001");
  const [industry, setIndustry] = useState("manufacturing");
  const [factors, setFactors] = useState<EmissionFactor[]>(initialFactors);
  const [editingFactor, setEditingFactor] = useState<string | null>(null);

  const handleSaveOrg = () => {
    toast({
      title: "Ajustes Guardados",
      description: "El perfil de la organización ha sido guardado.",
    });
  };

  const handleSaveFactors = () => {
    setEditingFactor(null);
    toast({
      title: "Factores de emisión guardados",
      description: "Los factores actualizados de las emisiones se aplicaran a los nuevos cálculos",
    });
  };

  const updateFactor = (id: string, field: keyof EmissionFactor, value: number) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="page-header">
        <h1 className="page-title">Ajustes</h1>
        <p className="page-description">
          Modificar el perfil de la organización y factores de emisión
        </p>
      </div>

      {/* Organization Profile */}
      <div className="card-elevated p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Perfil de la organización</h2>
            <p className="text-sm text-muted-foreground">
              Información básica de tu organización
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nombre de la organización</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgId">ID de Organización</Label>
            <Input
              id="orgId"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturing">Manufactura</SelectItem>
                <SelectItem value="energy">Energía y Utilidads</SelectItem>
                <SelectItem value="transport">Transporte</SelectItem>
                <SelectItem value="construction">Construcción</SelectItem>
                <SelectItem value="agriculture">Agricultura</SelectItem>
                <SelectItem value="services">Servicios profesionales</SelectItem>
                <SelectItem value="retail">Minorista y comercio</SelectItem>
                <SelectItem value="healthcare">Cuidado de la salud</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveOrg}>
            <Save className="h-4 w-4 mr-2" />
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Emission Factors */}
      <div className="card-elevated overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">Emission Factors</h2>
            <p className="text-sm text-muted-foreground">
              Configurar factores de emisión por cada tipo  de combustible
            </p>
          </div>
          {editingFactor && (
            <Button onClick={handleSaveFactors}>
              <Save className="h-4 w-4 mr-2" />
              Guardar todo
            </Button>
          )}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Fuel Type</th>
              <th className="text-right">CO₂ (kg/unit)</th>
              <th className="text-right">CH₄ (kg/unit)</th>
              <th className="text-right">N₂O (kg/unit)</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {factors.map((factor) => (
              <tr key={factor.id}>
                <td className="font-medium">{factor.fuelType}</td>
                <td className="text-right">
                  {editingFactor === factor.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={factor.co2Factor}
                      onChange={(e) =>
                        updateFactor(factor.id, "co2Factor", parseFloat(e.target.value))
                      }
                      className="w-28 ml-auto text-right"
                    />
                  ) : (
                    <span className="font-mono">{factor.co2Factor}</span>
                  )}
                </td>
                <td className="text-right">
                  {editingFactor === factor.id ? (
                    <Input
                      type="number"
                      step="0.00001"
                      value={factor.ch4Factor}
                      onChange={(e) =>
                        updateFactor(factor.id, "ch4Factor", parseFloat(e.target.value))
                      }
                      className="w-28 ml-auto text-right"
                    />
                  ) : (
                    <span className="font-mono">{factor.ch4Factor}</span>
                  )}
                </td>
                <td className="text-right">
                  {editingFactor === factor.id ? (
                    <Input
                      type="number"
                      step="0.00001"
                      value={factor.n2oFactor}
                      onChange={(e) =>
                        updateFactor(factor.id, "n2oFactor", parseFloat(e.target.value))
                      }
                      className="w-28 ml-auto text-right"
                    />
                  ) : (
                    <span className="font-mono">{factor.n2oFactor}</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() =>
                      setEditingFactor(editingFactor === factor.id ? null : factor.id)
                    }
                    className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
