import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  DollarSign,
  Heart,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import {
  type QuestionnaireData,
  DEFAULT_QUESTIONNAIRE,
  HERO_OPTIONS,
  PACKAGING_OPTIONS,
  CATEGORY_OPTIONS,
  MUST_HAVE_OPTIONS,
} from "./types";

interface HamperWizardProps {
  onGenerate: (data: QuestionnaireData) => void;
}

const STEPS = [
  { label: "Client", icon: User },
  { label: "Budget", icon: DollarSign },
  { label: "Theme", icon: Heart },
  { label: "Constraints", icon: ShieldAlert },
  { label: "Priority", icon: SlidersHorizontal },
];

const BUDGET_PRESETS = [1000, 1500, 2000, 3000, 5000];

const HamperWizard = ({ onGenerate }: HamperWizardProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>({ ...DEFAULT_QUESTIONNAIRE });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = useCallback(<K extends keyof QuestionnaireData>(key: K, value: QuestionnaireData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!data.clientName.trim()) errs.clientName = "Required";
      if (!data.deliveryDate) errs.deliveryDate = "Required";
    }
    if (step === 1) {
      if (data.budget < 200) errs.budget = "Min ₹200";
      if (data.quantity < 1) errs.quantity = "Min 1";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  const prev = () => step > 0 && setStep(step - 1);

  const handleGenerate = () => {
    if (!validateStep()) return;
    onGenerate(data);
  };

  const toggleArrayItem = (key: "mustHaveItems" | "forbiddenCategories", item: string) => {
    const arr = data[key];
    update(key, arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={i}
              onClick={() => { if (i < step) setStep(i); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                i === step
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : i < step
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm min-h-[320px]">
        {/* Step 0: Client */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Client & Context</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Client Name *</Label>
                <Input
                  value={data.clientName}
                  onChange={(e) => update("clientName", e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={cn("h-8 text-sm", errors.clientName && "border-destructive")}
                  autoFocus
                />
                {errors.clientName && <p className="text-[10px] text-destructive">{errors.clientName}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Company</Label>
                <Input
                  value={data.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Contact</Label>
                <Input
                  value={data.contact}
                  onChange={(e) => update("contact", e.target.value)}
                  placeholder="Phone or email"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Delivery Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left h-8 text-sm font-normal",
                        !data.deliveryDate && "text-muted-foreground",
                        errors.deliveryDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {data.deliveryDate ? format(data.deliveryDate, "dd MMM yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.deliveryDate}
                      onSelect={(d) => update("deliveryDate", d)}
                      className="p-2 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.deliveryDate && <p className="text-[10px] text-destructive">{errors.deliveryDate}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Budget */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Budget & Quantity</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["per-hamper", "total"] as const).map((m) => (
                  <Button
                    key={m}
                    variant={data.budgetMode === m ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => update("budgetMode", m)}
                  >
                    {m === "per-hamper" ? "Per Hamper" : "Total Budget"}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  {data.budgetMode === "per-hamper" ? "Budget per hamper" : "Total budget"} (₹)
                </Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[data.budget]}
                    onValueChange={([v]) => update("budget", v)}
                    min={200}
                    max={10000}
                    step={100}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={data.budget}
                    onChange={(e) => update("budget", Number(e.target.value) || 200)}
                    className={cn("w-24 h-8 text-sm text-center", errors.budget && "border-destructive")}
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {BUDGET_PRESETS.map((p) => (
                    <Button
                      key={p}
                      variant={data.budget === p ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => update("budget", p)}
                    >
                      {fmt(p)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  value={data.quantity}
                  onChange={(e) => update("quantity", Number(e.target.value) || 1)}
                  className={cn("h-8 text-sm w-24", errors.quantity && "border-destructive")}
                  min={1}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Theme */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Hero Preference & Theme</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Hero Product Category</Label>
                <Select value={data.heroPreference} onValueChange={(v) => update("heroPreference", v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HERO_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Packaging Type</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {PACKAGING_OPTIONS.map((p) => (
                    <Button
                      key={p.value}
                      variant={data.packagingType === p.value ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => update("packagingType", p.value)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Constraints */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Constraints</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Must-have items</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {MUST_HAVE_OPTIONS.map((item) => (
                    <Badge
                      key={item}
                      variant={data.mustHaveItems.includes(item) ? "default" : "outline"}
                      className="cursor-pointer text-[10px] px-2 py-0.5"
                      onClick={() => toggleArrayItem("mustHaveItems", item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Forbidden categories</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <Badge
                      key={cat}
                      variant={data.forbiddenCategories.includes(cat) ? "destructive" : "outline"}
                      className="cursor-pointer text-[10px] px-2 py-0.5"
                      onClick={() => toggleArrayItem("forbiddenCategories", cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dietary notes</Label>
                <Input
                  value={data.dietaryNotes}
                  onChange={(e) => update("dietaryNotes", e.target.value)}
                  placeholder="e.g. No nuts, vegan only"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Priority */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Priority Sliders</h2>
            <p className="text-xs text-muted-foreground">Adjust to weight the generation algorithm.</p>
            <div className="space-y-5">
              {([
                { key: "priceSensitivity" as const, label: "Price Sensitivity", low: "Flexible", high: "Strict" },
                { key: "deliveryPriority" as const, label: "Delivery Priority", low: "Relaxed", high: "Urgent" },
                { key: "premiumness" as const, label: "Premiumness", low: "Standard", high: "Luxury" },
              ]).map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground tabular-nums">{data[s.key]}%</span>
                  </div>
                  <Slider
                    value={[data[s.key]]}
                    onValueChange={([v]) => update(s.key, v)}
                    min={0}
                    max={100}
                    step={5}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{s.low}</span>
                    <span>{s.high}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <Button variant="outline" size="sm" onClick={prev} disabled={step === 0} className="gap-1 text-xs">
          <ChevronLeft className="h-3.5 w-3.5" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="sm" onClick={next} className="gap-1 text-xs">
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleGenerate} className="gap-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Generate Suggestions
          </Button>
        )}
      </div>
    </div>
  );
};

export default HamperWizard;
