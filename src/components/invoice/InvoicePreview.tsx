import { forwardRef } from 'react';
import { InvoiceData } from '@/types/invoice';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import loopifyLogo from '@/assets/loopify-logo.jpg';

interface InvoicePreviewProps {
  data: InvoiceData;
}

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
        {/* Header with Logo and Invoice Info */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-semibold">Invoice Number:</span> {invoice.invoiceNumber}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Invoice Date:</span> {invoice.invoiceDate}
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
              <p className="font-bold">{defaultSeller.name}</p>
              <p className="whitespace-pre-line text-gray-700">{defaultSeller.address}</p>
              <p className="text-gray-700">GST # : {defaultSeller.gst}</p>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Billing Address:</h3>
            <div className="space-y-1 text-sm">
              <p className="whitespace-pre-line text-gray-700">{invoice.billingAddress || "N/A"}</p>
              {invoice.gst && <p className="text-gray-700">GST IN: {invoice.gst}</p>}
              {invoice.contactPerson && <p className="text-gray-700">Contact person: {invoice.contactPerson}</p>}
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
                <TableHead className="text-right font-semibold text-black">Pre GST Price (Rs)</TableHead>
                <TableHead className="text-center font-semibold text-black">GST %</TableHead>
                <TableHead className="text-center font-semibold text-black">Qty</TableHead>
                <TableHead className="text-right font-semibold text-black">Amount (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {items.map((item, index) => {
                const gstPercent = item.gst || 0;
                const preTaxAmount = item.pre_tax_price || 0;
                const priceWithGst = preTaxAmount + (preTaxAmount * gstPercent / 100);
                const amount = priceWithGst * (item.qty_sold || 1);
                
                // Parse gh_config into bullet points if it contains multiple items
                const configItems = item.gh_config 
                  ? item.gh_config.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
                  : [];
                
                return (
                  <TableRow key={item.id || index} className="border-b">
                    <TableCell className="text-center align-top">{index + 1}</TableCell>
                    <TableCell className="align-top">
                      <div className="font-bold">{item.gift_hamper_name}</div>
                      {configItems.length > 0 && (
                        <ul className="mt-2 ml-4 list-disc text-sm text-gray-700 space-y-1">
                          {configItems.map((configItem, idx) => (
                            <li key={idx}>{configItem}</li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                    <TableCell className="text-right align-top">{formatCurrency(preTaxAmount)}</TableCell>
                    <TableCell className="text-center align-top">{gstPercent}%</TableCell>
                    <TableCell className="text-center align-top">{item.qty_sold}</TableCell>
                    <TableCell className="text-right font-medium align-top">{formatCurrency(amount)}</TableCell>
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
