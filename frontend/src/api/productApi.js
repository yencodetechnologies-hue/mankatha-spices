import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

const client = axios.create();
client.interceptors.request.use((config) => {
  config.baseURL = getAdminApiBase();
  const merged = withAuthHeaders({ headers: config.headers });
  config.headers = merged.headers;
  return config;
});

let productsCache = null;

export const productApi = {
  getProducts: async (params = {}) => {
    const response = await client.get("products", { params });
    const isDefaultCall = Object.keys(params).length === 0;
    if (isDefaultCall) {
      productsCache = response.data;
    }
    return response.data;
  },

  getCached: () => productsCache,

  createProduct: async (formData) => {
    const response = await client.post("products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    productsCache = null;
    return response.data;
  },
  updateProduct: async (id, formData) => {
    const response = await client.put(`products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    productsCache = null;
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await client.delete(`products/${id}`);
    productsCache = null;
    return response.data;
  },
};
