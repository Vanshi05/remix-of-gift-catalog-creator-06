// ── Questionnaire types ──────────────────────────────────────────────
export interface QuestionnaireData {
  // Step 1: Client & Context
  clientName: string;
  company: string;
  contact: string;
  deliveryDate: Date | undefined;

  // Step 2: Budget & Quantity
  budgetMode: "total" | "per-hamper";
  budget: number;
  quantity: number;

  // Step 3: Hero Preference
  heroPreference: string;

  // Step 4: Constraints
  mustHaveItems: string[];
  forbiddenCategories: string[];
  dietaryNotes: string;
  packagingType: string;
  maxLeadTimeDays: number;

  // Step 5: Priority Sliders
  priceSensitivity: number;
  deliveryPriority: number;
  premiumness: number;
}

export const DEFAULT_QUESTIONNAIRE: QuestionnaireData = {
  clientName: "",
  company: "",
  contact: "",
  deliveryDate: undefined,
  budgetMode: "per-hamper",
  budget: 2000,
  quantity: 10,
  heroPreference: "no-preference",
  mustHaveItems: [],
  forbiddenCategories: [],
  dietaryNotes: "",
  packagingType: "standard",
  maxLeadTimeDays: 7,
  priceSensitivity: 50,
  deliveryPriority: 50,
  premiumness: 50,
};

// ── Hamper types ─────────────────────────────────────────────────────
export interface HamperItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export type BadgeType = "LOW STOCK" | "FAST DELIVERY" | "PREMIUM";
export type Feasibility = "green" | "yellow" | "red";

export interface GeneratedHamper {
  id: string;
  name: string;
  heroProduct: string;
  sideItems: string[];
  totalPrice: number;
  image: string;
  badges: BadgeType[];
  items: HamperItem[];
  gstPercent: number;
  confidence: number; // 0–100
  feasibility: Feasibility;
  whyChosen: string[];
  isBackup?: boolean;
}

// ── Constants ────────────────────────────────────────────────────────
export const HERO_OPTIONS = [
  { value: "no-preference", label: "No Preference" },
  { value: "chocolates", label: "Chocolates" },
  { value: "dry-fruits", label: "Dry Fruits" },
  { value: "wellness", label: "Wellness" },
  { value: "beverages", label: "Beverages" },
  { value: "stationery", label: "Stationery" },
  { value: "custom", label: "Custom" },
];

export const PACKAGING_OPTIONS = [
  { value: "standard", label: "Standard Box" },
  { value: "premium", label: "Premium Gift Box" },
  { value: "eco", label: "Eco-Friendly" },
  { value: "luxury", label: "Luxury Hamper Basket" },
];

export const CATEGORY_OPTIONS = [
  "Chocolates & Sweets",
  "Dry Fruits & Nuts",
  "Wellness & Self-Care",
  "Stationery & Desk",
  "Beverages",
  "Eco-Friendly",
];

export const MUST_HAVE_OPTIONS = [
  "Artisan Chocolate",
  "Premium Cashews",
  "Green Tea",
  "Scented Candle",
  "Bamboo Tumbler",
  "Honey Jar",
  "Trail Mix",
  "Masala Chai",
];
