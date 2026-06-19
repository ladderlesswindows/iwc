export const PRICE_PER_WINDOW       = 22; // base rate (up to and including the minimum)
export const PRICE_PER_WINDOW_EXTRA = 20; // each window above the minimum
export const MIN_WINDOWS = 1;
export const MAX_WINDOWS = 20;

// Tiered price: minimum windows at base rate, anything above at the discounted rate
export function calcPrice(count: number, min: number): number {
  const base  = Math.min(count, min) * PRICE_PER_WINDOW;
  const extra = Math.max(0, count - min) * PRICE_PER_WINDOW_EXTRA;
  return base + extra;
}
