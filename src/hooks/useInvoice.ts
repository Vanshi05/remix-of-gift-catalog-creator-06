import { useState, useCallback } from 'react';
import { InvoiceData, RecentInvoice } from '@/types/invoice';

export function useInvoice() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async (invoiceNumber: string) => {
    if (!invoiceNumber.trim()) {
      setError('Please enter an invoice number');
      return;
    }

    setLoading(true);
    setError(null);
    setInvoiceData(null);

    try {
      const response = await fetch(`/api/invoice/data?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to fetch invoice');
        return;
      }

      setInvoiceData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentInvoices = useCallback(async () => {
    try {
      const response = await fetch('/api/invoice/list');
      const result = await response.json();

      if (result.success) {
        setRecentInvoices(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch recent invoices:', err);
    }
  }, []);

  const fetchForPdf = useCallback(async (invoiceNumber: string): Promise<InvoiceData | null> => {
    try {
      const response = await fetch(`/api/invoice/pdf?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch invoice for PDF');
      }

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice for PDF');
      return null;
    }
  }, []);

  const clearInvoice = useCallback(() => {
    setInvoiceData(null);
    setError(null);
  }, []);

  return {
    invoiceData,
    recentInvoices,
    loading,
    error,
    fetchInvoice,
    fetchRecentInvoices,
    fetchForPdf,
    clearInvoice
  };
}
