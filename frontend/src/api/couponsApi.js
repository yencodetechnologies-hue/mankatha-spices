import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

export const couponsApi = {
  getStats: async () => {
    const base = getAdminApiBase();
    const response = await axios.get(`${base}/coupons/stats`, withAuthHeaders());
    return response.data;
  },
  getCoupons: async () => {
    const base = getAdminApiBase();
    const response = await axios.get(`${base}/coupons`, withAuthHeaders());
    return response.data;
  },
  createCoupon: async (payload) => {
    const base = getAdminApiBase();
    const response = await axios.post(`${base}/coupons`, payload, withAuthHeaders());
    return response.data;
  },
  updateCoupon: async (id, payload) => {
    const base = getAdminApiBase();
    const response = await axios.put(
      `${base}/coupons/${encodeURIComponent(id)}`,
      payload,
      withAuthHeaders()
    );
    return response.data;
  },
};
