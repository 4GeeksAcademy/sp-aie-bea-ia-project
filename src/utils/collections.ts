import { Location, MenuCategory, MenuItem, SaleTransaction } from "../types/business";

export function filterSalesByLocation(
  sales: SaleTransaction[],
  locationId: string
): SaleTransaction[] {
  if (!Array.isArray(sales) || !locationId) return [];
  return sales.filter((sale) => sale.locationId === locationId);
}

export function filterSalesByDateRange(
  sales: SaleTransaction[],
  startDate: Date,
  endDate: Date
): SaleTransaction[] {
  if (!Array.isArray(sales)) return [];

  const start = startDate.getTime();
  const end = endDate.getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return [];

  return sales.filter((sale) => {
    const saleTime = new Date(sale.timestamp).getTime();
    return saleTime >= start && saleTime <= end;
  });
}

export function filterMenuItemsByCategory(
  items: MenuItem[],
  category: MenuCategory
): MenuItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item.category === category);
}

export function filterActiveLocations(locations: Location[]): Location[] {
  if (!Array.isArray(locations)) return [];
  return locations.filter((location) => location.status === "Active");
}

export function sortLocationsByCapacity(
  locations: Location[],
  order: "asc" | "desc"
): Location[] {
  if (!Array.isArray(locations)) return [];

  const direction = order === "desc" ? -1 : 1;
  return [...locations].sort(
    (a, b) => direction * (a.seatingCapacity - b.seatingCapacity)
  );
}

export function sortMenuItemsByPrice(
  items: MenuItem[],
  currency: "USD" | "COP",
  order: "asc" | "desc"
): MenuItem[] {
  if (!Array.isArray(items)) return [];

  const direction = order === "desc" ? -1 : 1;
  return [...items].sort(
    (a, b) => direction * (a.basePrice[currency] - b.basePrice[currency])
  );
}
