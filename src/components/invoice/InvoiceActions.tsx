import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceActionsProps {
  invoiceData: InvoiceData;
}

export function InvoiceActions({ invoiceData }: InvoiceActionsProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const element = document.getElementById('invoice-preview');
      if (!element) {
        throw new Error('Invoice preview not found');
      }

      // A4 landscape dimensions in pixels at 96 DPI: 1123 x 794
      // We'll use a fixed width for consistent rendering
      const fixedWidth = 1123;
      
      // Store original styles
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      const originalMaxWidth = element.style.maxWidth;
      
      // Set fixed width for consistent capture
      element.style.width = `${fixedWidth}px`;
      element.style.minWidth = `${fixedWidth}px`;
      element.style.maxWidth = `${fixedWidth}px`;

      // Capture the invoice as canvas with fixed width
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: fixedWidth,
        windowWidth: fixedWidth
      });

      // Restore original styles
      element.style.width = originalWidth;
      element.style.minWidth = originalMinWidth;
      element.style.maxWidth = originalMaxWidth;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 297mm for A4 landscape
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm for A4 landscape
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate ratio to fit content within page with margins
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = margin;

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
    </div>
  );
}
