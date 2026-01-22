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
    const { invoice, items, totals, seller, bankDetails, terms, paymentTerms } = data;

    const formatCurrency = (amount: number) => {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        });
      } catch {
        return dateStr;
      }
    };

    return (
      <Card ref={ref} className="p-8 bg-white text-black print:shadow-none max-w-4xl mx-auto" id="invoice-preview">
        {/* Header with Invoice Number and Date */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">Invoice Number: {invoice.invoiceNumber}</h2>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">Invoice Date: {formatDate(invoice.invoiceDate)}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-primary">PROFORMA INVOICE</h1>
        </div>

        <Separator className="my-4" />

        {/* Seller & Buyer Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Seller Info */}
          <div>
            <h3 className="font-bold text-sm uppercase text-gray-700 mb-2">Seller:</h3>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-base">{seller.name}</p>
              <p className="whitespace-pre-line text-gray-700">{seller.address}</p>
              <p className="font-medium">GST # : {seller.gst}</p>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="font-bold text-sm uppercase text-gray-700 mb-2">Billing Address:</h3>
            <div className="space-y-1 text-sm">
              <p className="whitespace-pre-line font-medium">{invoice.billingAddress || "N/A"}</p>
              {invoice.gst && <p className="font-medium">GST IN: {invoice.gst}</p>}
              {invoice.contactPerson && (
                <p className="mt-2">Contact person: {invoice.contactPerson}</p>
              )}
              {invoice.contactMobile && (
                <p>Mobile: {invoice.contactMobile}</p>
              )}
              {invoice.contactEmail && (
                <p>Email: {invoice.contactEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6 border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-12 text-center font-bold border-r">No</TableHead>
                <TableHead className="font-bold border-r">Product</TableHead>
                <TableHead className="text-right font-bold border-r w-24">MRP (Rs)</TableHead>
                <TableHead className="text-right font-bold border-r w-32">Pre GST Price (Rs)</TableHead>
                <TableHead className="text-center font-bold border-r w-16">Qty</TableHead>
                <TableHead className="text-right font-bold w-28">Amount (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <>
                  <TableRow key={item.id || index} className="border-b">
                    <TableCell className="text-center border-r align-top">{index + 1}</TableCell>
                    <TableCell className="font-medium border-r">
                      <p className="font-bold">{item.gift_hamper_name}</p>
                    </TableCell>
                    <TableCell className="text-right border-r align-top">
                      {formatCurrency(item.mrp || 0).replace('₹', '')}
                    </TableCell>
                    <TableCell className="text-right border-r align-top">
                      {formatCurrency(item.pre_tax_price || 0).replace('₹', '')}
                    </TableCell>
                    <TableCell className="text-center border-r align-top">{item.qty_sold}</TableCell>
                    <TableCell className="text-right font-medium align-top">
                      {formatCurrency(item.amount || (item.pre_tax_price * item.qty_sold)).replace('₹', '')}
                    </TableCell>
                  </TableRow>
                  {/* Product description row */}
                  {item.gh_config && (
                    <TableRow key={`${item.id}-desc`} className="border-b bg-gray-50">
                      <TableCell className="border-r"></TableCell>
                      <TableCell colSpan={5} className="text-sm text-gray-600 italic pl-4">
                        {item.gh_config}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-80 space-y-2 border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Taxable amount:</span>
              <span>{formatCurrency(totals.taxableAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Tax:</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
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
          <h3 className="font-bold text-sm uppercase text-gray-700 mb-2">TERMS:</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            {terms.map((term, index) => (
              <li key={index} className="leading-relaxed">{term}</li>
            ))}
          </ul>
        </div>

        {/* Payment Terms */}
        {paymentTerms && paymentTerms.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase text-gray-700 mb-2">PAYMENT TERMS:</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              {paymentTerms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        )}

        <Separator className="my-6" />

        {/* Bank Details */}
        <div className="mb-6">
          <h3 className="font-bold text-sm uppercase text-gray-700 mb-2">BANK DETAILS:</h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Account Name:</span> {bankDetails.accountName}</p>
            <p><span className="font-medium">Bank Name:</span> {bankDetails.bankName}</p>
            <p><span className="font-medium">Bank Account number:</span> {bankDetails.accountNumber}</p>
            <p><span className="font-medium">IFSC Code:</span> {bankDetails.ifsc}</p>
            <p><span className="font-medium">Branch:</span> {bankDetails.branch}</p>
            {bankDetails.location && (
              <p><span className="font-medium">Location (City):</span> {bankDetails.location}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t">
          <p className="text-sm text-primary font-medium">www.loopify.world</p>
        </div>
      </Card>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
