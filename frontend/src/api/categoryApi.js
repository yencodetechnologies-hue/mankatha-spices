import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

const root = () => getAdminApiBase();

let categoriesCache = null;

export const categoryApi = {
  list: async () => {
    const { data } = await axios.get(`${root()}/categories`, withAuthHeaders());
    categoriesCache = data;
    return data;
  },

  getCached: () => categoriesCache,

  create: async (name) => {
    const { data } = await axios.post(`${root()}/categories`, { name }, withAuthHeaders());
    categoriesCache = null;
    return data;
  },

  rename: async (id, name) => {
    const { data } = await axios.put(`${root()}/categories/${id}`, { name }, withAuthHeaders());
    categoriesCache = null;
    return data;
  },

  remove: async (id) => {
    const { data } = await axios.delete(`${root()}/categories/${id}`, withAuthHeaders());
    categoriesCache = null;
    return data;
  },
};
