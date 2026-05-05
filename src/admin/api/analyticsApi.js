import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

export const analyticsApi = {
  /**
   * @param {number} rangeDays 7 | 30 | 90
   */
  getAnalytics: async (rangeDays = 30) => {
    const base = getAdminApiBase();
    const response = await axios.get(
      `${base}/analytics`,
      withAuthHeaders({ params: { range: rangeDays } })
    );
    return response.data;
  },
};
