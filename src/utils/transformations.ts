import {
  CountryMetrics,
  Location,
  MenuItem,
  PaymentMethod,
  Price,
  SaleTransaction,
  WasteReason,
  WasteRecord,
} from "../types/business";

const USD_TO_COP_RATE = 4000;

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isSameCalendarDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function emptyPrice(): Price {
  return { USD: 0, COP: 0 };
}

export function convertCurrency(
  amount: number,
  fromCurrency: "USD" | "COP",
  toCurrency: "USD" | "COP"
): number {
  if (!Number.isFinite(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;

  const converted =
    fromCurrency === "USD" && toCurrency === "COP"
      ? amount * USD_TO_COP_RATE
      : amount / USD_TO_COP_RATE;

  return roundTo2(converted);
}

export function calculateDailyRevenue(
  sales: SaleTransaction[],
  date: Date,
  currency: "USD" | "COP"
): number {
  if (!Array.isArray(sales) || Number.isNaN(date.getTime())) return 0;

  const total = sales.reduce((sum, sale) => {
    const saleDate = new Date(sale.timestamp);
    if (!isSameCalendarDate(saleDate, date)) return sum;
    return sum + sale.totalPrice[currency];
  }, 0);

  return roundTo2(total);
}

export function calculateLocationMargin(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  locationId: string,
  currency: "USD" | "COP"
): number {
  if (!Array.isArray(sales) || !Array.isArray(menuItems) || !locationId) return 0;

  const itemCostById = new Map(menuItems.map((item) => [item.id, item.ingredientCost[currency]]));

  let totalRevenue = 0;
  let totalIngredientCost = 0;

  for (const sale of sales) {
    if (sale.locationId !== locationId) continue;

    totalRevenue += sale.totalPrice[currency];

    const unitCost = itemCostById.get(sale.itemId) ?? 0;
    totalIngredientCost += unitCost * sale.quantity;
  }

  if (totalRevenue <= 0) return 0;

  const margin = ((totalRevenue - totalIngredientCost) / totalRevenue) * 100;
  return roundTo2(margin);
}

export function calculateWasteCost(
  wasteRecords: WasteRecord[],
  locationId: string,
  currency: "USD" | "COP"
): number {
  if (!Array.isArray(wasteRecords) || !locationId) return 0;

  const total = wasteRecords.reduce((sum, record) => {
    if (record.locationId !== locationId) return sum;
    return sum + record.cost[currency];
  }, 0);

  return roundTo2(total);
}

export function scoreLocationPerformance(
  location: Location,
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[]
): number {
  const locationSales = Array.isArray(sales)
    ? sales.filter((sale) => sale.locationId === location.id)
    : [];

  const totalRevenueUSD = locationSales.reduce((sum, sale) => sum + sale.totalPrice.USD, 0);

  const currentYear = new Date().getFullYear();
  const operationalDays = Math.max(1, (currentYear - location.openingYear + 1) * 365);
  const averageDailyRevenueUSD = totalRevenueUSD / operationalDays;
  const revenueScore = Math.min((averageDailyRevenueUSD / 1000) * 40, 40);

  const efficiencyBase = location.seatingCapacity > 0 ? locationSales.length / location.seatingCapacity : 0;
  const efficiencyScore = Math.min(efficiencyBase * 30, 30);

  const totalWasteUSD = calculateWasteCost(wasteRecords, location.id, "USD");
  const wastePercent = totalRevenueUSD > 0 ? (totalWasteUSD / totalRevenueUSD) * 100 : 0;
  const wasteScore = Math.max(20 - wastePercent * 2, 0);

  const margin = calculateLocationMargin(sales, menuItems, location.id, "USD");
  const marginScore = Math.min(margin / 10, 10);

  return roundTo2(revenueScore + efficiencyScore + wasteScore + marginScore);
}

export function rankLocationsByPerformance(
  locations: Location[],
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[]
): Array<{ location: Location; score: number }> {
  if (!Array.isArray(locations)) return [];

  return [...locations]
    .map((location) => ({
      location,
      score: scoreLocationPerformance(location, sales, wasteRecords, menuItems),
    }))
    .sort((a, b) => b.score - a.score);
}

export function countSalesByPaymentMethod(
  sales: SaleTransaction[]
): Record<PaymentMethod, number> {
  const result: Record<PaymentMethod, number> = {
    Cash: 0,
    "Credit card": 0,
    "Debit card": 0,
    "Digital wallet": 0,
  };

  if (!Array.isArray(sales)) return result;

  for (const sale of sales) {
    result[sale.paymentMethod] += 1;
  }

  return result;
}

export function calculateAverageTicket(
  sales: SaleTransaction[],
  currency: "USD" | "COP"
): number {
  if (!Array.isArray(sales) || sales.length === 0) return 0;

  const total = sales.reduce((sum, sale) => sum + sale.totalPrice[currency], 0);
  return roundTo2(total / sales.length);
}

export function findTopSellingItems(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  topN: number
): Array<{ item: MenuItem; totalSold: number }> {
  if (!Array.isArray(sales) || !Array.isArray(menuItems) || topN <= 0) return [];

  const quantityByItemId = new Map<string, number>();
  for (const sale of sales) {
    quantityByItemId.set(sale.itemId, (quantityByItemId.get(sale.itemId) ?? 0) + sale.quantity);
  }

  const itemById = new Map(menuItems.map((item) => [item.id, item]));

  return [...quantityByItemId.entries()]
    .map(([itemId, totalSold]) => {
      const item = itemById.get(itemId);
      return item ? { item, totalSold } : null;
    })
    .filter((entry): entry is { item: MenuItem; totalSold: number } => entry !== null)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, topN);
}

export function groupWasteByReason(
  wasteRecords: WasteRecord[]
): Record<WasteReason, WasteRecord[]> {
  const grouped: Record<WasteReason, WasteRecord[]> = {
    Expired: [],
    "Cooking error": [],
    "Customer return": [],
    Damage: [],
    Other: [],
  };

  if (!Array.isArray(wasteRecords)) return grouped;

  for (const record of wasteRecords) {
    grouped[record.reason].push(record);
  }

  return grouped;
}

export function calculateCountryComparison(
  sales: SaleTransaction[],
  locations: Location[],
  _menuItems: MenuItem[]
): { Colombia: CountryMetrics; USA: CountryMetrics } {
  const baseMetrics = (): CountryMetrics => ({
    totalLocations: 0,
    totalRevenue: emptyPrice(),
    averageRevenuePerLocation: emptyPrice(),
    totalSales: 0,
  });

  const result = {
    Colombia: baseMetrics(),
    USA: baseMetrics(),
  };

  if (!Array.isArray(locations) || !Array.isArray(sales)) {
    return result;
  }

  const countryByLocationId = new Map(locations.map((location) => [location.id, location.country]));

  result.Colombia.totalLocations = locations.filter((location) => location.country === "Colombia").length;
  result.USA.totalLocations = locations.filter((location) => location.country === "USA").length;

  for (const sale of sales) {
    const country = countryByLocationId.get(sale.locationId);
    if (!country) continue;

    const metrics = country === "Colombia" ? result.Colombia : result.USA;
    metrics.totalSales += 1;
    metrics.totalRevenue.USD += sale.totalPrice.USD;
    metrics.totalRevenue.COP += sale.totalPrice.COP;
  }

  result.Colombia.totalRevenue.USD = roundTo2(result.Colombia.totalRevenue.USD);
  result.Colombia.totalRevenue.COP = roundTo2(result.Colombia.totalRevenue.COP);
  result.USA.totalRevenue.USD = roundTo2(result.USA.totalRevenue.USD);
  result.USA.totalRevenue.COP = roundTo2(result.USA.totalRevenue.COP);

  result.Colombia.averageRevenuePerLocation = {
    USD:
      result.Colombia.totalLocations > 0
        ? roundTo2(result.Colombia.totalRevenue.USD / result.Colombia.totalLocations)
        : 0,
    COP:
      result.Colombia.totalLocations > 0
        ? roundTo2(result.Colombia.totalRevenue.COP / result.Colombia.totalLocations)
        : 0,
  };

  result.USA.averageRevenuePerLocation = {
    USD:
      result.USA.totalLocations > 0
        ? roundTo2(result.USA.totalRevenue.USD / result.USA.totalLocations)
        : 0,
    COP:
      result.USA.totalLocations > 0
        ? roundTo2(result.USA.totalRevenue.COP / result.USA.totalLocations)
        : 0,
  };

  return result;
}
