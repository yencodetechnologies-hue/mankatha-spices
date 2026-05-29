import { getBackendOrigin } from "../api/adminApiBase";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function absoluteImage(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getBackendOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function adaptBackendProduct(raw = {}, index = 0) {
  const firstPricing = Array.isArray(raw.pricing) ? raw.pricing[0] : null;
  const firstWeight = firstPricing?.weights?.[0] || {};
  const weightLabel = String(firstWeight.weight || "100g");
  const unit = weightLabel.replace(/[0-9.\s]/g, "") || "g";
  const weight = Number.parseFloat(weightLabel) || 100;
  const price = Number(firstWeight.price || 0);
  const imgUrl = raw.image || (raw.images && raw.images.length > 0 ? raw.images[0] : null);
  const featuredImage = absoluteImage(imgUrl) || "https://placehold.co/600x400?text=Spice";
  const safeName = raw.name || "Product";

  return {
    id: raw._id || `p-${index}`,
    slug: slugify(safeName) || `product-${index + 1}`,
    name: safeName,
    description: raw.description || "",
    category: raw.category || "spices",
    featured_image: featuredImage,
    images: raw.images && raw.images.length > 0 ? raw.images.map(absoluteImage) : [featuredImage],
    price,
    original_price: firstWeight.original_price > price ? firstWeight.original_price : null,
    rating: raw.rating ?? 4.5,
    reviews_count: raw.reviews_count ?? 0,
    vendor_id: "default-vendor",
    weight,
    unit,
    min_quantity: 1,
    max_quantity: Math.max(1, Number(raw.stock || 1)),
    stock: Number(raw.stock || 0),
    is_featured: false,
    sales: Number(raw.sales || 0),
    createdAt: raw.createdAt,
    pricing: raw.pricing || [],
    dietaryPreference: raw.dietaryPreference || "",
  };
}

export function markFeatured(products = []) {
  const sorted = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0));
  const featuredIds = new Set(sorted.slice(0, 8).map((p) => p.id));
  return products.map((p) => ({ ...p, is_featured: featuredIds.has(p.id) }));
}
