import { useState, useRef } from "react";
import { CatalogForm, CatalogPageData } from "@/components/CatalogForm";
import { CatalogPreview } from "@/components/CatalogPreview";
import { MultiPagePreview } from "@/components/MultiPagePreview";
import { Button } from "@/components/ui/button";
import { Download, Eye, Sparkles, ChevronLeft, ChevronRight, FileText, Presentation } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import PptxGenJS from "pptxgenjs";
import { toast } from "sonner";

const createEmptyPage = (): CatalogPageData => ({
  id: crypto.randomUUID(),
  type: "template",
  image: null,
  title: "",
  description: "",
  items: [""],
  plasticPercent: "",
  carbonPercent: "",
});

const Index = () => {
  const multiPageRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  
  const [pages, setPages] = useState<CatalogPageData[]>([createEmptyPage()]);

  const activePage = pages[activePageIndex];

  const handleDownloadPDF = async () => {
    if (!multiPageRef.current) return;

    const invalidPages = pages.filter((p) => !p.image);
    if (invalidPages.length > 0) {
      toast.error(`Please add an image to all ${pages.length} pages`);
      return;
    }

    setIsGenerating(true);

    try {
      const nodes = Array.from(
        multiPageRef.current.querySelectorAll<HTMLElement>(".pdf-page")
      );

      const pdf = new jsPDF({
        unit: "px",
        format: [1200, 630],
        orientation: "landscape",
      });

      for (let i = 0; i < nodes.length; i++) {
        const canvas = await html2canvas(nodes[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: 1200,
          height: 630,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);

        if (i > 0) pdf.addPage([1200, 630], "landscape");
        pdf.addImage(imgData, "JPEG", 0, 0, 1200, 630);
      }

      pdf.save(`catalog_${pages.length}_pages.pdf`);
      toast.success(`PDF with ${pages.length} page(s) downloaded!`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPPT = async () => {
    const invalidPages = pages.filter((p) => !p.image);
    if (invalidPages.length > 0) {
      toast.error(`Please add an image to all ${pages.length} pages`);
      return;
    }

    setIsGenerating(true);

    try {
      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: 'CATALOG', width: 10, height: 5.25 });
      pptx.layout = 'CATALOG';

      // Helper to get image props for PptxGenJS
      const getImageProps = (imageSrc: string) => {
        // Check if it's a base64 data URI
        if (imageSrc.startsWith('data:')) {
          return { data: imageSrc };
        }
        // Otherwise it's a URL
        return { path: imageSrc };
      };

      for (const page of pages) {
        const slide = pptx.addSlide();
        
        // White background
        slide.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: 'FFFFFF' } });

        const imageProps = getImageProps(page.image!);

        if (page.type === "full-image") {
          slide.addImage({
            ...imageProps,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
          });
        } else {
          // Layout: Image 65%, Content 35% with overlapping white card
          const slideW = 10;
          const slideH = 5.25;
          const imageW = 6.5; // 65%
          const contentW = 3.5; // 35%
          const beigeX = imageW;
          const whiteCardOverlap = 0.3;
          const cardMarginY = 0.3;
          const cardMarginRight = 0.2;
          
          // Left side: Image (65% width)
          slide.addImage({
            ...imageProps,
            x: 0,
            y: 0,
            w: imageW,
            h: slideH,
          });

          // Right side beige background
          slide.addShape('rect', { 
            x: beigeX, 
            y: 0, 
            w: contentW, 
            h: slideH, 
            fill: { color: 'EDE2D6' } 
          });

          // White content card (overlaps image slightly)
          const whiteCardX = beigeX - whiteCardOverlap;
          const whiteCardW = contentW - cardMarginRight + whiteCardOverlap;
          const whiteCardY = cardMarginY;
          const whiteCardH = slideH - (cardMarginY * 2);
          
          slide.addShape('rect', { 
            x: whiteCardX, 
            y: whiteCardY, 
            w: whiteCardW, 
            h: whiteCardH, 
            fill: { color: 'FFFFFF' },
            shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 },
          });

          // Content positioning within white card
          const contentX = whiteCardX + 0.25;
          const contentW2 = whiteCardW - 0.5;

          // Title - Asap font, brown #7a6451
          slide.addText(page.title || "Hamper Title", {
            x: contentX,
            y: whiteCardY + 0.25,
            w: contentW2,
            h: 0.5,
            fontSize: 18,
            bold: true,
            color: '7A6451',
            fontFace: 'Asap',
          });

          // Description
          let currentY = whiteCardY + 0.8;
          if (page.description) {
            slide.addText(page.description, {
              x: contentX,
              y: currentY,
              w: contentW2,
              h: 0.7,
              fontSize: 10,
              color: '7A6451',
              fontFace: 'Asap',
              lineSpacing: 12,
            });
            currentY += 0.75;
          }

          // Items as bullet list
          const bulletItems = page.items
            .filter(item => item)
            .map(item => ({ 
              text: item, 
              options: { 
                bullet: { type: 'bullet' as const },
                color: '7A6451',
                fontSize: 10,
                fontFace: 'Asap',
              } 
            }));

          if (bulletItems.length > 0) {
            slide.addText(bulletItems, {
              x: contentX,
              y: currentY,
              w: contentW2,
              h: 2.0,
              valign: 'top',
              lineSpacing: 14,
            });
          }

          // Footer section at bottom of white card
          const footerY = whiteCardY + whiteCardH - 0.8;
          
          // Divider line
          slide.addShape('line', {
            x: contentX,
            y: footerY - 0.1,
            w: contentW2,
            h: 0,
            line: { color: 'E0E0E0', width: 0.5 },
          });

          // Eco stats - green italic
          const ecoText = `${page.plasticPercent || "80"}% less plastic pollution | ${page.carbonPercent || "71"}% less carbon emissions`;
          slide.addText(ecoText, {
            x: contentX,
            y: footerY,
            w: contentW2,
            h: 0.25,
            fontSize: 10,
            italic: true,
            color: '2D6A4F',
            fontFace: 'Asap',
          });

          // Pricing section
          const salePrice = page.preTaxPrice;
          const originalPrice = salePrice ? Math.round(salePrice * 1.33) : null;
          
          const priceTextParts: Array<{ text: string; options: Record<string, unknown> }> = [];
          
          if (originalPrice) {
            priceTextParts.push({
              text: `MRP ${originalPrice.toLocaleString('en-IN')}`,
              options: { 
                strike: true, 
                fontSize: 10, 
                color: '7A6451',
                fontFace: 'Asap',
              }
            });
            priceTextParts.push({
              text: '  ',
              options: { fontSize: 10 }
            });
          }
          
          priceTextParts.push({
            text: salePrice ? `₹${salePrice.toLocaleString('en-IN')}` : '₹750',
            options: { 
              bold: true, 
              fontSize: 10, 
              color: '7A6451',
              fontFace: 'Asap',
            }
          });
          
          priceTextParts.push({
            text: '   Bulk pricing | Tax & shipping extra',
            options: { 
              fontSize: 10, 
              color: '7A6451',
              fontFace: 'Asap',
            }
          });

          slide.addText(priceTextParts, {
            x: contentX,
            y: footerY + 0.25,
            w: contentW2,
            h: 0.35,
            valign: 'middle',
          });
        }
      }

      await pptx.writeFile({ fileName: `catalog_${pages.length}_pages.pptx` });
      toast.success(`PowerPoint with ${pages.length} slide(s) downloaded!`);
    } catch (error) {
      console.error("Error generating PPT:", error);
      toast.error("Failed to generate PowerPoint. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const goToPrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
    }
  };

  const goToNextPage = () => {
    if (activePageIndex < pages.length - 1) {
      setActivePageIndex(activePageIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">∞</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Catalog Generator</h1>
              <p className="text-xs text-muted-foreground">Create multi-page PDF catalogs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              variant="outline"
              className="gap-2"
            >
              {isGenerating ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              PDF
            </Button>
            <Button
              onClick={handleDownloadPPT}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md"
            >
              {isGenerating ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Presentation className="h-4 w-4" />
              )}
              PPT ({pages.length})
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[380px,1fr] gap-8">
          {/* Form Section */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <CatalogForm 
              pages={pages} 
              activePageIndex={activePageIndex}
              onPagesChange={setPages} 
              onActivePageChange={setActivePageIndex}
            />
          </aside>

          {/* Preview Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>Live Preview</span>
              </div>
              
              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={activePageIndex === 0}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[80px] text-center">
                  Page {activePageIndex + 1} of {pages.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={activePageIndex === pages.length - 1}
                  className="h-8 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Single Page Preview */}
            <div className="catalog-preview rounded-xl overflow-hidden border border-border/50">
              <div className="overflow-x-auto">
                <CatalogPreview page={activePage} />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Previewing page {activePageIndex + 1}. All {pages.length} pages will be included in PDF.
            </p>

            {/* Page Thumbnails */}
            {pages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => setActivePageIndex(index)}
                    className={`relative shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      index === activePageIndex 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  >
                    {page.image ? (
                      <img src={page.image} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        page.type === "full-image" ? "bg-accent/20" : "bg-secondary/50"
                      }`}>
                        <span className="text-xs text-muted-foreground">
                          {page.type === "full-image" ? "🖼️" : index + 1}
                        </span>
                      </div>
                    )}
                    <div className={`absolute bottom-0 left-0 right-0 text-primary-foreground text-[10px] text-center py-0.5 ${
                      page.type === "full-image" ? "bg-accent/80" : "bg-foreground/70"
                    }`}>
                      {page.type === "full-image" 
                        ? "Full Image" 
                        : (page.title ? page.title.slice(0, 10) + (page.title.length > 10 ? '...' : '') : `Page ${index + 1}`)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Hidden multi-page container for PDF generation */}
      <div className="fixed left-0 top-0 opacity-0 pointer-events-none -z-10">
        <MultiPagePreview ref={multiPageRef} pages={pages} />
      </div>
      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="max-w-[1800px] mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Corporate Gifting Catalog Generator • Made with care for your sales team</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
