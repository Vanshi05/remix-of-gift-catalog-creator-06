import { forwardRef } from 'react';
import { InvoiceData } from '@/types/invoice';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import loopifyLogo from '@/assets/loopify-logo.jpg';

interface InvoicePreviewProps {
  data: InvoiceData;
}

// Editable span component for inline editing
const EditableText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span
    contentEditable
    suppressContentEditableWarning
    className={`outline-none focus:bg-yellow-100 focus:px-1 rounded ${className}`}
  >
    {children}
  </span>
);

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    const { invoice, items, totals, seller, bankDetails, terms } = data;

    const defaultSeller = seller || {
      name: "Loopify World Private Ltd",
      address: "103-B, Anand Commercial Compound, Gandhi Nagar, LBS Marg, Vikhroli West, Mumbai - 400083",
      gst: "27AAECL4397C1ZF",
      phone: "+91 XXXXXXXXXX",
      email: "contact@loopify.world"
    };

    const defaultBankDetails = bankDetails || {
      bankName: "ICICI Bank Ltd",
      accountNumber: "002005040537",
      ifsc: "ICIC0000020",
      branch: "Powai, Mumbai"
    };

    const defaultTerms = terms || [
      "Prices are inclusive of all taxes, branding and shipping as mentioned above.",
      "Client to share the address, mobile numbers and email ids for dispatch.",
      "Loopify team will dispatch hampers within 10-11 days from receipt of advance for order confirmation and approval on mock-ups. While we take all efforts to neutralise it, Loopify won't be responsible in case of unforeseen delays in delivery because of on ground issues, if any.",
      "The total invoice value, inclusive of GST, must be paid as per the agreed terms. Withholding or delaying the GST component is not permitted. Loopify will hold dispatch until the full amount is received."
    ];

    const paymentTerms = [
      "50% advance payment at the time of order confirmation.",
      "50% balance payment before dispatch"
    ];

    const formatCurrency = (amount: number) => {
      return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
      <Card ref={ref} className="p-8 bg-white text-black print:shadow-none" id="invoice-preview">
        {/* Editable hint */}
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 print:hidden">
          💡 Click on any text to edit it directly. Changes will be reflected in the PDF.
        </div>
        
        {/* Header with Logo and Invoice Info */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-semibold">Invoice Number:</span> <EditableText>{invoice.invoiceNumber}</EditableText>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Invoice Date:</span> <EditableText>{invoice.invoiceDate}</EditableText>
            </p>
          </div>
          <img src={loopifyLogo} alt="Loopify Logo" className="h-16 object-contain" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800">PROFORMA INVOICE</h1>
        </div>

        <Separator className="my-4" />

        {/* Seller & Buyer Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Seller Info */}
          <div>
            <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Seller:</h3>
            <div className="space-y-1 text-sm">
              <p className="font-bold"><EditableText>{defaultSeller.name}</EditableText></p>
              <p className="whitespace-pre-line text-gray-700"><EditableText>{defaultSeller.address}</EditableText></p>
              <p className="text-gray-700">GST # : <EditableText>{defaultSeller.gst}</EditableText></p>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Billing Address:</h3>
            <div className="space-y-1 text-sm">
              <p className="whitespace-pre-line text-gray-700"><EditableText>{invoice.billingAddress || "N/A"}</EditableText></p>
              
              {invoice.gst && <p className="text-gray-700 mt-3">GST IN: <EditableText>{invoice.gst}</EditableText></p>}
              <p className="text-gray-700">Contact person: <EditableText>{invoice.contactPerson || "-"}</EditableText></p>
              <p className="text-gray-700">Mobile: <EditableText>{invoice.mobile || "-"}</EditableText></p>
              <p className="text-gray-700">Email: <EditableText>{invoice.email || "-"}</EditableText></p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6 border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-12 text-center font-semibold text-black">No</TableHead>
                <TableHead className="font-semibold text-black">Product</TableHead>
                <TableHead className="text-center font-semibold text-black">MRP (Rs)</TableHead>
                <TableHead className="text-center font-semibold text-black">Pre GST Price (Rs)</TableHead>
                <TableHead className="text-center font-semibold text-black">Qty</TableHead>
                <TableHead className="text-center font-semibold text-black">Amount (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {items.map((item, index) => {
                const gstPercent = item.gst || 0;
                const preTaxAmount = item.pre_tax_price || 0;
                // MRP = pre_gst_price * (1 + gst/100)
                const mrp = preTaxAmount * (1 + gstPercent / 100);
                // Amount = MRP * qty (tax-inclusive)
                const amount = mrp * (item.qty_sold || 1);
                
                // Parse gh_config to extract only item names with quantities
                // Format: "(1) item-name | pr_xxx | xx (2) item-name | pr_xxx | xx"
                // We want: "(1) item-name" for each item
                const parseConfigItems = (config: string | string[] | undefined): string[] => {
                  if (!config) return [];
                  const configStr = typeof config === 'string' ? config : config.join(' ');
                  // Match pattern: (number) item-name (stops before | or next parenthesis)
                  const matches = configStr.match(/\(\d+\)\s*[^|()]+/g);
                  if (matches) {
                    return matches.map(m => m.trim());
                  }
                  return [];
                };
                
                const configItems = parseConfigItems(item.gh_config);
                
                return (
                  <TableRow key={item.id || index} className="border-b">
                    <TableCell className="text-center align-top">{index + 1}</TableCell>
                    <TableCell className="align-top">
                      <div className="font-bold"><EditableText>{item.gift_hamper_name}</EditableText></div>
                      {configItems.length > 0 && (
                        <ul className="mt-2 ml-4 list-disc text-sm text-gray-700 space-y-1">
                          {configItems.map((configItem, idx) => (
                            <li key={idx}><EditableText>{configItem}</EditableText></li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                    <TableCell className="text-center align-top"><EditableText>{formatCurrency(mrp)}</EditableText></TableCell>
                    <TableCell className="text-center align-top"><EditableText>{formatCurrency(preTaxAmount)}</EditableText></TableCell>
                    <TableCell className="text-center align-top"><EditableText>{item.qty_sold}</EditableText></TableCell>
                    <TableCell className="text-center font-medium align-top"><EditableText>{formatCurrency(amount)}</EditableText></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-72 space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxable amount:</span>
              <span className="font-medium">{formatCurrency(totals.taxableAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL:</span>
              <span>{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Terms */}
        <div className="mb-6">
          <h3 className="font-bold text-sm uppercase text-gray-800 mb-3">TERMS:</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            {defaultTerms.map((term, index) => (
              <li key={index} className="leading-relaxed">{term}</li>
            ))}
          </ul>
        </div>

        {/* Payment Terms */}
        <div className="mb-6">
          <h3 className="font-bold text-sm uppercase text-gray-800 mb-3">PAYMENT TERMS:</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            {paymentTerms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>

        {/* Bank Details */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-sm uppercase text-gray-800 mb-3">BANK DETAILS:</h3>
          <div className="text-sm space-y-1 text-gray-700">
            <p><span className="font-medium">Account Name:</span> LOOPIFY WORLD PVT LTD</p>
            <p><span className="font-medium">Bank Name:</span> {defaultBankDetails.bankName}</p>
            <p><span className="font-medium">Bank Account number:</span> {defaultBankDetails.accountNumber}</p>
            <p><span className="font-medium">IFSC Code:</span> {defaultBankDetails.ifsc}</p>
            <p><span className="font-medium">Branch:</span> {defaultBankDetails.branch}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t">
          <a href="https://www.loopify.world" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700 underline">
            www.loopify.world
          </a>
        </div>
      </Card>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
