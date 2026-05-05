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
};
