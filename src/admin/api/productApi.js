import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
});

export const productApi = {
  getProducts: async (params = {}) => {
    const response = await client.get("/products", { params });
    return response.data;
  },
  createProduct: async (formData) => {
    const response = await client.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  updateProduct: async (id, formData) => {
    const response = await client.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await client.delete(`/products/${id}`);
    return response.data;
  },
};
