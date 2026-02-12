import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
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
} from "lucide-react";

// ── Mock Data ────────────────────────────────────────────────────────
const CATEGORIES = [
  "Chocolates & Sweets",
  "Dry Fruits & Nuts",
  "Wellness & Self-Care",
  "Stationery & Desk",
  "Beverages",
  "Eco-Friendly",
];

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
}

const MOCK_HAMPERS: HamperCard[] = [
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
];

const BACKUP_HAMPERS: HamperCard[] = [
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

// ── Badge colour helper ──────────────────────────────────────────────
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

// ── Feasibility helper ───────────────────────────────────────────────
type Feasibility = "green" | "yellow" | "red";
const feasibilityMeta: Record<Feasibility, { label: string; icon: React.ReactNode; color: string }> = {
  green: { label: "Deliverable", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-[hsl(var(--eco-green))]" },
  yellow: { label: "Risk", icon: <AlertTriangle className="h-4 w-4" />, color: "text-accent" },
  red: { label: "Not Possible", icon: <XCircle className="h-4 w-4" />, color: "text-destructive" },
};

const getFeasibility = (hamper: HamperCard): Feasibility => {
  if (hamper.badges.includes("LOW STOCK")) return "yellow";
  if (hamper.totalPrice > 3000) return "red";
  return "green";
};

// ═════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════
const HamperDesigner = () => {
  // Filters
  const [budget, setBudget] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();

  // Selection
  const [selectedHamper, setSelectedHamper] = useState<HamperCard | null>(null);
  const [backupsOpen, setBackupsOpen] = useState(false);

  // Editable quantities (keyed by item name)
  const [qtyOverrides, setQtyOverrides] = useState<Record<string, number>>({});

  const handleSelectHamper = (h: HamperCard) => {
    setSelectedHamper(h);
    // Reset qty overrides to the hamper defaults
    const defaults: Record<string, number> = {};
    h.items.forEach((i) => (defaults[i.name] = i.qty));
    setQtyOverrides(defaults);
  };

  const adjustQty = (itemName: string, delta: number) => {
    setQtyOverrides((prev) => {
      const cur = prev[itemName] ?? 1;
      return { ...prev, [itemName]: Math.max(1, cur + delta) };
    });
  };

  // Pricing for selected hamper
  const computePricing = () => {
    if (!selectedHamper) return { taxable: 0, tax: 0, grand: 0 };
    let taxable = 0;
    selectedHamper.items.forEach((i) => {
      const qty = qtyOverrides[i.name] ?? i.qty;
      taxable += i.unitPrice * qty;
    });
    const tax = Math.round(taxable * (selectedHamper.gstPercent / 100));
    return { taxable, tax, grand: taxable + tax };
  };

  const pricing = computePricing();
  const feasibility = selectedHamper ? getFeasibility(selectedHamper) : null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-primary">Hamper Designer</h1>
              <p className="text-xs text-muted-foreground">Build &amp; preview gift hamper combos</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3-column grid */}
      <main className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-6">
          {/* ───── LEFT: Filters ───── */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="p-4 space-y-5">
                {/* Budget */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 2000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</Label>
                  <div className="space-y-1.5">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm">
                        <Checkbox
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                {/* In-stock toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show only in-stock</Label>
                  <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} />
                </div>

                {/* Delivery deadline */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delivery Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !deliveryDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* ───── CENTER: Hamper Suggestions ───── */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Suggestions</h2>

            {/* Main 3 cards */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {MOCK_HAMPERS.map((h) => (
                <Card
                  key={h.id}
                  onClick={() => handleSelectHamper(h)}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md overflow-hidden",
                    selectedHamper?.id === h.id && "ring-2 ring-primary shadow-lg"
                  )}
                >
                  <img src={h.image} alt={h.name} className="w-full h-40 object-cover" />
                  <CardContent className="p-3 space-y-2">
                    <p className="font-bold text-sm leading-tight">{h.heroProduct}</p>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {h.sideItems.map((s) => (
                        <p key={s}>• {s}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-primary">{fmt(h.totalPrice)}</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {h.badges.map((b) => (
                          <Badge key={b} variant="outline" className={cn("text-[10px] px-1.5 py-0 gap-0.5", badgeStyle(b))}>
                            {badgeIcon(b)} {b}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Backup hampers – collapsible */}
            <Collapsible open={backupsOpen} onOpenChange={setBackupsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-muted-foreground text-sm">
                  Backup Options ({BACKUP_HAMPERS.length})
                  <ChevronDown className={cn("h-4 w-4 transition-transform", backupsOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  {BACKUP_HAMPERS.map((h) => (
                    <Card
                      key={h.id}
                      onClick={() => handleSelectHamper(h)}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md overflow-hidden",
                        selectedHamper?.id === h.id && "ring-2 ring-primary shadow-lg"
                      )}
                    >
                      <img src={h.image} alt={h.name} className="w-full h-32 object-cover" />
                      <CardContent className="p-3 space-y-2">
                        <p className="font-bold text-sm leading-tight">{h.heroProduct}</p>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {h.sideItems.map((s) => (
                            <p key={s}>• {s}</p>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-semibold text-primary">{fmt(h.totalPrice)}</span>
                          <div className="flex gap-1 flex-wrap justify-end">
                            {h.badges.map((b) => (
                              <Badge key={b} variant="outline" className={cn("text-[10px] px-1.5 py-0 gap-0.5", badgeStyle(b))}>
                                {badgeIcon(b)} {b}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>

          {/* ───── RIGHT: Live Preview & Summary ───── */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {selectedHamper ? (
              <>
                {/* Large preview image */}
                <Card className="overflow-hidden">
                  <img src={selectedHamper.image} alt={selectedHamper.name} className="w-full h-48 object-cover" />
                  <CardContent className="p-3">
                    <p className="font-bold text-base">{selectedHamper.name}</p>
                  </CardContent>
                </Card>

                {/* Editable items */}
                <Card>
                  <CardContent className="p-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Items</p>
                    {selectedHamper.items.map((item) => {
                      const qty = qtyOverrides[item.name] ?? item.qty;
                      return (
                        <div key={item.name} className="flex items-center justify-between text-sm gap-2">
                          <span className="flex-1 truncate">{item.name}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => adjustQty(item.name, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">{qty}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => adjustQty(item.name, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Pricing summary */}
                <Card>
                  <CardContent className="p-3 space-y-1.5 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pricing Summary</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxable Amount</span>
                      <span>{fmt(pricing.taxable)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({selectedHamper.gstPercent}%)</span>
                      <span>{fmt(pricing.tax)}</span>
                    </div>
                    <div className="border-t border-border pt-1.5 flex justify-between font-bold">
                      <span>Grand Total</span>
                      <span className="text-primary">{fmt(pricing.grand)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Feasibility */}
                {feasibility && (
                  <div className={cn("flex items-center gap-2 text-sm font-medium px-1", feasibilityMeta[feasibility].color)}>
                    {feasibilityMeta[feasibility].icon}
                    {feasibilityMeta[feasibility].label}
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-1.5 text-xs">
                    <FileText className="h-3.5 w-3.5" /> Preview PDF
                  </Button>
                  <Button variant="outline" className="gap-1.5 text-xs">
                    <Save className="h-3.5 w-3.5" /> Save Draft
                  </Button>
                  <Button variant="secondary" className="gap-1.5 text-xs">
                    <Send className="h-3.5 w-3.5" /> Send Quote
                  </Button>
                  <Button className="gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Order
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground text-sm">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Select a hamper to see the live preview and pricing summary.</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HamperDesigner;
