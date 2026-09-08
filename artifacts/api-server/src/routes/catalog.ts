import { Router, type IRouter } from "express";
import {
  GetAnalyticsSummaryResponse,
  GetToolResponse,
  ListCategoriesResponse,
  ListToolsResponse,
} from "@workspace/api-zod";
import {
  priorityOneExpansionDefinitions,
  priorityOneExpansionSlugs,
} from "../../../calcstride/src/lib/priority-one-expansion";
import {
  phaseTwoDefinitions,
  phaseTwoSlugs,
} from "../../../calcstride/src/lib/phase-two-expansion";
import {
  phaseThreeADefinitions,
  phaseThreeASlugs,
} from "../../../calcstride/src/lib/phase-three-a";
import {
  phaseThreeBDefinitions,
  phaseThreeBSlugs,
} from "../../../calcstride/src/lib/phase-three-b";
import { CATALOG_LAST_UPDATED } from "../../../calcstride/src/lib/catalog-metadata";
import {
  phaseThreeCDefinitions,
  phaseThreeCExpandedSlugs,
  phaseThreeCNewSlugs,
} from "../../../calcstride/src/lib/phase-three-c";
import { phaseFourRoutes } from "../../../calcstride/src/lib/phase-four-routes";

export type CatalogTool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  href: string;
  tags: string[];
  featured: boolean;
  lastUpdated: string;
  icon?: string;
};

