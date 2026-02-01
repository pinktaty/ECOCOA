import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import type { AtmosphericEmissionsData } from "@/types/atmosphericEmissions";

interface AIConsultantProps {
  data: AtmosphericEmissionsData;
}

interface DataSummary {
  fixedTotals: { co2: number; ch4: number; n2o: number };
  mobileTotals: { ghg: number };
  fugitiveTotals: { quantity: number };
}

export function AIConsultant({ data }: AIConsultantProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const hasData =
      data.fixedSources.length > 0 ||
      data.mobileSources.length > 0 ||
      data.fugitiveEmissions.length > 0;

  const calculateDataSummary = (): DataSummary => {
    const fixedTotals = data.fixedSources.reduce(
        (acc, source) => ({
          co2: acc.co2 + (source.co2Emissions || 0),
          ch4: acc.ch4 + (source.ch4Emissions || 0),
          n2o: acc.n2o + (source.n2oEmissions || 0),
        }),
        { co2: 0, ch4: 0, n2o: 0 }
    );

    const mobileTotals = data.mobileSources.reduce(
        (acc, source) => ({
          ghg: acc.ghg + (source.ghgEmissions || 0),
        }),
        { ghg: 0 }
    );

    const fugitiveTotals = data.fugitiveEmissions.reduce(
        (acc, emission) => ({
          quantity: acc.quantity + (emission.estimatedQuantity || 0),
        }),
        { quantity: 0 }
    );

    return { fixedTotals, mobileTotals, fugitiveTotals };
  };

  const handleAnalyze = async () => {
    if (!hasData) {
      toast({
        title: "No Data Available",
        description: "Please upload atmospheric emissions data first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const summary = calculateDataSummary();
      setDataSummary(summary);

      // Preparar el prompt para Claude
      const prompt = `Eres un consultor experto en sostenibilidad y reducción de emisiones de CO₂ a nivel empresarial.

Analiza los siguientes datos de emisiones atmosféricas de una empresa y genera un reporte detallado con recomendaciones específicas y accionables para reducir sus emisiones de CO₂:

**DATOS DE EMISIONES:**

**Fuentes Fijas (${data.fixedSources.length} fuentes):**
${data.fixedSources.map((source, i) => `
${i + 1}. Tipo de equipo: ${source.equipmentType}
   - Combustible: ${source.fuel}
   - Horas de operación: ${source.operatingHours || 'N/A'} hrs/año
   - Emisiones CO₂: ${source.co2Emissions || 0} toneladas
   - Emisiones CH₄: ${source.ch4Emissions || 0} toneladas
   - Emisiones N₂O: ${source.n2oEmissions || 0} toneladas
`).join('\n')}

**Total Fuentes Fijas:** ${summary.fixedTotals.co2.toFixed(2)} t CO₂, ${summary.fixedTotals.ch4.toFixed(2)} t CH₄, ${summary.fixedTotals.n2o.toFixed(2)} t N₂O

**Fuentes Móviles (${data.mobileSources.length} vehículos):**
${data.mobileSources.map((source, i) => `
${i + 1}. Tipo de vehículo: ${source.vehicleType}
   - Combustible: ${source.fuel}
   - Método de cálculo: ${source.calculationMethod || 'N/A'}
   - Emisiones GEI: ${source.ghgEmissions || 0} t CO₂e
`).join('\n')}

**Total Fuentes Móviles:** ${summary.mobileTotals.ghg.toFixed(2)} t CO₂e

**Emisiones Fugitivas (${data.fugitiveEmissions.length} fuentes):**
${data.fugitiveEmissions.map((emission, i) => `
${i + 1}. Tipo de gas: ${emission.gasType}
   - Fuente: ${emission.source}
   - Cantidad estimada: ${emission.estimatedQuantity || 0} kg
   - Metodología: ${emission.methodology || 'N/A'}
`).join('\n')}

**Total Emisiones Fugitivas:** ${summary.fugitiveTotals.quantity.toFixed(2)} kg

**GENERA UN REPORTE QUE INCLUYA:**

1. **Resumen Ejecutivo:** Análisis general del perfil de emisiones de la empresa
2. **Áreas de Mayor Impacto:** Identifica las 3 fuentes principales de emisiones
3. **Recomendaciones Prioritarias:** Mínimo 5 acciones concretas y específicas basadas en los datos reales
4. **Estimación de Reducción:** Porcentaje estimado de reducción de CO₂ para cada recomendación
5. **Implementación:** Pasos prácticos y timeline sugerido
6. **Costos y ROI:** Estimación aproximada de inversión y retorno

Formato: Usa markdown con títulos (##), subtítulos (###), negritas (**texto**) y listas (- item).`;

      // Llamada a la API de Claude
      const response = await fetch("http://localhost:3001/api/anthropic/v1/messages", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4000,
              messages: [
                  { role: "user", content: prompt }
              ],
          })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      if (responseData.content && responseData.content[0]?.text) {
          console.log(responseData)
        setRecommendation(responseData.content[0].text);
        toast({
          title: "Analysis Complete",
          description: "AI consultant has generated your CO₂ reduction recommendations.",
        });
      } else {
        throw new Error("Invalid response format from Claude API");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze emissions data";
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Emissions Consultant
            </CardTitle>
            <CardDescription>
              Get AI-powered recommendations for reducing your CO₂ emissions
            </CardDescription>
          </div>
          <Button
              onClick={handleAnalyze}
              disabled={isLoading || !hasData}
              className="gap-2"
          >
            {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
            ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Emissions
                </>
            )}
          </Button>
        </CardHeader>

        <CardContent>
          {!hasData && (
              <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted/50 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>Upload atmospheric emissions data to enable AI analysis.</span>
              </div>
          )}

          {error && (
              <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
          )}

          {recommendation && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between mb-4">
                    <span className="font-semibold">AI Recommendations</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {dataSummary && (
                      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Fixed Sources</p>
                          <p className="text-lg font-bold text-primary">{dataSummary.fixedTotals.co2.toFixed(2)} t CO₂</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Mobile Sources</p>
                          <p className="text-lg font-bold text-primary">{dataSummary.mobileTotals.ghg.toFixed(2)} t CO₂e</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Fugitive Emissions</p>
                          <p className="text-lg font-bold text-primary">{dataSummary.fugitiveTotals.quantity.toFixed(2)} kg</p>
                        </div>
                      </div>
                  )}
                  <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: recommendation
                            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2 text-foreground">$1</h3>')
                            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-3 text-foreground">$1</h2>')
                            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
                            .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 mb-1">$2</li>')
                            .replace(/\n\n/g, '</p><p class="mb-4">')
                            .replace(/\n/g, '<br/>')
                      }}
                  />
                </CollapsibleContent>
              </Collapsible>
          )}
        </CardContent>
      </Card>
  );
}