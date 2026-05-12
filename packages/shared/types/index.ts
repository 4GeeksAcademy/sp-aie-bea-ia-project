/**
 * Shared types for transversal project apps.
 * Extend with domain types (e.g. Location, Sale, Customer) as needed.
 */
export type Id = string;

export interface BaseEntity {
  id: Id;
  createdAt?: string;
  updatedAt?: string;
}

export type CurrencyCode = "USD" | "COP" | string;

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface Location extends BaseEntity {
  name: string;
  city: string;
  country: string;
  timezone?: string;
  isActive?: boolean;
}

export interface MenuItem extends BaseEntity {
  sku: string;
  name: string;
  category: string;
  salePrice: Money;
  recipeCost: Money;
  isActive?: boolean;
}

export interface SaleLineItem {
  menuItemId: Id;
  productName: string;
  quantity: number;
  unitPrice: Money;
  unitCost: Money;
}

export interface Sale extends BaseEntity {
  locationId: Id;
  soldAt: string;
  items: SaleLineItem[];
  discount?: Money;
}

export interface WasteRecord extends BaseEntity {
  locationId: Id;
  recordedAt: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedCost: Money;
}

export interface ExchangeRateTable {
  baseCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface SalesFilter {
  locationIds?: Id[];
  startDate?: string;
  endDate?: string;
  productQuery?: string;
  menuItemIds?: Id[];
  minRevenue?: number;
  maxRevenue?: number;
  currency?: CurrencyCode;
  rates?: ExchangeRateTable;
}

export interface FinancialMetrics {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  currency: CurrencyCode;
}

export interface LocationPerformanceInput {
  locationId: Id;
  revenue: number;
  margin: number;
  wasteRatio: number;
  fulfillmentRate: number;
  avgTicket: number;
}

export interface LocationPerformanceWeights {
  revenue: number;
  margin: number;
  wasteControl: number;
  fulfillment: number;
  avgTicket: number;
}

export interface LocationPerformanceTargets {
  revenue: number;
  margin: number;
  maxWasteRatio: number;
  fulfillmentRate: number;
  avgTicket: number;
}

export interface LocationPerformanceResult {
  locationId: Id;
  score: number;
  breakdown: Record<keyof LocationPerformanceWeights, number>;
}

export interface LocationOperationalMetrics {
  locationId: Id;
  fulfillmentRate?: number;
  avgTicket?: number;
}

export interface LocationReport {
  locationId: Id;
  locationName: string;
  salesCount: number;
  itemsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  wasteCost: number;
  wasteRatio: number;
  performanceScore: number;
  currency: CurrencyCode;
}

export interface ProductReport {
  menuItemId: Id;
  productName: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  currency: CurrencyCode;
}

export interface OperationsReport {
  period: {
    startDate?: string;
    endDate?: string;
  };
  totals: {
    salesCount: number;
    itemsSold: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    wasteCost: number;
    wasteRatio: number;
    currency: CurrencyCode;
  };
  byLocation: LocationReport[];
  topProducts: ProductReport[];
}

const DEFAULT_WEIGHTS: LocationPerformanceWeights = {
  revenue: 0.3,
  margin: 0.25,
  wasteControl: 0.2,
  fulfillment: 0.15,
  avgTicket: 0.1,
};

const DEFAULT_TARGETS: LocationPerformanceTargets = {
  revenue: 10000,
  margin: 0.25,
  maxWasteRatio: 0.08,
  fulfillmentRate: 0.95,
  avgTicket: 18,
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function isISODate(value: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function toTimestamp(value?: string): number | undefined {
  if (!value || !isISODate(value)) {
    return undefined;
  }
  return new Date(value).getTime();
}

function ensureWeightTotal(weights: LocationPerformanceWeights): LocationPerformanceWeights {
  const total =
    weights.revenue +
    weights.margin +
    weights.wasteControl +
    weights.fulfillment +
    weights.avgTicket;

  if (total <= 0) {
    return DEFAULT_WEIGHTS;
  }

  return {
    revenue: weights.revenue / total,
    margin: weights.margin / total,
    wasteControl: weights.wasteControl / total,
    fulfillment: weights.fulfillment / total,
    avgTicket: weights.avgTicket / total,
  };
}

export function convertMoney(
  value: Money,
  targetCurrency: CurrencyCode,
  rates: ExchangeRateTable
): Money {
  if (value.currency === targetCurrency) {
    return { ...value };
  }

  const fromRate = value.currency === rates.baseCurrency ? 1 : rates.rates[value.currency];
  const toRate = targetCurrency === rates.baseCurrency ? 1 : rates.rates[targetCurrency];

  if (!fromRate || !toRate) {
    throw new Error(
      `Missing exchange rate for conversion from ${value.currency} to ${targetCurrency}`
    );
  }

  const valueInBase = value.amount / fromRate;
  return {
    amount: valueInBase * toRate,
    currency: targetCurrency,
  };
}

export function calculateSaleFinancialMetrics(
  sale: Sale,
  targetCurrency: CurrencyCode,
  rates: ExchangeRateTable
): FinancialMetrics {
  const revenue = sale.items.reduce((total, item) => {
    const converted = convertMoney(item.unitPrice, targetCurrency, rates);
    return total + converted.amount * item.quantity;
  }, 0);

  const cost = sale.items.reduce((total, item) => {
    const converted = convertMoney(item.unitCost, targetCurrency, rates);
    return total + converted.amount * item.quantity;
  }, 0);

  const discount = sale.discount
    ? convertMoney(sale.discount, targetCurrency, rates).amount
    : 0;

  const netRevenue = Math.max(0, revenue - discount);
  const profit = netRevenue - cost;
  const margin = safeDivide(profit, netRevenue);

  return {
    revenue: round(netRevenue),
    cost: round(cost),
    profit: round(profit),
    margin: round(margin, 4),
    currency: targetCurrency,
  };
}

export function filterSales(sales: Sale[], filter: SalesFilter): Sale[] {
  const start = toTimestamp(filter.startDate);
  const end = toTimestamp(filter.endDate);
  const normalizedProductQuery = filter.productQuery?.trim().toLowerCase();

  return sales.filter((sale) => {
    if (filter.locationIds?.length && !filter.locationIds.includes(sale.locationId)) {
      return false;
    }

    const soldAt = toTimestamp(sale.soldAt);
    if (start !== undefined && (soldAt === undefined || soldAt < start)) {
      return false;
    }

    if (end !== undefined && (soldAt === undefined || soldAt > end)) {
      return false;
    }

    if (filter.menuItemIds?.length) {
      const hasMenuItem = sale.items.some((item) => filter.menuItemIds?.includes(item.menuItemId));
      if (!hasMenuItem) {
        return false;
      }
    }

    if (normalizedProductQuery) {
      const hasProductMatch = sale.items.some((item) =>
        item.productName.toLowerCase().includes(normalizedProductQuery)
      );
      if (!hasProductMatch) {
        return false;
      }
    }

    if (
      filter.minRevenue !== undefined ||
      filter.maxRevenue !== undefined
    ) {
      if (!filter.currency || !filter.rates) {
        throw new Error("currency and rates are required when filtering by revenue range");
      }

      const metrics = calculateSaleFinancialMetrics(sale, filter.currency, filter.rates);
      if (filter.minRevenue !== undefined && metrics.revenue < filter.minRevenue) {
        return false;
      }

      if (filter.maxRevenue !== undefined && metrics.revenue > filter.maxRevenue) {
        return false;
      }
    }

    return true;
  });
}

export function calculateLocationPerformanceScore(
  input: LocationPerformanceInput,
  weights: Partial<LocationPerformanceWeights> = {},
  targets: Partial<LocationPerformanceTargets> = {}
): LocationPerformanceResult {
  const normalizedWeights = ensureWeightTotal({ ...DEFAULT_WEIGHTS, ...weights });
  const effectiveTargets: LocationPerformanceTargets = { ...DEFAULT_TARGETS, ...targets };

  const breakdown = {
    revenue: clamp(safeDivide(input.revenue, effectiveTargets.revenue)),
    margin: clamp(safeDivide(input.margin, effectiveTargets.margin)),
    wasteControl: clamp(
      1 - safeDivide(Math.max(0, input.wasteRatio), Math.max(0.0001, effectiveTargets.maxWasteRatio))
    ),
    fulfillment: clamp(safeDivide(input.fulfillmentRate, effectiveTargets.fulfillmentRate)),
    avgTicket: clamp(safeDivide(input.avgTicket, effectiveTargets.avgTicket)),
  };

  const score =
    breakdown.revenue * normalizedWeights.revenue +
    breakdown.margin * normalizedWeights.margin +
    breakdown.wasteControl * normalizedWeights.wasteControl +
    breakdown.fulfillment * normalizedWeights.fulfillment +
    breakdown.avgTicket * normalizedWeights.avgTicket;

  return {
    locationId: input.locationId,
    score: round(score * 100),
    breakdown,
  };
}

export function validateLocation(location: Location): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!location.id) issues.push({ field: "id", message: "Location id is required" });
  if (!location.name?.trim()) issues.push({ field: "name", message: "Location name is required" });
  if (!location.city?.trim()) issues.push({ field: "city", message: "Location city is required" });
  if (!location.country?.trim()) issues.push({ field: "country", message: "Location country is required" });

  return { isValid: issues.length === 0, issues };
}

export function validateMenuItem(menuItem: MenuItem): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!menuItem.id) issues.push({ field: "id", message: "Menu item id is required" });
  if (!menuItem.sku?.trim()) issues.push({ field: "sku", message: "Menu item sku is required" });
  if (!menuItem.name?.trim()) issues.push({ field: "name", message: "Menu item name is required" });
  if (!menuItem.category?.trim()) {
    issues.push({ field: "category", message: "Menu item category is required" });
  }
  if (!Number.isFinite(menuItem.salePrice.amount) || menuItem.salePrice.amount < 0) {
    issues.push({ field: "salePrice.amount", message: "Sale price must be a positive number" });
  }
  if (!menuItem.salePrice.currency) {
    issues.push({ field: "salePrice.currency", message: "Sale price currency is required" });
  }
  if (!Number.isFinite(menuItem.recipeCost.amount) || menuItem.recipeCost.amount < 0) {
    issues.push({ field: "recipeCost.amount", message: "Recipe cost must be a positive number" });
  }
  if (!menuItem.recipeCost.currency) {
    issues.push({ field: "recipeCost.currency", message: "Recipe cost currency is required" });
  }

  return { isValid: issues.length === 0, issues };
}

