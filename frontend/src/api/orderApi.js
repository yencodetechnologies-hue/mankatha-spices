import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

const client = axios.create();
client.interceptors.request.use((config) => {
  config.baseURL = getAdminApiBase();
  const merged = withAuthHeaders({ headers: config.headers });
  config.headers = merged.headers;
  return config;
});

let ordersCache = null;
let statsCache = null;

export const orderApi = {
  getOrders: async (params = {}) => {
    const response = await client.get("orders", { params });
    const isDefaultCall = Object.keys(params).length === 0;
    if (isDefaultCall) {
      ordersCache = response.data;
    }
    return response.data;
  },
  getCachedOrders: () => ordersCache,

  getStats: async (params = {}) => {
    const response = await client.get("orders/stats", { params });
    const isDefaultCall = Object.keys(params).length === 0;
    if (isDefaultCall) {
      statsCache = response.data;
    }
    return response.data;
  },
  getCachedStats: () => statsCache,
};
