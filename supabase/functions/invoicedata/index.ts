import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Loopify company details - hardcoded as per sample invoice
const SELLER_INFO = {
  name: "Loopify World Private Ltd",
  address: "103-B, Anand Commercial Compound, Gandhi Nagar, LBS Marg, Vikhroli West, Mumbai - 400083",
  gst: "27AAECL4397C1ZF",
};

const BANK_DETAILS = {
  accountName: "LOOPIFY WORLD PVT LTD",
  bankName: "ICICI Bank Ltd",
  accountNumber: "002005040537",
  ifsc: "ICIC0000020",
  branch: "Powai",
  location: "Mumbai",
};

const TERMS = [
  "Prices are inclusive of all taxes, branding and shipping as mentioned above.",
  "Client to share the address, mobile numbers and email ids for dispatch.",
  "Loopify team will dispatch hampers within 10-11 days from receipt of advance for order confirmation and approval on mock-ups. While we take all efforts to neutralise it, Loopify won't be responsible in case of unforeseen delays in delivery because of on ground issues, if any.",
  "The total invoice value, inclusive of GST, must be paid as per the agreed terms. Withholding or delaying the GST component is not permitted. Loopify will hold dispatch until the full amount is received.",
];

const PAYMENT_TERMS = [
  "50% advance payment at the time of order confirmation.",
  "50% balance payment before dispatch",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const invoiceNumber = url.searchParams.get("invoiceNumber");

    if (!invoiceNumber) {
      return new Response(
        JSON.stringify({ success: false, error: "invoiceNumber is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseId = Deno.env.get("AIRTABLE_SALE_BASE_ID");
    const apiKey = Deno.env.get("AIRTABLE_SALE_TOKEN");

    if (!baseId || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing Airtable Sale configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Sale record
    const saleTableName = encodeURIComponent("Sale");
    const saleFormula = encodeURIComponent(`{sales_invoice_number}="${invoiceNumber}"`);
    const saleUrl = `https://api.airtable.com/v0/${baseId}/${saleTableName}?filterByFormula=${saleFormula}&maxRecords=1`;

    console.log("Fetching invoice:", invoiceNumber);

    const saleResponse = await fetch(saleUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!saleResponse.ok) {
      const errorText = await saleResponse.text();
      console.error("Sale fetch error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const saleData = await saleResponse.json();

    if (!saleData.records || saleData.records.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const saleRecord = saleData.records[0];
    const saleFields = saleRecord.fields;
    const saleRecordId = saleRecord.id;

    console.log("Sale fields:", JSON.stringify(saleFields, null, 2));

    // Fetch Sale_LI (line items)
    const liTableName = encodeURIComponent("Sale_LI");
    const liFormula = encodeURIComponent(`FIND("${saleRecordId}", ARRAYJOIN({so}))`);
    const liUrl = `https://api.airtable.com/v0/${baseId}/${liTableName}?filterByFormula=${liFormula}`;

    const liResponse = await fetch(liUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!liResponse.ok) {
      const errorText = await liResponse.text();
      console.error("Line items fetch error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const liData = await liResponse.json();
    console.log("Line items count:", liData.records?.length || 0);

    const lineItems = (liData.records || []).map((record: any) => {
      const preTaxPrice = record.fields.pre_tax_price || record.fields["Pre GST Price"] || 0;
      const qtySold = record.fields.qty_sold || record.fields["Qty"] || 1;
      const amount = preTaxPrice * qtySold;

      return {
        id: record.id,
        gift_hamper_name: record.fields.gift_hamper_name || record.fields["Gift Hamper Name"] || "",
        mrp: record.fields.mrp || record.fields["MRP (Selling Price)"] || 0,
        pre_tax_price: preTaxPrice,
        qty_sold: qtySold,
        gst: record.fields.gst || record.fields["GST"] || 18,
        gh_config: record.fields.gh_config || record.fields["Gift Hamper Config"] || record.fields["Description"] || "",
        amount: Math.round(amount * 100) / 100,
      };
    });

    // Calculate totals
    let taxableAmount = 0;
    let taxAmount = 0;

    lineItems.forEach((item: any) => {
      taxableAmount += item.amount;
      taxAmount += (item.amount * (item.gst || 0)) / 100;
    });

    const grandTotal = taxableAmount + taxAmount;

    // Extract contact details from sale record
    const contactPerson = saleFields["SPOC Details"] || saleFields.spoc_details || saleFields["Contact Person"] || "";
    const contactMobile = saleFields["Mobile"] || saleFields.mobile || saleFields["Phone"] || "";
    const contactEmail = saleFields["Email"] || saleFields.email || "";

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          invoice: {
            invoiceNumber: saleFields.sales_invoice_number || saleFields["Invoice Number"] || invoiceNumber,
            invoiceDate: saleFields["Invoice Date"] || saleFields.invoice_date || "",
            billingAddress: saleFields["Billing Address"] || saleFields.billing_address || "",
            gst: saleFields["GST"] || saleFields.gst || saleFields["GSTIN"] || "",
            contactPerson: contactPerson,
            contactMobile: contactMobile,
            contactEmail: contactEmail,
            recordId: saleRecordId,
          },
          items: lineItems,
          totals: {
            taxableAmount: Math.round(taxableAmount * 100) / 100,
            taxAmount: Math.round(taxAmount * 100) / 100,
            grandTotal: Math.round(grandTotal * 100) / 100,
          },
          seller: SELLER_INFO,
          bankDetails: BANK_DETAILS,
          terms: TERMS,
          paymentTerms: PAYMENT_TERMS,
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
