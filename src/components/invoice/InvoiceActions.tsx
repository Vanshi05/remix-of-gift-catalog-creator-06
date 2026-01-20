import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Copy, Loader2, CheckCircle } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceActionsProps {
  invoiceData: InvoiceData;
}

export function InvoiceActions({ invoiceData }: InvoiceActionsProps) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const element = document.getElementById('invoice-preview');
      if (!element) {
        throw new Error('Invoice preview not found');
      }

      // Capture the invoice as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Invoice-${invoiceData.invoice.invoiceNumber}.pdf`);

      toast({
        title: "PDF Generated",
        description: `Invoice ${invoiceData.invoice.invoiceNumber} has been downloaded.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/invoice?number=${encodeURIComponent(invoiceData.invoice.invoiceNumber)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Invoice share link copied to clipboard."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={generatePDF} disabled={generating}>
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <FileDown className="h-4 w-4 mr-2" />
        )}
        {generating ? 'Generating...' : 'Download PDF'}
      </Button>

      <Button variant="outline" onClick={copyShareLink}>
        {copied ? (
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {copied ? 'Copied!' : 'Copy Share Link'}
      </Button>
    </div>
  );
}
