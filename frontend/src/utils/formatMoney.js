/**
 * App-wide money formatting — Sri Lanka Rupee (LKR).
 * Change APP_LOCALE / APP_CURRENCY here to switch region.
 */
export const APP_LOCALE = "en-LK";
export const APP_CURRENCY = "LKR";

export function formatMoney(amount, opts = {}) {
  const { minimumFractionDigits, maximumFractionDigits = 2 } = opts;
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: APP_CURRENCY,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(amount) || 0);
}

/** Whole rupees (no cents), for dashboards and list prices. */
export function formatMoneyWhole(amount) {
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: APP_CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}
