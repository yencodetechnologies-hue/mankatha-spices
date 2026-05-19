/**
 * App-wide money formatting — Sri Lanka Rupee (LKR).
 * Change APP_LOCALE / APP_CURRENCY here to switch region.
 */
export const APP_LOCALE = "en-LK";
export const APP_CURRENCY = "LKR";

const LOCALE_MAP = {
  LKR: "en-LK",
  INR: "en-IN",
  AED: "en-AE",
  USD: "en-US",
};

export function formatMoney(amount, opts = {}) {
  const { minimumFractionDigits, maximumFractionDigits = 2, currency = APP_CURRENCY } = opts;
  const locale = LOCALE_MAP[currency] || APP_LOCALE;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(amount) || 0);
}

/** Whole rupees (no cents), for dashboards and list prices. */
export function formatMoneyWhole(amount, currency = APP_CURRENCY) {
  const locale = LOCALE_MAP[currency] || APP_LOCALE;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}
