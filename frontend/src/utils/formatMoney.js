const LOCALE_MAP = {
  GBP: "en-GB",
  INR: "en-IN",
  AED: "en-AE",
  USD: "en-US",
};

const EXCHANGE_RATES = {
  INR: 1,
  GBP: 0.0095,
  USD: 0.012,
  AED: 0.044,
};

export const APP_CURRENCY = localStorage.getItem("appCurrency") || "GBP";
export const APP_LOCALE = LOCALE_MAP[APP_CURRENCY] || "en-GB";

export function formatMoney(amount, opts = {}) {
  const { minimumFractionDigits, maximumFractionDigits = 2, currency = APP_CURRENCY } = opts;
  const locale = LOCALE_MAP[currency] || APP_LOCALE;
  
  // Convert amount based on base INR
  const rate = EXCHANGE_RATES[currency] || 1;
  const convertedAmount = (Number(amount) || 0) * rate;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(convertedAmount);
}

/** Whole rupees (no cents), for dashboards and list prices. */
export function formatMoneyWhole(amount, currency = APP_CURRENCY) {
  const locale = LOCALE_MAP[currency] || APP_LOCALE;
  
  // Convert amount based on base INR
  const rate = EXCHANGE_RATES[currency] || 1;
  const convertedAmount = (Number(amount) || 0) * rate;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(convertedAmount);
}
