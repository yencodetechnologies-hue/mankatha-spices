import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";
import { productApi } from "./productApi";

function rowStatus(stock, minLevel) {
  if (stock <= 0) return "out_of_stock";
  if (stock <= minLevel) return "low_stock";
  return "healthy";
}

function defaultReorderQty(minLevel, stored) {
  const n = Number(stored);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  const m = Number(minLevel) || 0;
  return Math.max(m * 2, 50);
}

/** Same shape as GET /api/products/inventory when the dedicated route is missing (old server). */
function buildInventoryFromProducts(products) {
  const sorted = [...(products || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  let productsInStock = 0;
  let lowStockAlerts = 0;
  let outOfStock = 0;
  const items = sorted.map((p) => {
    const stock = Number(p.stock) || 0;
    const minLevel = Number(p.minStock) || 0;
    const status = rowStatus(stock, minLevel);
    if (status === "healthy") productsInStock += 1;
    else if (status === "low_stock") lowStockAlerts += 1;
    else outOfStock += 1;
    return {
      id: String(p._id),
      name: p.name,
      sku: p.sku,
      image: p.image || "",
      currentStock: stock,
      minLevel,
      reorderQty: defaultReorderQty(minLevel, p.reorderQty),
      supplier: (p.supplier && String(p.supplier).trim()) || "—",
      status,
    };
  });
  return {
    summary: {
      productsInStock,
      lowStockAlerts,
      outOfStock,
      needRestocking: lowStockAlerts + outOfStock,
    },
    items,
    _meta: { source: "products-fallback" },
  };
}

let inventoryCache = null;

export const inventoryApi = {
  getInventory: async () => {
    const base = getAdminApiBase();
    try {
      const response = await axios.get(
        `${base}/products/inventory`,
        withAuthHeaders({ timeout: 15000 })
      );
      inventoryCache = response.data;
      return response.data;
    } catch (e) {
      if (e.response?.status === 404) {
        try {
          const data = await productApi.getProducts({ limit: 500 });
          const built = buildInventoryFromProducts(data.products || []);
          inventoryCache = built;
          return built;
        } catch (e2) {
          const wrapped = new Error(
            "Inventory returned 404 and the product list could not be loaded. Confirm the backend is running on the same host/port as this page (e.g. http://localhost:5000 if you use http://localhost:3000), or set REACT_APP_API_BASE_URL in .env."
          );
          wrapped.cause = e2;
          throw wrapped;
        }
      }
      throw e;
    }
  },
  getCached: () => inventoryCache,

  reorder: async (productId, opts = {}) => {
    const base = getAdminApiBase();
    const response = await axios.post(
      `${base}/products/inventory/reorder/${productId}`,
      opts,
      withAuthHeaders()
    );
    inventoryCache = null;
    return response.data;
  },
  restockBulk: async () => {
    const base = getAdminApiBase();
    const response = await axios.post(`${base}/products/inventory/restock-bulk`, {}, withAuthHeaders());
    inventoryCache = null;
    return response.data;
  },
};
