import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

const root = () => getAdminApiBase();

export const distributorApi = {
  suggestId: async () => {
    const { data } = await axios.get(`${root()}/distributors/suggest-id`, withAuthHeaders());
    return data;
  },

  list: async () => {
    const { data } = await axios.get(`${root()}/distributors`, withAuthHeaders());
    return data;
  },

  create: async (payload) => {
    const { data } = await axios.post(`${root()}/distributors`, payload, withAuthHeaders());
    return data;
  },

  update: async (id, payload) => {
    const { data } = await axios.put(`${root()}/distributors/${id}`, payload, withAuthHeaders());
    return data;
  },

  delete: async (id) => {
    const { data } = await axios.delete(`${root()}/distributors/${id}`, withAuthHeaders());
    return data;
  },
};
