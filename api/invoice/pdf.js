//api/invoice/pdf.js

// Loopify company details
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

export default async function handler(req, res) {
  try {
    const { invoiceNumber } = req.query;

    if (!invoiceNumber) {
      return res.status(400).json({
        success: false,
        error: "invoiceNumber is required"
      });
    }

    const baseId = process.env.AIRTABLE_SALE_BASE_ID;
    const apiKey =
      process.env.AIRTABLE_SALE_API_KEY ||
      process.env.AIRTABLE_SALE_TOKEN;

    if (!baseId || !apiKey) {
      return res.status(500).json({
        success: false,
        error:
          "Missing Airtable env vars. Set AIRTABLE_SALE_BASE_ID and AIRTABLE_SALE_TOKEN."
      });
    }

    // Fetch Sale record
    const saleTableName = encodeURIComponent("Sale");
    const saleFormula = encodeURIComponent(`{sales_invoice_number}="${invoiceNumber}"`);
    const saleUrl = `https://api.airtable.com/v0/${baseId}/${saleTableName}?filterByFormula=${saleFormula}&maxRecords=1`;

    const saleResponse = await fetch(saleUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!saleResponse.ok) {
      const text = await saleResponse.text();
      return res.status(500).json({ success: false, error: text });
    }

    const saleData = await saleResponse.json();

    if (!saleData.records || saleData.records.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found"
      });
    }

    const saleRecord = saleData.records[0];
    const saleFields = saleRecord.fields;
    const saleRecordId = saleRecord.id;

    // Fetch Sale_LI (line items) linked to this Sale
    const liTableName = encodeURIComponent("Sale_LI");
    const liFormula = encodeURIComponent(`FIND("${saleRecordId}", ARRAYJOIN({so}))`);
    const liUrl = `https://api.airtable.com/v0/${baseId}/${liTableName}?filterByFormula=${liFormula}`;

    const liResponse = await fetch(liUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!liResponse.ok) {
      const text = await liResponse.text();
      return res.status(500).json({ success: false, error: text });
    }

    const liData = await liResponse.json();
    const lineItems = (liData.records || []).map(record => {
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

    lineItems.forEach(item => {
      taxableAmount += item.amount;
      taxAmount += (item.amount * (item.gst || 0)) / 100;
    });

    const grandTotal = taxableAmount + taxAmount;

    // Extract contact details
    const contactPerson = saleFields["SPOC Details"] || saleFields.spoc_details || saleFields["Contact Person"] || "";
    const contactMobile = saleFields["Mobile"] || saleFields.mobile || saleFields["Phone"] || "";
    const contactEmail = saleFields["Email"] || saleFields.email || "";

    return res.status(200).json({
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
        },
        items: lineItems,
        totals: {
          taxableAmount: Math.round(taxableAmount * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          grandTotal: Math.round(grandTotal * 100) / 100
        },
        seller: SELLER_INFO,
        bankDetails: BANK_DETAILS,
        terms: TERMS,
        paymentTerms: PAYMENT_TERMS,
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
