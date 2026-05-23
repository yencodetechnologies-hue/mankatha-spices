import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

export const reviewsApi = {
  getStats: async () => {
    const base = getAdminApiBase();
    const response = await axios.get(`${base}/reviews/stats`, withAuthHeaders());
    return response.data;
  },
  getReviews: async (params = {}) => {
    const base = getAdminApiBase();
    const response = await axios.get(`${base}/reviews`, withAuthHeaders({ params }));
    return response.data;
  },
  approve: async (id) => {
    const base = getAdminApiBase();
    const path = `${base}/reviews/${encodeURIComponent(id)}/approve`;
    try {
      const response = await axios.patch(path, undefined, withAuthHeaders());
      return response.data;
    } catch (e) {
      if (e.response?.status === 405) {
        const response = await axios.post(path, undefined, withAuthHeaders());
        return response.data;
      }
      throw e;
    }
  },
  remove: async (id) => {
    const base = getAdminApiBase();
    const response = await axios.delete(`${base}/reviews/${encodeURIComponent(id)}`, withAuthHeaders());
    return response.data;
  },
  createReview: async (payload) => {
    const base = getAdminApiBase();
    const response = await axios.post(`${base}/reviews`, payload, withAuthHeaders());
    return response.data;
  },
};
