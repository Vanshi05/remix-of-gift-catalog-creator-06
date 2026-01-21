import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const ghId = url.searchParams.get("gh_id");

    if (!ghId) {
      return new Response(
        JSON.stringify({ success: false, error: "gh_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseId = Deno.env.get("AIRTABLE_BASE_ID");
    const apiKey = Deno.env.get("AIRTABLE_TOKEN");

    if (!baseId || !apiKey) {
      console.error("Missing AIRTABLE_BASE_ID or AIRTABLE_TOKEN");
      return new Response(
        JSON.stringify({ success: false, error: "Missing Airtable configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tableName = encodeURIComponent("Gift Hamper");
    const formula = encodeURIComponent(`{gh_id}="${ghId}"`);
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=${formula}&maxRecords=1`;

    console.log(`Fetching Gift Hamper: ${ghId}`);

    const response = await fetch(airtableUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Gift Hamper not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const record = data.records[0].fields;
    const image = record.Image && record.Image.length > 0 ? record.Image[0].url : null;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          gh_id: ghId,
          name: record["Gift Hamper Name"] || "",
          image,
          gh_bom: record.gh_bom || "",
          pre_tax_sale_price_without_shipping: record.pre_tax_sale_price_without_shipping || 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
