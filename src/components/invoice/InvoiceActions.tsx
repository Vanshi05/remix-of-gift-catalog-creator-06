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

      // Hide the edit hint before capturing
      const editHint = element.querySelector('.bg-blue-50.border-blue-200');
      if (editHint) {
        (editHint as HTMLElement).style.display = 'none';
      }

      // A4 portrait dimensions: 210mm x 297mm
      // At 96 DPI: 794 x 1123 pixels
      const fixedWidth = 794;
      
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

      // Restore edit hint visibility
      if (editHint) {
        (editHint as HTMLElement).style.display = '';
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm for A4 portrait
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm for A4 portrait
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Scale to full page width with minimal margins
      const margin = 5;
      const availableWidth = pdfWidth - (margin * 2);
      const ratio = availableWidth / imgWidth;
      
      const imgX = margin;
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
