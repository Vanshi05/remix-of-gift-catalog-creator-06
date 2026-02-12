import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Minus, Plus, RefreshCw, FileText, Save, Send, CheckCircle2, RotateCcw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { GeneratedHamper, Feasibility } from "./types";
import React from "react";

interface HamperPreviewProps {
  hamper: GeneratedHamper;
  qtyOverrides: Record<string, number>;
  onAdjustQty: (itemName: string, delta: number) => void;
}

const feasibilityMeta: Record<Feasibility, { label: string; color: string; bg: string }> = {
  green: { label: "Deliverable", color: "text-[hsl(var(--eco-green))]", bg: "bg-[hsl(var(--eco-green)/0.1)]" },
  yellow: { label: "Risk", color: "text-accent", bg: "bg-accent/10" },
  red: { label: "Not Possible", color: "text-destructive", bg: "bg-destructive/10" },
};

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const HamperPreview = ({ hamper, qtyOverrides, onAdjustQty }: HamperPreviewProps) => {
  const pricing = React.useMemo(() => {
    let taxable = 0;
    hamper.items.forEach((i) => {
      taxable += i.unitPrice * (qtyOverrides[i.name] ?? i.qty);
    });
    const tax = Math.round(taxable * (hamper.gstPercent / 100));
    return { taxable, tax, grand: taxable + tax };
  }, [hamper, qtyOverrides]);

  const fMeta = feasibilityMeta[hamper.feasibility];

  const handleAction = (action: string) => {
    toast({ title: action, description: `${hamper.name} — ${fmt(pricing.grand)}` });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Preview image */}
      <Card className="overflow-hidden flex-shrink-0">
        <img src={hamper.image} alt={hamper.name} className="w-full h-36 object-cover" />
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm">{hamper.name}</p>
            <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", fMeta.color, fMeta.bg)}>
              {fMeta.label}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{hamper.confidence}% confidence match</p>
        </CardContent>
      </Card>

      {/* Editable items */}
      <Card className="flex-shrink-0">
        <CardContent className="p-2.5 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Items</p>
          {hamper.items.map((item) => {
            const qty = qtyOverrides[item.name] ?? item.qty;
            return (
              <div key={item.name} className="flex items-center justify-between text-xs gap-1.5">
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-muted-foreground w-14 text-right">{fmt(item.unitPrice)}</span>
                <div className="flex items-center gap-0.5">
                  <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => onAdjustQty(item.name, -1)}>
                    <Minus className="h-2.5 w-2.5" />
                  </Button>
                  <span className="w-5 text-center text-[11px] font-semibold tabular-nums">{qty}</span>
                  <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => onAdjustQty(item.name, 1)}>
                    <Plus className="h-2.5 w-2.5" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                  <RefreshCw className="h-2.5 w-2.5" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pricing summary */}
      <Card className="border-primary/20 flex-shrink-0">
        <CardContent className="p-3 space-y-1 text-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pricing</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxable</span>
            <span className="tabular-nums">{fmt(pricing.taxable)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST ({hamper.gstPercent}%)</span>
            <span className="tabular-nums">{fmt(pricing.tax)}</span>
          </div>
          <div className="border-t border-border pt-1.5 flex justify-between">
            <span className="font-bold text-sm">Grand Total</span>
            <span className="font-bold text-lg text-primary tabular-nums transition-all duration-200">{fmt(pricing.grand)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action bar */}
      <div className="grid grid-cols-2 gap-1.5 flex-shrink-0 lg:sticky lg:bottom-0 bg-background pt-1 pb-1">
        <Button variant="outline" size="sm" className="gap-1 text-[11px] h-8" onClick={() => handleAction("Preview PDF")}>
          <FileText className="h-3.5 w-3.5" /> Preview PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-1 text-[11px] h-8" onClick={() => handleAction("Draft Saved")}>
          <Save className="h-3.5 w-3.5" /> Save Draft
        </Button>
        <Button variant="secondary" size="sm" className="gap-1 text-[11px] h-8" onClick={() => handleAction("Quote Sent")}>
          <Send className="h-3.5 w-3.5" /> Send Quote
        </Button>
        <Button size="sm" className="gap-1 text-[11px] h-8" onClick={() => handleAction("Regenerating...")}>
          <RotateCcw className="h-3.5 w-3.5" /> Regenerate
        </Button>
      </div>
    </div>
  );
};

export default HamperPreview;
