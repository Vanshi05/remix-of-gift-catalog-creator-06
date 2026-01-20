import { forwardRef } from 'react';
import { InvoiceData } from '@/types/invoice';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    const { invoice, items, totals, seller, bankDetails, terms } = data;

    const defaultSeller = seller || {
      name: "Your Company Name",
      address: "Your Company Address, City, State - Pincode",
      gst: "GSTIN: XXXXXXXXXXXXXXX",
      phone: "+91 XXXXXXXXXX",
      email: "contact@yourcompany.com"
    };

    const defaultBankDetails = bankDetails || {
      bankName: "Bank Name",
      accountNumber: "XXXXXXXXXXXX",
      ifsc: "XXXXXXXXXXX",
      branch: "Branch Name"
    };

    const defaultTerms = terms || [
      "Payment is due within 30 days of invoice date",
      "Please include invoice number in payment reference",
      "Goods once sold will not be taken back or exchanged"
    ];

    return (
      <Card ref={ref} className="p-8 bg-white text-black print:shadow-none" id="invoice-preview">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Tax Invoice</h1>
        </div>

        <Separator className="my-4" />

        {/* Seller & Buyer Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Seller Info */}
          <div>
            <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Sold By</h3>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-lg">{defaultSeller.name}</p>
              <p className="whitespace-pre-line">{defaultSeller.address}</p>
              <p>{defaultSeller.gst}</p>
              <p>Phone: {defaultSeller.phone}</p>
              <p>Email: {defaultSeller.email}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div>
            <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Bill To</h3>
            <div className="space-y-1 text-sm">
              <p className="whitespace-pre-line">{invoice.billingAddress || "N/A"}</p>
              {invoice.gst && <p>GSTIN: {invoice.gst}</p>}
              {invoice.contactPerson && <p>Contact: {invoice.contactPerson}</p>}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-6 bg-gray-50 p-4 rounded">
          <div>
            <p className="text-sm"><span className="font-semibold">Invoice No:</span> {invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-sm"><span className="font-semibold">Invoice Date:</span> {invoice.invoiceDate}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Product / Gift Hamper</TableHead>
                <TableHead className="text-right">MRP</TableHead>
                <TableHead className="text-right">Pre GST Price</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">GST %</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const amount = (item.pre_tax_price || 0) * (item.qty_sold || 1);
                return (
                  <TableRow key={item.id || index}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.gift_hamper_name}</TableCell>
                    <TableCell className="text-right">₹{(item.mrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">₹{(item.pre_tax_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-center">{item.qty_sold}</TableCell>
                    <TableCell className="text-right">{item.gst}%</TableCell>
                    <TableCell className="text-right font-medium">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taxable Amount:</span>
              <span>₹{totals.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST:</span>
              <span>₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total:</span>
              <span>₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bank Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Bank Details</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Bank:</span> {defaultBankDetails.bankName}</p>
              <p><span className="font-medium">A/C No:</span> {defaultBankDetails.accountNumber}</p>
              <p><span className="font-medium">IFSC:</span> {defaultBankDetails.ifsc}</p>
              <p><span className="font-medium">Branch:</span> {defaultBankDetails.branch}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Terms & Conditions</h3>
            <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
              {defaultTerms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t">
          <p className="text-sm text-gray-500">Thank you for your business!</p>
        </div>
      </Card>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
