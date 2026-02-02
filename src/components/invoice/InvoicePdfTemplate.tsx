import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { InvoiceData } from '@/types/invoice';
import loopifyLogo from '@/assets/loopify-logo.jpg';

// Register fonts for professional look
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 2,
    color: '#1f2937',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 15,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#4b5563',
    marginBottom: 6,
  },
  bold: {
    fontWeight: 'bold',
  },
  text: {
    marginBottom: 2,
    color: '#374151',
    lineHeight: 1.4,
  },
  // Table styles
  table: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#111827',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
    minHeight: 30,
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: 8,
    minHeight: 30,
  },
  tableCell: {
    color: '#374151',
    fontSize: 9,
  },
  colNo: { width: '6%', textAlign: 'center' },
  colProduct: { width: '34%' },
  colMrp: { width: '15%', textAlign: 'center' },
  colPreGst: { width: '15%', textAlign: 'center' },
  colQty: { width: '10%', textAlign: 'center' },
  colAmount: { width: '20%', textAlign: 'center' },
  // Totals
  totalsContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  totalsBox: {
    width: 200,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    color: '#6b7280',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Terms
  termsSection: {
    marginBottom: 12,
  },
  termItem: {
    marginBottom: 1,
    color: '#374151',
    lineHeight: 1.4,
  },
  // Bank details
  bankBox: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  // Footer
  footer: {
    textAlign: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerLink: {
    color: '#6b7280',
    fontSize: 9,
  },
  configItem: {
    marginLeft: 10,
    marginTop: 2,
    fontSize: 8,
    color: '#4b5563',
  },
});

interface InvoicePdfTemplateProps {
  data: InvoiceData;
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseConfigItems = (config: string | string[] | undefined): string[] => {
  if (!config) return [];
  const configStr = typeof config === 'string' ? config : config.join(' ');
  const matches = configStr.match(/\(\d+\)\s*[^|()]+/g);
  if (matches) {
    return matches.map(m => m.trim());
  }
  return [];
};

export const InvoicePdfTemplate = ({ data }: InvoicePdfTemplateProps) => {
  const { invoice, items, totals } = data;

  const seller = data.seller || {
    name: "Loopify World Private Ltd",
    address: "103-B, Anand Commercial Compound, Gandhi Nagar, LBS Marg, Vikhroli West, Mumbai - 400083",
    gst: "27AAECL4397C1ZF",
  };

  const bankDetails = data.bankDetails || {
    bankName: "ICICI Bank Ltd",
    accountNumber: "002005040537",
    ifsc: "ICIC0000020",
    branch: "Powai, Mumbai"
  };

  const terms = data.terms || [
    "Prices are inclusive of all taxes, branding and shipping as mentioned above.",
    "Client to share the address, mobile numbers and email ids for dispatch.",
    "Loopify team will dispatch hampers within 10-11 days from receipt of advance for order confirmation and approval on mock-ups. While we take all efforts to neutralise it, Loopify won't be responsible in case of unforeseen delays in delivery because of on ground issues, if any.",
    "The total invoice value, inclusive of GST, must be paid as per the agreed terms. Withholding or delaying the GST component is not permitted. Loopify will hold dispatch until the full amount is received."
  ];

  const paymentTerms = [
    "50% advance payment at the time of order confirmation.",
    "50% balance payment before dispatch"
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.text}><Text style={styles.bold}>Invoice Number:</Text> {invoice.invoiceNumber}</Text>
            <Text style={styles.text}><Text style={styles.bold}>Invoice Date:</Text> {invoice.invoiceDate}</Text>
          </View>
          <Image src={loopifyLogo} style={styles.logo} />
        </View>

        {/* Title */}
        <Text style={styles.title}>PROFORMA INVOICE</Text>
        <View style={styles.separator} />

        {/* Seller & Buyer Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Seller:</Text>
            <Text style={[styles.text, styles.bold]}>{seller.name}</Text>
            <Text style={styles.text}>{seller.address}</Text>
            <Text style={styles.text}>GST # : {seller.gst}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Billing Address:</Text>
            <Text style={styles.text}>{invoice.billingAddress || "N/A"}</Text>
            {invoice.gst && <Text style={[styles.text, { marginTop: 8 }]}>GST IN: {invoice.gst}</Text>}
            <Text style={styles.text}>Contact person: {invoice.contactPerson || "-"}</Text>
            <Text style={styles.text}>Mobile: {invoice.mobile || "-"}</Text>
            <Text style={styles.text}>Email: {invoice.email || "-"}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>No</Text>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Product</Text>
            <Text style={[styles.tableHeaderCell, styles.colMrp]}>MRP (Rs)</Text>
            <Text style={[styles.tableHeaderCell, styles.colPreGst]}>Pre GST Price (Rs)</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount (Rs)</Text>
          </View>
          {items.map((item, index) => {
            const gstPercent = item.gst || 0;
            const preTaxAmount = item.pre_tax_price || 0;
            const mrp = preTaxAmount * (1 + gstPercent / 100);
            const amount = mrp * (item.qty_sold || 1);
            const configItems = parseConfigItems(item.gh_config);
            const isLast = index === items.length - 1;

            return (
              <View key={item.id || index} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
                <View style={styles.colProduct}>
                  <Text style={[styles.tableCell, styles.bold]}>{item.gift_hamper_name}</Text>
                  {configItems.map((configItem, idx) => (
                    <Text key={idx} style={styles.configItem}>• {configItem}</Text>
                  ))}
                </View>
                <Text style={[styles.tableCell, styles.colMrp]}>{formatCurrency(mrp)}</Text>
                <Text style={[styles.tableCell, styles.colPreGst]}>{formatCurrency(preTaxAmount)}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.qty_sold}</Text>
                <Text style={[styles.tableCell, styles.colAmount, styles.bold]}>{formatCurrency(amount)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxable amount:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.taxableAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.taxAmount)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalText}>TOTAL:</Text>
              <Text style={styles.grandTotalText}>{formatCurrency(totals.grandTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>TERMS:</Text>
          {terms.map((term, index) => (
            <Text key={index} style={styles.termItem}>• {term}</Text>
          ))}
        </View>

        {/* Payment Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>PAYMENT TERMS:</Text>
          {paymentTerms.map((term, index) => (
            <Text key={index} style={styles.termItem}>• {term}</Text>
          ))}
        </View>

        {/* Bank Details */}
        <View style={styles.bankBox}>
          <Text style={styles.sectionTitle}>BANK DETAILS:</Text>
          <Text style={styles.text}><Text style={styles.bold}>Account Name:</Text> LOOPIFY WORLD PVT LTD</Text>
          <Text style={styles.text}><Text style={styles.bold}>Bank Name:</Text> {bankDetails.bankName}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Bank Account number:</Text> {bankDetails.accountNumber}</Text>
          <Text style={styles.text}><Text style={styles.bold}>IFSC Code:</Text> {bankDetails.ifsc}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Branch:</Text> {bankDetails.branch}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLink}>www.loopify.world</Text>
        </View>
      </Page>
    </Document>
  );
};
