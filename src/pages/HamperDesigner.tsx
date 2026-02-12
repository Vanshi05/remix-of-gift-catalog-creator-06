import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CalendarIcon,
  FileText,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
  Plus,
  RefreshCw,
  Package,
  Zap,
  Star,
  Crown,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────
interface HamperItem {
  name: string;
  qty: number;
  unitPrice: number;
}

interface HamperCard {
  id: string;
  name: string;
  heroProduct: string;
  sideItems: string[];
  totalPrice: number;
  image: string;
  badges: ("LOW STOCK" | "FAST DELIVERY" | "PREMIUM")[];
  items: HamperItem[];
  gstPercent: number;
  recommended?: boolean;
}

// ── Mock Data ────────────────────────────────────────────────────────
const CATEGORIES = [
  "Chocolates & Sweets",
  "Dry Fruits & Nuts",
  "Wellness & Self-Care",
  "Stationery & Desk",
  "Beverages",
  "Eco-Friendly",
];

const BUDGET_PRESETS = [1000, 1500, 2000, 3000];

const ALL_HAMPERS: HamperCard[] = [
  {
    id: "h1",
    name: "Classic Delight Hamper",
    heroProduct: "Artisan Chocolate Box",
    sideItems: ["Almond Brittle", "Honey Jar", "Dried Cranberries", "Green Tea Tin"],
    totalPrice: 1450,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238f0b0?w=400&h=300&fit=crop",
    badges: ["FAST DELIVERY"],
    items: [
      { name: "Artisan Chocolate Box", qty: 1, unitPrice: 550 },
      { name: "Almond Brittle", qty: 2, unitPrice: 180 },
      { name: "Honey Jar", qty: 1, unitPrice: 220 },
      { name: "Dried Cranberries", qty: 1, unitPrice: 140 },
      { name: "Green Tea Tin", qty: 1, unitPrice: 180 },
    ],
    gstPercent: 18,
    recommended: true,
  },
  {
    id: "h2",
    name: "Premium Wellness Box",
    heroProduct: "Organic Superfood Mix",
    sideItems: ["Lavender Candle", "Bamboo Tumbler", "Trail Mix", "Herbal Soap Set"],
    totalPrice: 2200,
    image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop",
    badges: ["PREMIUM"],
    items: [
      { name: "Organic Superfood Mix", qty: 1, unitPrice: 680 },
      { name: "Lavender Candle", qty: 1, unitPrice: 350 },
      { name: "Bamboo Tumbler", qty: 1, unitPrice: 420 },
      { name: "Trail Mix", qty: 2, unitPrice: 190 },
      { name: "Herbal Soap Set", qty: 1, unitPrice: 370 },
    ],
    gstPercent: 18,
  },
  {
    id: "h3",
    name: "Festive Joy Hamper",
    heroProduct: "Diwali Sweets Assortment",
    sideItems: ["Scented Candles Set", "Cashew Clusters", "Masala Chai Box"],
    totalPrice: 1100,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop",
    badges: ["LOW STOCK", "FAST DELIVERY"],
    items: [
      { name: "Diwali Sweets Assortment", qty: 1, unitPrice: 420 },
      { name: "Scented Candles Set", qty: 1, unitPrice: 280 },
      { name: "Cashew Clusters", qty: 1, unitPrice: 220 },
      { name: "Masala Chai Box", qty: 1, unitPrice: 180 },
    ],
    gstPercent: 12,
  },
  {
    id: "b1",
    name: "Budget Friendly Pack",
    heroProduct: "Cookie Tin",
    sideItems: ["Mug", "Tea Bags"],
    totalPrice: 650,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
    badges: ["FAST DELIVERY"],
    items: [
      { name: "Cookie Tin", qty: 1, unitPrice: 300 },
      { name: "Mug", qty: 1, unitPrice: 200 },
      { name: "Tea Bags", qty: 1, unitPrice: 150 },
    ],
    gstPercent: 12,
  },
  {
    id: "b2",
    name: "Luxury Gift Set",
    heroProduct: "Belgian Truffles Box",
    sideItems: ["Wine Glass Set", "Cheese Board", "Gourmet Crackers", "Fig Jam"],
    totalPrice: 3800,
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop",
    badges: ["PREMIUM", "LOW STOCK"],
    items: [
      { name: "Belgian Truffles Box", qty: 1, unitPrice: 1200 },
      { name: "Wine Glass Set", qty: 1, unitPrice: 950 },
      { name: "Cheese Board", qty: 1, unitPrice: 780 },
      { name: "Gourmet Crackers", qty: 1, unitPrice: 450 },
      { name: "Fig Jam", qty: 1, unitPrice: 420 },
    ],
    gstPercent: 18,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────
const badgeStyle = (label: string) => {
  switch (label) {
    case "LOW STOCK":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "FAST DELIVERY":
      return "bg-[hsl(var(--eco-green)/0.12)] text-[hsl(var(--eco-green))] border-[hsl(var(--eco-green)/0.25)]";
    case "PREMIUM":
      return "bg-accent/15 text-accent-foreground border-accent/30";
    default:
      return "";
  }
};

const badgeIcon = (label: string) => {
  switch (label) {
    case "LOW STOCK":
      return <Package className="h-3 w-3" />;
    case "FAST DELIVERY":
      return <Zap className="h-3 w-3" />;
    case "PREMIUM":
      return <Star className="h-3 w-3" />;
    default:
      return null;
  }
};

type Feasibility = "green" | "yellow" | "red";
const feasibilityMeta: Record<Feasibility, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  green: { label: "Deliverable", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-[hsl(var(--eco-green))]", bg: "bg-[hsl(var(--eco-green)/0.1)]" },
  yellow: { label: "Risk", icon: <AlertTriangle className="h-4 w-4" />, color: "text-accent", bg: "bg-accent/10" },
  red: { label: "Not Possible", icon: <XCircle className="h-4 w-4" />, color: "text-destructive", bg: "bg-destructive/10" },
};

const getFeasibility = (hamper: HamperCard): Feasibility => {
  if (hamper.badges.includes("LOW STOCK")) return "yellow";
  if (hamper.totalPrice > 3000) return "red";
  return "green";
};

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ═════════════════════════════════════════════════════════════════════
const HamperDesigner = () => {
  // Filters
  const [budget, setBudget] = useState(3000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();

  // Selection — auto-select first
  const [selectedHamper, setSelectedHamper] = useState<HamperCard>(ALL_HAMPERS[0]);
  const [qtyOverrides, setQtyOverrides] = useState<Record<string, number>>({});
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Init qty overrides for first hamper
  useEffect(() => {
    const defaults: Record<string, number> = {};
    ALL_HAMPERS[0].items.forEach((i) => (defaults[i.name] = i.qty));
    setQtyOverrides(defaults);
  }, []);

  const handleSelectHamper = useCallback((h: HamperCard, idx: number) => {
    setSelectedHamper(h);
    setFocusedIndex(idx);
    const defaults: Record<string, number> = {};
    h.items.forEach((i) => (defaults[i.name] = i.qty));
    setQtyOverrides(defaults);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const next = Math.min(focusedIndex + 1, ALL_HAMPERS.length - 1);
        handleSelectHamper(ALL_HAMPERS[next], next);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = Math.max(focusedIndex - 1, 0);
        handleSelectHamper(ALL_HAMPERS[prev], prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusedIndex, handleSelectHamper]);

  const adjustQty = (itemName: string, delta: number) => {
    setQtyOverrides((prev) => ({
      ...prev,
      [itemName]: Math.max(1, (prev[itemName] ?? 1) + delta),
    }));
  };

  // Pricing
  const computePricing = () => {
    let taxable = 0;
    selectedHamper.items.forEach((i) => {
      const qty = qtyOverrides[i.name] ?? i.qty;
      taxable += i.unitPrice * qty;
    });
    const tax = Math.round(taxable * (selectedHamper.gstPercent / 100));
    return { taxable, tax, grand: taxable + tax };
  };
  const pricing = computePricing();
  const feasibility = getFeasibility(selectedHamper);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Delivery urgency
  const getDeadlineUrgency = () => {
    if (!deliveryDate) return null;
    const days = differenceInDays(deliveryDate, new Date());
    if (days <= 2) return "text-destructive";
    if (days <= 5) return "text-accent";
    return "text-[hsl(var(--eco-green))]";
  };

  const handleAction = (action: string) => {
    toast({ title: action, description: `${selectedHamper.name} — ${fmt(pricing.grand)}` });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-bold text-primary leading-tight">Hamper Designer</h1>
              <p className="text-[11px] text-muted-foreground">Staff quotation workstation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px]">↑↓</kbd>
            <span>Navigate hampers</span>
          </div>
        </div>
      </header>

      {/* 3-column grid */}
      <main className="flex-1 max-w-[1920px] mx-auto px-3 py-3 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_320px] gap-3 h-[calc(100vh-56px)]">

          {/* ───── LEFT: Filters ───── */}
          <aside className="space-y-3 lg:overflow-y-auto lg:pr-1">
            <Card>
              <CardContent className="p-3 space-y-4">
                {/* Budget slider + input */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Budget (₹)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[budget]}
                      onValueChange={([v]) => setBudget(v)}
                      min={500}
                      max={5000}
                      step={100}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value) || 500)}
                      className="w-20 h-7 text-xs text-center"
                    />
                  </div>
                  {/* Quick presets */}
                  <div className="flex gap-1.5 flex-wrap">
                    {BUDGET_PRESETS.map((p) => (
                      <Button
                        key={p}
                        variant={budget === p ? "default" : "outline"}
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => setBudget(p)}
                      >
                        {fmt(p)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Categories</Label>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer text-xs">
                        <Checkbox
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                          className="h-3.5 w-3.5"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                {/* In-stock toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">In-stock only</Label>
                  <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} />
                </div>

                {/* Delivery deadline */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-8 text-xs",
                          !deliveryDate && "text-muted-foreground",
                          getDeadlineUrgency()
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                        {deliveryDate ? format(deliveryDate, "dd MMM yyyy") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        initialFocus
                        className="p-2 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {deliveryDate && (
                    <p className={cn("text-[10px] font-medium", getDeadlineUrgency())}>
                      {differenceInDays(deliveryDate, new Date())} days remaining
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* ───── CENTER: Hamper List ───── */}
          <section className="lg:overflow-y-auto lg:pr-1 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {ALL_HAMPERS.length} Hampers
              </p>
            </div>

            {ALL_HAMPERS.map((h, idx) => (
              <Card
                key={h.id}
                onClick={() => handleSelectHamper(h, idx)}
                className={cn(
                  "cursor-pointer transition-all duration-150 overflow-hidden",
                  "hover:bg-muted/40",
                  selectedHamper.id === h.id
                    ? "ring-2 ring-primary bg-primary/[0.03] shadow-sm"
                    : "hover:shadow-sm",
                  focusedIndex === idx && selectedHamper.id !== h.id && "ring-1 ring-border"
                )}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    {/* Compact thumbnail */}
                    <img
                      src={h.image}
                      alt={h.name}
                      className="w-20 h-16 object-cover rounded-l-md flex-shrink-0"
                    />
                    {/* Info */}
                    <div className="flex-1 py-2 pr-3 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-semibold text-sm truncate">{h.heroProduct}</p>
                        {h.recommended && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1 py-0 gap-0.5 flex-shrink-0">
                            <Crown className="h-2.5 w-2.5" /> RECOMMENDED
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {h.sideItems.join(" · ")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-sm text-primary">{fmt(h.totalPrice)}</span>
                        <div className="flex gap-1 flex-wrap">
                          {h.badges.map((b) => (
                            <Badge
                              key={b}
                              variant="outline"
                              className={cn("text-[9px] px-1 py-0 gap-0.5 h-4", badgeStyle(b))}
                            >
                              {badgeIcon(b)} {b}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* ───── RIGHT: Live Preview & Summary ───── */}
          <aside className="lg:overflow-y-auto flex flex-col gap-2.5">
            {/* Preview image */}
            <Card className="overflow-hidden flex-shrink-0">
              <img src={selectedHamper.image} alt={selectedHamper.name} className="w-full h-36 object-cover" />
              <CardContent className="p-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{selectedHamper.name}</p>
                  <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", feasibilityMeta[feasibility].color, feasibilityMeta[feasibility].bg)}>
                    {feasibilityMeta[feasibility].icon}
                    {feasibilityMeta[feasibility].label}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editable items */}
            <Card className="flex-shrink-0">
              <CardContent className="p-2.5 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Items</p>
                {selectedHamper.items.map((item) => {
                  const qty = qtyOverrides[item.name] ?? item.qty;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs gap-1.5">
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="text-muted-foreground w-14 text-right">{fmt(item.unitPrice)}</span>
                      <div className="flex items-center gap-0.5">
                        <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => adjustQty(item.name, -1)}>
                          <Minus className="h-2.5 w-2.5" />
                        </Button>
                        <span className="w-5 text-center text-[11px] font-semibold tabular-nums">{qty}</span>
                        <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => adjustQty(item.name, 1)}>
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

            {/* Pricing summary — sticky feel */}
            <Card className="border-primary/20 flex-shrink-0">
              <CardContent className="p-3 space-y-1 text-xs">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pricing</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxable</span>
                  <span className="tabular-nums">{fmt(pricing.taxable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST ({selectedHamper.gstPercent}%)</span>
                  <span className="tabular-nums">{fmt(pricing.tax)}</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between">
                  <span className="font-bold text-sm">Grand Total</span>
                  <span className="font-bold text-lg text-primary tabular-nums transition-all duration-200">{fmt(pricing.grand)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action bar — always visible */}
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
              <Button size="sm" className="gap-1 text-[11px] h-8" onClick={() => handleAction("Order Confirmed")}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Order
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HamperDesigner;
