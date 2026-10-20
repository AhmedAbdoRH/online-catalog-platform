/**
 * Table Numbers Management for Restaurant/Cafe Mode
 * Parallel system to shipping rates for dine-in establishments
 */

export type TableNumbers = string[];

/**
 * Validates and normalizes table number input
 * Removes empty entries and trims whitespace
 */
export function normalizeTableNumbers(input: unknown): {
  tableNumbers: TableNumbers;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!input || !Array.isArray(input)) {
    return { tableNumbers: [], errors: [] };
  }

  const tableNumbers: TableNumbers = [];
  const seen = new Set<string>();

  for (let i = 0; i < input.length; i++) {
    const rawValue = input[i];
    
    if (typeof rawValue !== 'string') {
      errors.push(`القيمة رقم ${i + 1} يجب أن تكون نص`);
      continue;
    }

    const value = rawValue.trim();
    
    if (!value) {
      continue; // Skip empty entries
    }

    if (value.length > 50) {
      errors.push(`"${value}" طويل جداً (الحد الأقصى 50 حرف)`);
      continue;
    }

    // Check for duplicates (case-insensitive)
    const normalized = value.toLowerCase();
    if (seen.has(normalized)) {
      errors.push(`رقم الطاولة "${value}" مكرر`);
      continue;
    }

    seen.add(normalized);
    tableNumbers.push(value);
  }

  return { tableNumbers, errors };
}

/**
 * Checks if restaurant mode is properly configured
 */
export function hasConfiguredTableNumbers(
  tableNumbers: TableNumbers | null | undefined
): boolean {
  return Array.isArray(tableNumbers) && tableNumbers.length > 0;
}

/**
 * Validates if a selected table number exists in the configured list
 */
export function isValidTableNumber(
  tableNumbers: TableNumbers | null | undefined,
  selectedTable: string | null | undefined
): boolean {
  if (!selectedTable || !Array.isArray(tableNumbers)) {
    return false;
  }

  return tableNumbers.some(
    (table) => table.toLowerCase() === selectedTable.toLowerCase()
  );
}

/**
 * Sorts table numbers intelligently (numbers first, then alphanumeric)
 */
export function sortTableNumbers(tableNumbers: TableNumbers): TableNumbers {
  return [...tableNumbers].sort((a, b) => {
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);

    // Both are numbers
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }

    // Only a is a number
    if (!isNaN(aNum)) {
      return -1;
    }

    // Only b is a number
    if (!isNaN(bNum)) {
      return 1;
    }

    // Both are strings, use locale compare
    return a.localeCompare(b, 'ar', { numeric: true });
  });
}
