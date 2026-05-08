import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

const client = axios.create();
client.interceptors.request.use((config) => {
  config.baseURL = getAdminApiBase();
  const merged = withAuthHeaders({ headers: config.headers });
  config.headers = merged.headers;
  return config;
});

export const orderApi = {
  getOrders: async (params = {}) => {
    const response = await client.get("orders", { params });
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await client.get("orders/stats", { params });
    return response.data;
  },
};
