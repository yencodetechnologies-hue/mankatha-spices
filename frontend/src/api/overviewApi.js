import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

export const overviewApi = {
  getOverview: async () => {
    const base = getAdminApiBase();
    const response = await axios.get(`${base}/overview`, withAuthHeaders());
    return response.data;
  },
};