export function validateSale(sale: Sale): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!sale.id) issues.push({ field: "id", message: "Sale id is required" });
  if (!sale.locationId) {
    issues.push({ field: "locationId", message: "Sale locationId is required" });
  }
  if (!isISODate(sale.soldAt)) {
    issues.push({ field: "soldAt", message: "Sale soldAt must be a valid ISO date" });
  }
  if (!sale.items.length) {
    issues.push({ field: "items", message: "Sale must include at least one item" });
  }

  sale.items.forEach((item, index) => {
    if (!item.menuItemId) {
      issues.push({ field: `items[${index}].menuItemId`, message: "menuItemId is required" });
    }
    if (!item.productName?.trim()) {
      issues.push({ field: `items[${index}].productName`, message: "productName is required" });
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      issues.push({ field: `items[${index}].quantity`, message: "quantity must be > 0" });
    }
    if (!Number.isFinite(item.unitPrice.amount) || item.unitPrice.amount < 0) {
      issues.push({ field: `items[${index}].unitPrice.amount`, message: "unitPrice must be >= 0" });
    }
    if (!item.unitPrice.currency) {
      issues.push({ field: `items[${index}].unitPrice.currency`, message: "unitPrice currency is required" });
    }
    if (!Number.isFinite(item.unitCost.amount) || item.unitCost.amount < 0) {
      issues.push({ field: `items[${index}].unitCost.amount`, message: "unitCost must be >= 0" });
    }
    if (!item.unitCost.currency) {
      issues.push({ field: `items[${index}].unitCost.currency`, message: "unitCost currency is required" });
    }
  });

  if (sale.discount) {
    if (!Number.isFinite(sale.discount.amount) || sale.discount.amount < 0) {
      issues.push({ field: "discount.amount", message: "discount amount must be >= 0" });
    }
    if (!sale.discount.currency) {
      issues.push({ field: "discount.currency", message: "discount currency is required" });
    }
  }

  return { isValid: issues.length === 0, issues };
}

