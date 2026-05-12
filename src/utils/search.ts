import { Location, MenuItem } from "../types/business";

export function findLocationById(locations: Location[], id: string): Location | null {
  if (!Array.isArray(locations) || !id) return null;

  for (const location of locations) {
    if (location.id === id) {
      return location;
    }
  }

  return null;
}

export function findMenuItemByName(items: MenuItem[], name: string): MenuItem | null {
  if (!Array.isArray(items) || !name) return null;

  for (const item of items) {
    if (item.name === name) {
      return item;
    }
  }

  return null;
}

export function binarySearchLocationByCapacity(
  sortedLocations: Location[],
  targetCapacity: number
): number {
  if (!Array.isArray(sortedLocations) || sortedLocations.length === 0) return -1;

  let left = 0;
  let right = sortedLocations.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const current = sortedLocations[mid].seatingCapacity;

    if (current === targetCapacity) {
      return mid;
    }

    if (current < targetCapacity) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}
