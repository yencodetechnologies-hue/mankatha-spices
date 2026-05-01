import { COUNTRY_OPTIONS } from "../constants";

export const getCountryMeta = (countryName) =>
  COUNTRY_OPTIONS.find((item) => item.country === countryName);

export const resolvePriceByCountryAndWeight = (product, selectedCountry, selectedWeight) => {
  const countryPricing = product?.pricing?.find((entry) => entry.country === selectedCountry);
  if (!countryPricing) return null;

  const weightPricing = countryPricing.weights?.find((w) => w.weight === selectedWeight);
  if (!weightPricing) return null;

  const meta = getCountryMeta(countryPricing.country);
  return {
    price: weightPricing.price,
    currency: countryPricing.currency,
    symbol: meta?.symbol || countryPricing.currency,
  };
};

export const getStockStatus = (stock, minStock) => {
  if (stock <= 0) return "Out of Stock";
  if (stock <= minStock) return "Low Stock";
  return "Active";
};
