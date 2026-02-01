import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AtmosphericData {
  fixedSources: Array<{
    equipmentType: string;
    fuel: string;
    annualConsumption: number;
    operatingHours: number;
    estimationMethod: string;
    co2Emissions: number;
    ch4Emissions: number;
    n2oEmissions: number;
  }>;
  mobileSources: Array<{
    vehicleType: string;
    fuel: string;
    annualConsumption: number;
    calculationMethod: string;
    ghgEmissions: number;
  }>;
  fugitiveEmissions: Array<{
    gasType: string;
    source: string;
    estimatedQuantity: number;
    methodology: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }

    const { atmosphericData } = await req.json() as { atmosphericData: AtmosphericData };

    // Calculate totals for the summary
    const fixedTotals = {
      co2: atmosphericData.fixedSources.reduce((sum, r) => sum + r.co2Emissions, 0),
      ch4: atmosphericData.fixedSources.reduce((sum, r) => sum + r.ch4Emissions, 0),
      n2o: atmosphericData.fixedSources.reduce((sum, r) => sum + r.n2oEmissions, 0),
    };

    const mobileTotals = {
      ghg: atmosphericData.mobileSources.reduce((sum, r) => sum + r.ghgEmissions, 0),
    };

    const fugitiveTotals = {
      quantity: atmosphericData.fugitiveEmissions.reduce((sum, r) => sum + r.estimatedQuantity, 0),
    };

    // Build the data summary for Claude
    const dataSummary = `
## Atmospheric Emissions Data Summary

### Fixed Sources (Stationary Combustion)
${atmosphericData.fixedSources.map(s => 
  `- ${s.equipmentType}: ${s.fuel}, ${s.annualConsumption.toLocaleString()} units/year, ${s.operatingHours}h operation
    CO₂: ${s.co2Emissions.toFixed(2)} tonnes | CH₄: ${s.ch4Emissions.toFixed(3)} tonnes | N₂O: ${s.n2oEmissions.toFixed(3)} tonnes`
).join('\n')}
**Total Fixed Sources:** CO₂: ${fixedTotals.co2.toFixed(2)} t | CH₄: ${fixedTotals.ch4.toFixed(3)} t | N₂O: ${fixedTotals.n2o.toFixed(3)} t

### Mobile Sources (Transportation)
${atmosphericData.mobileSources.map(s => 
  `- ${s.vehicleType}: ${s.fuel}, ${s.annualConsumption.toLocaleString()} units/year (${s.calculationMethod})
    GHG Emissions: ${s.ghgEmissions.toFixed(2)} tonnes CO₂e`
).join('\n')}
**Total Mobile Sources:** ${mobileTotals.ghg.toFixed(2)} tonnes CO₂e

### Fugitive Emissions
${atmosphericData.fugitiveEmissions.map(s => 
  `- ${s.gasType} from ${s.source}: ${s.estimatedQuantity.toFixed(2)} kg (${s.methodology})`
).join('\n')}
**Total Fugitive Emissions:** ${fugitiveTotals.quantity.toFixed(2)} kg
`;

    const systemPrompt = `Act as an expert consultant in CO₂ emissions reduction. Based on the data obtained from atmospheric reports, analyze the client's emissions considering: fixed sources, fugitive sources, and mobile sources.

Propose customized CO₂ reduction solutions, differentiating between short-, medium-, and long-term actions.

Present the recommendations in clear, professional, client-oriented language, and conclude with an executive summary of priority actions.

Format your response using Markdown with clear headings and bullet points. Use the following structure:
1. **Analysis Overview** - Brief assessment of current emissions profile
2. **Short-Term Actions** (0-6 months) - Quick wins and immediate improvements
3. **Medium-Term Actions** (6-24 months) - Significant changes requiring planning
4. **Long-Term Actions** (2-5 years) - Strategic transformations
5. **Executive Summary** - Priority actions and expected impact`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Please analyze the following atmospheric emissions data and provide comprehensive CO₂ reduction recommendations:\n\n${dataSummary}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status} - ${errorData}`);
    }

    const claudeResponse = await response.json();
    const recommendation = claudeResponse.content[0].text;

    return new Response(
      JSON.stringify({ 
        recommendation,
        dataSummary: {
          fixedTotals,
          mobileTotals,
          fugitiveTotals,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    console.error('Error in ai-emissions-consultant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
