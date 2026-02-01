import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
      const { data: responseData, error: fnError } = await supabase.functions.invoke(
        'ai-emissions-consultant',
        {
          body: { atmosphericData: data },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      setRecommendation(responseData.recommendation);
      setDataSummary(responseData.dataSummary);
      toast({
        title: "Analysis Complete",
        description: "AI consultant has generated your CO₂ reduction recommendations.",
      });
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
          <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
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
                    .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground">')
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
