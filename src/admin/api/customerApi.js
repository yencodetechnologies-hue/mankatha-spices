import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

const base = () => getAdminApiBase();

async function fetchOverviewCustomerDashboard() {
  const r = await axios.get(`${base()}/overview`, withAuthHeaders());
  const cd = r.data?.customerDashboard;
  if (!cd) {
    const err = new Error("Overview response missing customerDashboard");
    err.response = { status: 404 };
    throw err;
  }
  return cd;
}

export const customerApi = {
  getCustomers: async (params = {}) => {
    const response = await axios.get(`${base()}/customers`, withAuthHeaders({ params }));
    return response.data;
  },
  /** Uses GET /customers/stats; if that route is missing (old API), falls back to overview.customerDashboard. */
  getStats: async () => {
    const b = base();
    try {
      const response = await axios.get(`${b}/customers/stats`, withAuthHeaders());
      return response.data;
    } catch (e) {
      if (e.response?.status !== 404) throw e;
      return fetchOverviewCustomerDashboard();
    }
  },
};
