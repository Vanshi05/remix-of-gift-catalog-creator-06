import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InvoiceSearch } from '@/components/invoice/InvoiceSearch';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { InvoiceActions } from '@/components/invoice/InvoiceActions';
import { useInvoice } from '@/hooks/useInvoice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function InvoiceGenerator() {
  const [searchParams] = useSearchParams();
  const { 
    invoiceData, 
    recentInvoices, 
    loading, 
    error, 
    fetchInvoice, 
    fetchRecentInvoices 
  } = useInvoice();

  useEffect(() => {
    fetchRecentInvoices();
    
    // Auto-fetch if invoice number in URL
    const invoiceNumber = searchParams.get('number');
    if (invoiceNumber) {
      fetchInvoice(invoiceNumber);
    }
  }, [searchParams, fetchRecentInvoices, fetchInvoice]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Invoice Generator</h1>
              <p className="text-muted-foreground">Search, preview, and download invoices</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Invoice</CardTitle>
            <CardDescription>
              Enter an invoice number or select from recent invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceSearch
              onSearch={fetchInvoice}
              recentInvoices={recentInvoices}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Preview */}
        {invoiceData && !loading && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Invoice Preview</h2>
              <InvoiceActions invoiceData={invoiceData} />
            </div>

            {/* Preview */}
            <div className="overflow-auto">
              <InvoicePreview data={invoiceData} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!invoiceData && !loading && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Invoice Selected</h3>
              <p className="text-muted-foreground max-w-sm">
                Enter an invoice number above or select from recent invoices to preview and download.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
