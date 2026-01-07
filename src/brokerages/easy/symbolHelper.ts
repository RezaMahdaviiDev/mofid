/**
 * Helper functions for symbol operations
 */

/**
 * Mapping نماد به ISIN
 */
export const symbolToIsin: Record<string, string> = {
  'زر': 'IRTKZARF0001',
  'افران': 'IRT1AFRN0001', // ISIN برای افران
  // می‌توانید نمادهای دیگر را اضافه کنید
};

/**
 * تبدیل نماد به ISIN
 */
export function getIsinForSymbol(symbol: string): string {
  return symbolToIsin[symbol] || symbolToIsin['زر']; // fallback به زر
}

/**
 * ساخت selector برای نماد
 */
export function getSymbolSelector(symbol: string): string {
  const isin = getIsinForSymbol(symbol);
  return `[data-cy='symbol-name-renderer-${isin}']`;
}

