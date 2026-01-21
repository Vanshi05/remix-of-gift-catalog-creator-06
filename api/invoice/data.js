//api/invoice/data.js
export default async function handler(req, res) {
  try {
    const { invoiceNumber } = req.query;

    if (!invoiceNumber) {
      return res.status(400).json({
        success: false,
        error: "invoiceNumber is required"
      });
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    // Support either env name (your spec used AIRTABLE_TOKEN)
    const apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN;

    if (!baseId || !apiKey) {
      return res.status(500).json({
        success: false,
        error:
          "Missing Airtable env vars. Set AIRTABLE_BASE_ID and AIRTABLE_TOKEN (or AIRTABLE_API_KEY) in Vercel and redeploy."
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
    // Assuming Sale_LI has a linked field called "Sale" that links to Sale table
    const liFormula = encodeURIComponent(`FIND("${saleRecordId}", ARRAYJOIN({Sale}))`);
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
    const lineItems = (liData.records || []).map(record => ({
      id: record.id,
      gift_hamper_name: record.fields.gift_hamper_name || record.fields["Gift Hamper Name"] || "",
      mrp: record.fields.mrp || record.fields["MRP (Selling Price)"] || 0,
      pre_tax_price: record.fields.pre_tax_price || record.fields["Pre GST Price"] || 0,
      qty_sold: record.fields.qty_sold || record.fields["Qty"] || 1,
      gst: record.fields.gst || record.fields["GST"] || 0,
      gh_config: record.fields.gh_config || record.fields["Gift Hamper Config"] || ""
    }));

    // Calculate totals
    let taxableAmount = 0;
    let taxAmount = 0;

    lineItems.forEach(item => {
      const itemTotal = (item.pre_tax_price || 0) * (item.qty_sold || 1);
      taxableAmount += itemTotal;
      taxAmount += (itemTotal * (item.gst || 0)) / 100;
    });

    const grandTotal = taxableAmount + taxAmount;

    return res.status(200).json({
      success: true,
      data: {
        invoice: {
          invoiceNumber: saleFields.sales_invoice_number || saleFields["Invoice Number"] || invoiceNumber,
          invoiceDate: saleFields["Invoice Date"] || saleFields.invoice_date || "",
          billingAddress: saleFields["Billing Address"] || saleFields.billing_address || "",
          gst: saleFields["GST"] || saleFields.gst || "",
          contactPerson: saleFields["SPOC Details"] || saleFields.spoc_details || "",
          recordId: saleRecordId
        },
        items: lineItems,
        totals: {
          taxableAmount: Math.round(taxableAmount * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          grandTotal: Math.round(grandTotal * 100) / 100
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