export const catalogTools: CatalogTool[] = [
  {
    slug: "percentage",
    name: "Percentage Calculator",
    description: "Find a percentage of any value in seconds.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/percentage",
    tags: ["percent", "percentage", "math"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "percent",
  },
  {
    slug: "percentage-increase-decrease",
    name: "Percentage Change Calculator",
    description: "Calculate percentage increase or decrease, compare values by percentage difference, or reverse a percentage change.",
    category: "Math",
    categorySlug: "math",
    href: "/calculators/math/percentage-increase-decrease",
    tags: ["percentage change", "percent increase", "percent decrease", "percentage difference", "reverse percentage"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "trending-up",
  },
  {
    slug: "compound-interest",
    name: "Compound Interest Calculator",
    description: "See how contributions and compounding can grow your money over time.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/compound-interest",
    tags: ["interest", "investment", "savings"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "chart",
  },
  {
    slug: "loan",
    name: "Loan Calculator",
    description: "Estimate monthly payments, total interest, and the full cost of a loan.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/loan",
    tags: ["loan", "payment", "interest"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "landmark",
  },
  {
    slug: "mortgage",
    name: "Mortgage Calculator",
    description: "Estimate mortgage payments with taxes, insurance, and down payment.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/mortgage",
    tags: ["mortgage", "home", "payment"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "home",
  },
  {
    slug: "auto-loan",
    name: "Auto Loan Calculator",
    description: "Estimate a vehicle loan payment, amount financed, total interest, and loan cost.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/auto-loan",
    tags: ["auto loan", "car payment", "vehicle financing"],
    featured: false,
    lastUpdated: "August 2026",
  },
  {
    slug: "interest-rate",
    name: "Interest Rate Calculator",
    description: "Estimate the annual rate implied by a fixed principal, payment, and term.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/interest-rate",
    tags: ["interest rate", "loan rate", "payment"],
    featured: false,
    lastUpdated: "August 2026",
  },
  {
    slug: "mortgage-amortization",
    name: "Mortgage Amortization Calculator",
    description: "Inspect principal, interest, and remaining balance at a selected mortgage payment.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/mortgage-amortization",
    tags: ["mortgage amortization", "amortization schedule", "remaining balance"],
    featured: false,
    lastUpdated: "August 2026",
  },
  {
    slug: "mortgage-payoff",
    name: "Mortgage Payoff Calculator",
    description: "Estimate how recurring extra principal payments may shorten a mortgage.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/mortgage-payoff",
    tags: ["mortgage payoff", "extra payment", "interest savings"],
    featured: false,
    lastUpdated: "August 2026",
  },
  {
    slug: "simple-interest",
    name: "Simple Interest Calculator",
    description: "Calculate simple interest and ending amount from principal, annual rate, and time.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/simple-interest",
    tags: ["simple interest", "interest formula", "principal rate time"],
    featured: false,
    lastUpdated: "August 2026",
  },
  {
    slug: "savings",
    name: "Savings Calculator",
    description: "Project how regular deposits and interest can build your savings.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/savings",
    tags: ["savings", "interest", "goals"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "wallet",
  },
  {
    slug: "roi",
    name: "ROI Calculator",
    description: "Measure return on investment and compare the gain against your original cost.",
    category: "Business",
    categorySlug: "business",
    href: "/calculators/business/roi",
    tags: ["roi", "return", "investment"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "arrow-up-right",
  },
  {
    slug: "profit-margin",
    name: "Profit Margin Calculator",
    description: "Calculate gross profit, margin, and markup from your cost and selling price.",
    category: "Business",
    categorySlug: "business",
    href: "/calculators/business/profit-margin",
    tags: ["profit", "margin", "business"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "badge-dollar",
  },
  {
    slug: "markup",
    name: "Markup Calculator",
    description: "Set a selling price from cost and your target markup percentage.",
    category: "Business",
    categorySlug: "business",
    href: "/calculators/business/markup",
    tags: ["markup", "pricing", "business"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "tag",
  },
  {
    slug: "break-even",
    name: "Break-Even Calculator",
    description: "Find the sales volume and revenue needed to cover your costs.",
    category: "Business",
    categorySlug: "business",
    href: "/calculators/business/break-even",
    tags: ["break even", "costs", "sales"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "scale",
  },
  {
    slug: "vat",
    name: "VAT Calculator",
    description: "Add or remove VAT from a price with a rate you choose.",
    category: "Money & Finance",
    categorySlug: "finance",
    href: "/calculators/finance/vat",
    tags: ["vat", "tax", "sales tax"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "receipt",
  },
  {
    slug: "salary",
    name: "Salary Converter",
    description: "Convert annual, monthly, weekly, and hourly pay into comparable figures.",
    category: "Salary & Work",
    categorySlug: "salary-work",
    href: "/calculators/salary-work/salary",
    tags: ["salary", "hourly", "pay"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "briefcase",
  },
  {
    slug: "overtime",
    name: "Overtime Calculator",
    description: "Work out overtime pay from your hourly rate and extra hours.",
    category: "Salary & Work",
    categorySlug: "salary-work",
    href: "/calculators/salary-work/overtime",
    tags: ["overtime", "pay", "hours"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "clock",
  },
  {
    slug: "fuel-cost",
    name: "Fuel Cost Calculator",
    description: "Estimate the fuel cost of a trip from distance, efficiency, and fuel price.",
    category: "Automotive & EV",
    categorySlug: "automotive",
    href: "/calculators/automotive/fuel-cost",
    tags: ["fuel", "gas", "trip", "car"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "fuel",
  },
  {
    slug: "fuel-economy",
    name: "Fuel Economy Converter",
    description: "Convert between MPG, L/100 km, and km/L.",
    category: "Automotive & EV",
    categorySlug: "automotive",
    href: "/calculators/automotive/fuel-economy",
    tags: ["fuel", "mpg", "l/100km"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "gauge",
  },
  {
    slug: "ev-charging-cost",
    name: "EV Charging Cost Calculator",
    description: "Estimate the cost to charge an electric vehicle at home or away.",
    category: "Automotive & EV",
    categorySlug: "automotive",
    href: "/calculators/automotive/ev-charging-cost",
    tags: ["ev", "electric car", "charging"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "zap",
  },
  {
    slug: "ev-charging-time",
    name: "EV Charging Time Calculator",
    description: "Estimate how long an EV charge will take from battery size and power.",
    category: "Automotive & EV",
    categorySlug: "automotive",
    href: "/calculators/automotive/ev-charging-time",
    tags: ["ev", "charging", "battery"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "battery",
  },
  {
    slug: "concrete",
    name: "Concrete Calculator",
    description: "Estimate ready-mix volume and order size for general rectangular concrete pours.",
    category: "Home & Construction",
    categorySlug: "construction",
    href: "/calculators/construction/concrete",
    tags: ["concrete", "building", "volume"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "blocks",
  },
  {
    slug: "paint",
    name: "Paint Calculator",
    description: "Estimate how much paint you need for walls, ceilings, and trim.",
    category: "Home & Construction",
    categorySlug: "construction",
    href: "/calculators/construction/paint",
    tags: ["paint", "walls", "renovation"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "paintbrush",
  },
  {
    slug: "tile",
    name: "Tile Calculator",
    description: "Calculate tile quantities, coverage, and waste for your project.",
    category: "Home & Construction",
    categorySlug: "construction",
    href: "/calculators/construction/tile",
    tags: ["tile", "floor", "renovation"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "grid",
  },
  {
    slug: "flooring",
    name: "Flooring Calculator",
    description: "Estimate flooring area and materials with an allowance for waste.",
    category: "Home & Construction",
    categorySlug: "construction",
    href: "/calculators/construction/flooring",
    tags: ["flooring", "area", "renovation"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "layout-grid",
  },
  {
    slug: "area",
    name: "Area Calculator",
    description: "Find the area of a rectangle from its length and width.",
    category: "Math",
    categorySlug: "math",
    href: "/calculators/math/area",
    tags: ["area", "geometry", "math"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "triangle",
  },
  {
    slug: "volume",
    name: "Volume Calculator",
    description: "Calculate rectangular volume from length, width, and height.",
    category: "Math",
    categorySlug: "math",
    href: "/calculators/math/volume",
    tags: ["volume", "geometry", "math"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "box",
  },
  {
    slug: "age",
    name: "Age Calculator",
    description: "Calculate your exact age in years, months, and days.",
    category: "Date & Time",
    categorySlug: "date-time",
    href: "/calculators/date-time/age",
    tags: ["age", "birthday", "date"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "cake",
  },
  {
    slug: "date-difference",
    name: "Date Calculator & Day Counter",
    description: "Count days between dates or add and subtract calendar years, months, weeks, and days.",
    category: "Date & Time",
    categorySlug: "date-time",
    href: "/calculators/date-time/date-difference",
    tags: ["date duration", "days between dates", "date calculator", "day counter calculator", "date add subtract", "time between dates", "date difference", "calendar duration", "weeks between dates"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "calendar",
  },
  {
    slug: "working-days",
    name: "Working Days Calculator",
    description: "Count weekdays between two dates, excluding weekends.",
    category: "Date & Time",
    categorySlug: "date-time",
    href: "/calculators/date-time/working-days",
    tags: ["working days", "weekdays", "date"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "calendar-check",
  },
  {
    slug: "unit",
    name: "Unit Converter",
    description: "Switch among common length, weight, temperature, and speed units in one multi-category hub.",
    category: "Converters",
    categorySlug: "converters",
    href: "/converters/unit",
    tags: ["units", "convert", "measurement", "metric", "imperial"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "repeat",
  },
  {
    slug: "length",
    name: "Length Converter",
    description: "Convert linear dimensions and distances across metric and imperial length units.",
    category: "Converters",
    categorySlug: "converters",
    href: "/converters/length",
    tags: ["length", "distance", "mm", "cm", "meters", "inches", "feet", "miles"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "ruler",
  },
  {
    slug: "weight",
    name: "Weight Converter",
    description: "Compare everyday mass and scale readings in grams, kilograms, ounces, pounds, and stones.",
    category: "Converters",
    categorySlug: "converters",
    href: "/converters/weight",
    tags: ["weight", "mass", "grams", "kg", "ounces", "lbs", "stones"],
    featured: true,
    lastUpdated: "August 2026",
    icon: "scale",
  },
  {
    slug: "temperature",
    name: "Temperature Converter",
    description: "Translate weather, cooking, and scientific readings among Celsius, Fahrenheit, and Kelvin.",
    category: "Converters",
    categorySlug: "converters",
    href: "/converters/temperature",
    tags: ["temperature", "weather", "celsius", "fahrenheit", "kelvin"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "thermometer",
  },
  {
    slug: "speed",
    name: "Speed Converter",
    description: "Compare road, marine, sport, wind, and technical speeds in km/h, mph, knots, and m/s.",
    category: "Converters",
    categorySlug: "converters",
    href: "/converters/speed",
    tags: ["speed", "travel", "mph", "km/h", "knots", "m/s"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "gauge",
  },
  {
    slug: "power",
    name: "Power HP / kW Converter",
    description: "Convert engine power between horsepower and kilowatts.",
    category: "Automotive & EV",
    categorySlug: "automotive",
    href: "/converters/power",
    tags: ["horsepower", "hp", "kw", "engine"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "zap",
  },
  {
    slug: "dpi-ppi",
    name: "DPI / PPI Calculator",
    description: "Calculate print resolution from pixel width and physical print width.",
    category: "Printing & Design",
    categorySlug: "printing-design",
    href: "/calculators/printing-design/dpi-ppi",
    tags: ["dpi", "ppi", "print", "resolution"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "scan",
  },
  {
    slug: "pixels-to-cm",
    name: "Pixels to cm / inches",
    description: "Convert digital pixel dimensions into print-ready physical sizes.",
    category: "Printing & Design",
    categorySlug: "printing-design",
    href: "/calculators/printing-design/pixels-to-cm",
    tags: ["pixels", "cm", "inches", "print"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "maximize",
  },
  {
    slug: "image-scaling",
    name: "Image Scaling Calculator",
    description: "Resize an image while preserving its aspect ratio.",
    category: "Printing & Design",
    categorySlug: "printing-design",
    href: "/calculators/printing-design/image-scaling",
    tags: ["image", "resize", "aspect ratio"],
    featured: false,
    lastUpdated: "August 2026",
    icon: "image",
  },
];

const expandedConstructionTools = [
  ["concrete-slab", "Concrete Slab Calculator", "Calculate concrete volume for patios, garage floors, walkways, and foundation slabs.", ["concrete", "slab", "patio"]],
  ["concrete-bag", "Concrete Bag Calculator", "Find how many bags of premixed concrete a small pour requires.", ["concrete", "bags", "premix"]],
  ["concrete-footing", "Concrete Footing Calculator", "Estimate concrete for continuous strip footings and repeated rectangular footings.", ["concrete", "footing", "foundation"]],
  ["concrete-cost", "Concrete Cost Calculator", "Estimate ready-mix material cost from pour dimensions, waste, and supplier price.", ["concrete", "cost", "ready mix"]],
  ["cubic-yard", "Cubic Yard Calculator", "Convert project dimensions into cubic yards for concrete, soil, gravel, mulch, or fill.", ["cubic yard", "volume", "materials"]],
  ["square-footage", "Square Footage Calculator", "Find floor, wall, patio, or garden area with a material allowance.", ["square footage", "area", "floor"]],
  ["gravel", "Gravel Calculator", "Estimate gravel volume, weight, and material cost for driveways and paths.", ["gravel", "aggregate", "driveway"]],
  ["mulch", "Mulch Calculator", "Calculate bulk mulch volume and standard bag quantities for garden beds.", ["mulch", "garden", "landscaping"]],
  ["roof-pitch", "Roof Pitch Calculator", "Convert roof rise and run into pitch, angle, and slope multiplier.", ["roof pitch", "angle", "slope"]],
  ["roofing-material", "Roofing Material Calculator", "Estimate roof area, roofing squares, and asphalt-shingle bundles.", ["roofing", "shingles", "roof squares"]],
  ["stair", "Stair Calculator", "Estimate riser count, actual riser height, tread count, and stair run.", ["stairs", "riser", "tread"]],
  ["board-foot", "Board Foot Calculator", "Calculate lumber volume in board feet and cubic metres.", ["board feet", "lumber", "timber"]],
  ["deck-material", "Deck Material Calculator", "Estimate deck boards and coverage from deck dimensions and board spacing.", ["deck", "boards", "lumber"]],
  ["fence-material", "Fence Material Calculator", "Estimate fence posts, pickets, rails, and sections from a fence layout.", ["fence", "posts", "pickets"]],
  ["drywall", "Drywall Calculator", "Estimate drywall sheets for room walls and ceiling with cutting waste.", ["drywall", "sheetrock", "walls"]],
  ["brick", "Brick Calculator", "Estimate bricks for a wall from brick face size, mortar joint, openings, and waste.", ["brick", "masonry", "wall"]],
] as const;

catalogTools.push(...priorityOneExpansionSlugs.map((slug) => {
  const definition = priorityOneExpansionDefinitions[slug];
  const categoryNames: Record<string, string> = {
    automotive: "Automotive & EV",
    converters: "Converters",
    education: "Education",
    finance: "Money & Finance",
    health: "Health",
  };
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    category: categoryNames[definition.category] ?? definition.category,
    categorySlug: definition.categorySlug,
    href: definition.href,
    tags: [...definition.tags],
    featured: false,
    lastUpdated: "August 2026",
  };
}));

catalogTools.push(...phaseTwoSlugs.map((slug) => {
  const definition = phaseTwoDefinitions[slug];
  const categoryNames: Record<string, string> = {
    construction: "Home & Construction",
    electrical: "Electrical",
    finance: "Money & Finance",
    math: "Math",
    "date-time": "Date & Time",
  };
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    category: categoryNames[definition.categorySlug] ?? definition.category,
    categorySlug: definition.categorySlug,
    href: definition.href,
    tags: [...definition.tags],
    featured: false,
    lastUpdated: "August 2026",
  };
}));

catalogTools.push(...phaseThreeASlugs.map((slug) => {
  const definition = phaseThreeADefinitions[slug];
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    categorySlug: definition.categorySlug,
    href: definition.href,
    tags: [...definition.tags],
    featured: false,
    lastUpdated: "August 2026",
  };
}));

catalogTools.push(...phaseThreeBSlugs.map((slug) => {
  const definition = phaseThreeBDefinitions[slug];
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    categorySlug: definition.categorySlug,
    href: definition.href,
    tags: [...definition.tags],
    featured: false,
    lastUpdated: CATALOG_LAST_UPDATED,
  };
}));

catalogTools.push(...phaseThreeCNewSlugs.map((slug) => {
  const definition = phaseThreeCDefinitions[slug];
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    categorySlug: definition.categorySlug,
    href: definition.href,
    tags: [...definition.tags],
    featured: false,
    lastUpdated: CATALOG_LAST_UPDATED,
  };
}));
catalogTools.push(...phaseFourRoutes.map((entry) => ({
  slug: entry.slug,
  name: entry.name,
  description: entry.description,
  category: entry.category,
  categorySlug: entry.categorySlug,
  href: entry.href,
  tags: [...entry.tags],
  featured: false,
  lastUpdated: CATALOG_LAST_UPDATED,
})));

for (const slug of phaseThreeCExpandedSlugs) {
  const index = catalogTools.findIndex((tool) => tool.slug === slug);
  if (index < 0) throw new Error(`Missing Phase 3C expanded catalog tool: ${slug}`);
  const definition = phaseThreeCDefinitions[slug];
  catalogTools[index] = {
    ...catalogTools[index],
    name: definition.name,
    description: definition.description,
    category: definition.category,
    categorySlug: definition.categorySlug,
    href: definition.href,
    tags: [...definition.tags],
  };
}

catalogTools.push(...expandedConstructionTools.map(([slug, name, description, tags]) => ({
  slug,
  name,
  description,
  category: "Home & Construction",
  categorySlug: "construction",
  href: `/calculators/construction/${slug}`,
  tags: [...tags],
  featured: false,
  lastUpdated: "August 2026",
  icon: "blocks",
})));

// Keep the broad Unit Converter as an indexable web hub, but expose only its
// eight focused converter destinations in the calculator discovery catalog.
catalogTools.splice(catalogTools.findIndex((tool) => tool.slug === "unit"), 1);

export const catalogCategories = [
  { slug: "finance", name: "Money & Finance", description: "Make clearer decisions with money, interest, loans, and pricing tools.", accent: "#ef8f62" },
  { slug: "salary-work", name: "Salary & Work", description: "Understand pay, hours, and the numbers behind your working life.", accent: "#4a93a8" },
  { slug: "business", name: "Business", description: "Practical calculators for pricing, profitability, and planning.", accent: "#d99a45" },
  { slug: "construction", name: "Home & Construction", description: "Plan materials and measurements before you start the work.", accent: "#c57745" },
  { slug: "electrical", name: "Electrical", description: "Estimate circuit values and electrical performance with clear formulas, units, and safety limits.", accent: "#d8a34a" },
  { slug: "technology", name: "Technology", description: "Work with networks, data encoding, transfer rates, and secure local utilities.", accent: "#4c84c6" },
  { slug: "science-engineering", name: "Science & Engineering", description: "Calculate physical quantities, weather measures, chemistry concentrations, motion, and mechanical power.", accent: "#637ea8" },
  { slug: "automotive", name: "Automotive & EV", description: "Compare fuel, charging, power, and the real cost of getting around.", accent: "#8d78bd" },
  { slug: "math", name: "Math", description: "Straightforward answers for everyday geometry and percentages.", accent: "#45a995" },
  { slug: "converters", name: "Converters", description: "Switch between the units you use every day.", accent: "#4a93a8" },
  { slug: "date-time", name: "Date & Time", description: "Count, compare, and plan with confidence.", accent: "#d47a8a" },
  { slug: "printing-design", name: "Printing & Design", description: "Get the right size, resolution, and output for your work.", accent: "#788bd0" },
  { slug: "health", name: "Health", description: "Use transparent health, fitness, pregnancy, and wellbeing estimates with clear safety limits.", accent: "#5b9d83" },
  { slug: "education", name: "Education", description: "Check grades and weighted academic averages with clear, reproducible arithmetic.", accent: "#7b83c5" },
].map((category) => ({
  ...category,
  toolCount: new Set(catalogTools
    .filter((tool) => tool.categorySlug === category.slug)
    .map((tool) => tool.href)).size,
}));

export const catalogRouter: IRouter = Router();

catalogRouter.get("/tools", (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : undefined;
  const filtered = catalogTools.filter((tool) => {
    const categoryMatch = !category || tool.categorySlug === category;
    const searchMatch =
      !search ||
      [tool.name, tool.description, tool.category, ...tool.tags]
        .join(" ")
        .toLowerCase()
        .includes(search);
    return categoryMatch && searchMatch;
  });
  res.json(ListToolsResponse.parse(filtered));
});

catalogRouter.get("/tools/:slug", (req, res) => {
  const tool = catalogTools.find((candidate) => candidate.slug === req.params.slug);
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  res.json(GetToolResponse.parse(tool));
});

catalogRouter.get("/categories", (_req, res) => {
  res.json(ListCategoriesResponse.parse(catalogCategories));
});

catalogRouter.get("/analytics/summary", (_req, res) => {
  const largestCategory = [...catalogCategories].sort((a, b) => b.toolCount - a.toolCount)[0];
  res.json(
    GetAnalyticsSummaryResponse.parse({
      totalTools: catalogTools.length,
      calculationsToday: 0,
      topCategory: largestCategory?.name ?? "",
    }),
  );
});