export function validateWasteRecord(record: WasteRecord): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!record.id) issues.push({ field: "id", message: "Waste id is required" });
  if (!record.locationId) {
    issues.push({ field: "locationId", message: "Waste locationId is required" });
  }
  if (!isISODate(record.recordedAt)) {
    issues.push({ field: "recordedAt", message: "Waste recordedAt must be a valid ISO date" });
  }
  if (!record.ingredientName?.trim()) {
    issues.push({ field: "ingredientName", message: "ingredientName is required" });
  }
  if (!Number.isFinite(record.quantity) || record.quantity <= 0) {
    issues.push({ field: "quantity", message: "quantity must be > 0" });
  }
  if (!record.unit?.trim()) {
    issues.push({ field: "unit", message: "unit is required" });
  }
  if (!Number.isFinite(record.estimatedCost.amount) || record.estimatedCost.amount < 0) {
    issues.push({
      field: "estimatedCost.amount",
      message: "estimatedCost amount must be >= 0",
    });
  }
  if (!record.estimatedCost.currency) {
    issues.push({
      field: "estimatedCost.currency",
      message: "estimatedCost currency is required",
    });
  }

  return { isValid: issues.length === 0, issues };
}

export function validateOperationsData(payload: {
  locations: Location[];
  menuItems: MenuItem[];
  sales: Sale[];
  wasteRecords?: WasteRecord[];
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  payload.locations.forEach((location, index) => {
    const result = validateLocation(location);
    result.issues.forEach((issue) => {
      issues.push({
        field: `locations[${index}].${issue.field}`,
        message: issue.message,
      });
    });
  });

  payload.menuItems.forEach((menuItem, index) => {
    const result = validateMenuItem(menuItem);
    result.issues.forEach((issue) => {
      issues.push({
        field: `menuItems[${index}].${issue.field}`,
        message: issue.message,
      });
    });
  });

  payload.sales.forEach((sale, index) => {
    const result = validateSale(sale);
    result.issues.forEach((issue) => {
      issues.push({
        field: `sales[${index}].${issue.field}`,
        message: issue.message,
      });
    });
  });

  payload.wasteRecords?.forEach((record, index) => {
    const result = validateWasteRecord(record);
    result.issues.forEach((issue) => {
      issues.push({
        field: `wasteRecords[${index}].${issue.field}`,
        message: issue.message,
      });
    });
  });

  return { isValid: issues.length === 0, issues };
}

export function generateOperationsReport(params: {
  locations: Location[];
  sales: Sale[];
  wasteRecords?: WasteRecord[];
  targetCurrency: CurrencyCode;
  rates: ExchangeRateTable;
  startDate?: string;
  endDate?: string;
  topProductsLimit?: number;
  scoringWeights?: Partial<LocationPerformanceWeights>;
  scoringTargets?: Partial<LocationPerformanceTargets>;
  operationalMetrics?: LocationOperationalMetrics[];
}): OperationsReport {
  const {
    locations,
    sales,
    wasteRecords = [],
    targetCurrency,
    rates,
    startDate,
    endDate,
    topProductsLimit = 5,
    scoringWeights,
    scoringTargets,
    operationalMetrics = [],
  } = params;

  const periodSales = filterSales(sales, { startDate, endDate });

  const locationMap = new Map(locations.map((location) => [location.id, location]));
  const operationalMap = new Map(operationalMetrics.map((metric) => [metric.locationId, metric]));

  const wasteByLocation = new Map<Id, number>();
  wasteRecords.forEach((record) => {
    const recordedAt = toTimestamp(record.recordedAt);
    const start = toTimestamp(startDate);
    const end = toTimestamp(endDate);

    if (start !== undefined && (recordedAt === undefined || recordedAt < start)) return;
    if (end !== undefined && (recordedAt === undefined || recordedAt > end)) return;

    const wasteCost = convertMoney(record.estimatedCost, targetCurrency, rates).amount;
    wasteByLocation.set(record.locationId, (wasteByLocation.get(record.locationId) ?? 0) + wasteCost);
  });

  const productAccumulator = new Map<
    string,
    {
      menuItemId: Id;
      productName: string;
      quantity: number;
      revenue: number;
      cost: number;
    }
  >();

  const locationAccumulator = new Map<
    Id,
    {
      salesCount: number;
      itemsSold: number;
      revenue: number;
      cost: number;
    }
  >();

  periodSales.forEach((sale) => {
    const financial = calculateSaleFinancialMetrics(sale, targetCurrency, rates);
    const locationEntry = locationAccumulator.get(sale.locationId) ?? {
      salesCount: 0,
      itemsSold: 0,
      revenue: 0,
      cost: 0,
    };

    locationEntry.salesCount += 1;
    locationEntry.itemsSold += sale.items.reduce((sum, item) => sum + item.quantity, 0);
    locationEntry.revenue += financial.revenue;
    locationEntry.cost += financial.cost;
    locationAccumulator.set(sale.locationId, locationEntry);

    sale.items.forEach((item) => {
      const key = `${item.menuItemId}:${item.productName}`;
      const productEntry = productAccumulator.get(key) ?? {
        menuItemId: item.menuItemId,
        productName: item.productName,
        quantity: 0,
        revenue: 0,
        cost: 0,
      };

      const revenue = convertMoney(item.unitPrice, targetCurrency, rates).amount * item.quantity;
      const cost = convertMoney(item.unitCost, targetCurrency, rates).amount * item.quantity;

      productEntry.quantity += item.quantity;
      productEntry.revenue += revenue;
      productEntry.cost += cost;

      productAccumulator.set(key, productEntry);
    });
  });

  const byLocation: LocationReport[] = locations.map((location) => {
    const aggregate = locationAccumulator.get(location.id) ?? {
      salesCount: 0,
      itemsSold: 0,
      revenue: 0,
      cost: 0,
    };

    const wasteCost = wasteByLocation.get(location.id) ?? 0;
    const profit = aggregate.revenue - aggregate.cost;
    const margin = safeDivide(profit, aggregate.revenue);
    const wasteRatio = safeDivide(wasteCost, aggregate.revenue);

    const ops = operationalMap.get(location.id);
    const avgTicket =
      ops?.avgTicket !== undefined
        ? ops.avgTicket
        : safeDivide(aggregate.revenue, aggregate.salesCount);
    const fulfillmentRate = ops?.fulfillmentRate ?? 1;

    const performance = calculateLocationPerformanceScore(
      {
        locationId: location.id,
        revenue: aggregate.revenue,
        margin,
        wasteRatio,
        fulfillmentRate,
        avgTicket,
      },
      scoringWeights,
      scoringTargets
    );

    return {
      locationId: location.id,
      locationName: location.name,
      salesCount: aggregate.salesCount,
      itemsSold: aggregate.itemsSold,
      revenue: round(aggregate.revenue),
      cost: round(aggregate.cost),
      profit: round(profit),
      margin: round(margin, 4),
      wasteCost: round(wasteCost),
      wasteRatio: round(wasteRatio, 4),
      performanceScore: performance.score,
      currency: targetCurrency,
    };
  });

  const totals = byLocation.reduce(
    (acc, location) => {
      acc.salesCount += location.salesCount;
      acc.itemsSold += location.itemsSold;
      acc.revenue += location.revenue;
      acc.cost += location.cost;
      acc.profit += location.profit;
      acc.wasteCost += location.wasteCost;
      return acc;
    },
    {
      salesCount: 0,
      itemsSold: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
      wasteCost: 0,
    }
  );

  const topProducts: ProductReport[] = Array.from(productAccumulator.values())
    .map((product) => {
      const profit = product.revenue - product.cost;
      return {
        menuItemId: product.menuItemId,
        productName: product.productName,
        quantity: product.quantity,
        revenue: round(product.revenue),
        cost: round(product.cost),
        profit: round(profit),
        margin: round(safeDivide(profit, product.revenue), 4),
        currency: targetCurrency,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, Math.max(1, topProductsLimit));

  const totalRevenue = totals.revenue;
  const totalMargin = safeDivide(totals.profit, totalRevenue);
  const totalWasteRatio = safeDivide(totals.wasteCost, totalRevenue);

  return {
    period: {
      startDate,
      endDate,
    },
    totals: {
      salesCount: totals.salesCount,
      itemsSold: totals.itemsSold,
      revenue: round(totals.revenue),
      cost: round(totals.cost),
      profit: round(totals.profit),
      margin: round(totalMargin, 4),
      wasteCost: round(totals.wasteCost),
      wasteRatio: round(totalWasteRatio, 4),
      currency: targetCurrency,
    },
    byLocation: byLocation
      .filter((row) => locationMap.has(row.locationId))
      .sort((a, b) => b.revenue - a.revenue),
    topProducts,
  };
}
