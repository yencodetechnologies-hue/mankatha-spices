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

let customersCache = null;
let statsCache = null;

export const customerApi = {
  getCustomers: async (params = {}) => {
    const response = await axios.get(`${base()}/customers`, withAuthHeaders({ params }));
    const isDefaultCall = Object.keys(params).length === 0;
    if (isDefaultCall) {
      customersCache = response.data;
    }
    return response.data;
  },
  getCachedCustomers: () => customersCache,

  getStats: async () => {
    const b = base();
    try {
      const response = await axios.get(`${b}/customers/stats`, withAuthHeaders());
      statsCache = response.data;
      return response.data;
    } catch (e) {
      if (e.response?.status !== 404) throw e;
      const data = await fetchOverviewCustomerDashboard();
      statsCache = data;
      return data;
    }
  },
  getCachedStats: () => statsCache,
  
  deleteCustomer: async (id) => {
    const response = await axios.delete(`${base()}/customers/${id}`, withAuthHeaders());
    customersCache = null;
    statsCache = null;
    return response.data;
  }
};
