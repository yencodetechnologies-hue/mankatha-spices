import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

const root = () => getAdminApiBase();

export const billerApi = {
  list: async () => {
    const { data } = await axios.get(`${root()}/billers`, withAuthHeaders());
    return data;
  },

  create: async (payload) => {
    const { data } = await axios.post(`${root()}/billers`, payload, withAuthHeaders());
    return data;
  },

  update: async (id, payload) => {
    const { data } = await axios.put(`${root()}/billers/${id}`, payload, withAuthHeaders());
    return data;
  },

  delete: async (id) => {
    const { data } = await axios.delete(`${root()}/billers/${id}`, withAuthHeaders());
    return data;
  },
};
