export default async function handler(req, res) {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN;

    if (!baseId || !apiKey) {
      return res.status(500).json({
        success: false,
        error:
          "Missing Airtable env vars. Set AIRTABLE_BASE_ID and AIRTABLE_TOKEN (or AIRTABLE_API_KEY)."
      });
    }

    const tableName = encodeURIComponent("Gift Hamper");

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        success: false,
        error: errorText
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: "Airtable connection successful",
      recordCount: data.records.length,
      sampleRecord: data.records[0] || null
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
