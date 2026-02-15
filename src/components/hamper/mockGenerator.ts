import type { QuestionnaireData, GeneratedHamper } from "./types";

// ── Pool of items per preference ─────────────────────────────────────
const ITEM_POOL: Record<string, { name: string; price: number }[]> = {
  chocolates: [
    { name: "Artisan Chocolate Box", price: 550 },
    { name: "Belgian Truffles", price: 680 },
    { name: "Almond Brittle", price: 180 },
    { name: "Dark Chocolate Bar Set", price: 320 },
    { name: "Chocolate Coated Almonds", price: 240 },
  ],
  "dry-fruits": [
    { name: "Premium Cashew Tin", price: 480 },
    { name: "Mixed Dry Fruits Box", price: 520 },
    { name: "Dried Cranberries Pack", price: 140 },
    { name: "Pistachio Gift Pack", price: 560 },
    { name: "Trail Mix Jar", price: 190 },
  ],
  wellness: [
    { name: "Organic Superfood Mix", price: 680 },
    { name: "Lavender Candle", price: 350 },
    { name: "Herbal Soap Set", price: 370 },
    { name: "Bamboo Tumbler", price: 420 },
    { name: "Essential Oil Set", price: 450 },
  ],
  beverages: [
    { name: "Green Tea Tin", price: 180 },
    { name: "Masala Chai Box", price: 220 },
    { name: "Cold Brew Kit", price: 480 },
    { name: "Specialty Coffee Beans", price: 390 },
    { name: "Herbal Infusion Set", price: 310 },
  ],
  stationery: [
    { name: "Leather Notebook", price: 450 },
    { name: "Premium Pen Set", price: 380 },
    { name: "Desk Organizer", price: 520 },
    { name: "Sticky Notes Collection", price: 120 },
    { name: "Eco Pencil Kit", price: 160 },
  ],
  general: [
    { name: "Honey Jar", price: 220 },
    { name: "Scented Candles Set", price: 280 },
    { name: "Cookie Tin", price: 300 },
    { name: "Mug", price: 200 },
    { name: "Fig Jam", price: 180 },
  ],
};

const IMAGES = [
  "https://images.unsplash.com/photo-1549465220-1a8b9238f0b0?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop",
];

const HAMPER_NAMES = [
  "Classic Delight Hamper",
  "Premium Wellness Box",
  "Festive Joy Hamper",
  "Executive Gift Set",
  "Artisan Curated Basket",
];

const WHY_CHOSEN_POOL = [
  "Matches budget range perfectly",
  "Hero product aligns with preference",
  "Fastest delivery option available",
  "Best value per item ratio",
  "Premium packaging included",
  "Popular choice for corporate clients",
  "Meets dietary requirements",
  "Eco-friendly packaging option",
  "High client satisfaction rating",
  "Seasonal bestseller",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateHampers(data: QuestionnaireData): GeneratedHamper[] {
  const pref = data.heroPreference === "no-preference" || data.heroPreference === "custom"
    ? "general"
    : data.heroPreference;

  const heroPool = ITEM_POOL[pref] || ITEM_POOL.general;
  const sidePool = [
    ...ITEM_POOL.general,
    ...(pref !== "general" ? [] : ITEM_POOL.chocolates),
  ];
  const perHamperBudget = data.budgetMode === "total"
    ? Math.round(data.budget / Math.max(data.quantity, 1))
    : data.budget;

  const results: GeneratedHamper[] = [];

  for (let i = 0; i < 5; i++) {
    const hero = heroPool[i % heroPool.length];
    const sides = pickRandom(sidePool.filter((s) => s.name !== hero.name), 3 + (i % 2));

    const items = [
      { name: hero.name, qty: 1, unitPrice: hero.price },
      ...sides.map((s) => ({ name: s.name, qty: 1, unitPrice: s.price })),
    ];
    const totalPrice = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);

    const withinBudget = totalPrice <= perHamperBudget * 1.15;
    const confidence = withinBudget
      ? Math.min(95, 70 + Math.round(Math.random() * 25))
      : Math.max(40, 55 - i * 5);

    const feasibility: GeneratedHamper["feasibility"] = withinBudget
      ? i < 3 ? "green" : "yellow"
      : "red";

    const badges: GeneratedHamper["badges"] = [];
    if (i === 0) badges.push("FAST DELIVERY");
    if (data.priorityMode === "premium" || i === 1) badges.push("PREMIUM");
    if (i >= 3) badges.push("LOW STOCK");

    results.push({
      id: `gen-${i}`,
      name: HAMPER_NAMES[i],
      heroProduct: hero.name,
      sideItems: sides.map((s) => s.name),
      totalPrice,
      image: IMAGES[i],
      badges,
      items,
      gstPercent: data.priorityMode === "premium" ? 18 : 12,
      confidence,
      feasibility,
      whyChosen: pickRandom(WHY_CHOSEN_POOL, 2 + (i < 3 ? 1 : 0)),
      isBackup: i >= 3,
    });
  }

  // Sort by confidence descending
  return results.sort((a, b) => b.confidence - a.confidence);
}
