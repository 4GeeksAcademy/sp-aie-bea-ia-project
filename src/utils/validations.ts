import { Location, MenuItem, SaleTransaction } from "../types/business";

export function validateMenuItem(item: MenuItem): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.name || item.name.trim().length === 0) {
    errors.push("name must not be empty");
  }

  if (item.basePrice.USD <= 0 || item.basePrice.COP <= 0) {
    errors.push("basePrice USD and COP must be > 0");
  }

  if (item.ingredientCost.USD <= 0 || item.ingredientCost.COP <= 0) {
    errors.push("ingredientCost USD and COP must be > 0");
  }

  if (item.prepTimeMinutes <= 0 || item.prepTimeMinutes > 60) {
    errors.push("prepTimeMinutes must be > 0 and <= 60");
  }

  if (!item.isAvailableInColombia && !item.isAvailableInUSA) {
    errors.push("item must be available in at least one country");
  }

  return { valid: errors.length === 0, errors };
}

export function validateSaleTransaction(
  sale: SaleTransaction
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (sale.quantity <= 0) {
    errors.push("quantity must be > 0");
  }

  if (sale.totalPrice.USD <= 0 || sale.totalPrice.COP <= 0) {
    errors.push("totalPrice USD and COP must be > 0");
  }

  if (!sale.waiterName || sale.waiterName.trim().length === 0) {
    errors.push("waiterName must not be empty");
  }

  return { valid: errors.length === 0, errors };
}

export function validateLocation(
  location: Location
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  if (location.openingYear < 2008 || location.openingYear > currentYear) {
    errors.push("openingYear must be between 2008 and current year");
  }

  if (location.seatingCapacity <= 0) {
    errors.push("seatingCapacity must be > 0");
  }

  if (location.staffCount <= 0) {
    errors.push("staffCount must be > 0");
  }

  if (location.monthlyRentCost.USD <= 0 || location.monthlyRentCost.COP <= 0) {
    errors.push("monthlyRentCost USD and COP must be > 0");
  }

  if (
    location.averageMonthlyUtilities.USD <= 0 ||
    location.averageMonthlyUtilities.COP <= 0
  ) {
    errors.push("averageMonthlyUtilities USD and COP must be > 0");
  }

  return { valid: errors.length === 0, errors };
}
