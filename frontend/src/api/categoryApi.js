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

  create: async (name, imageFile) => {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    const { data } = await axios.post(`${root()}/categories`, formData, withAuthHeaders());
    categoriesCache = null;
    return data;
  },

  rename: async (id, name, imageFile) => {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    const { data } = await axios.put(`${root()}/categories/${id}`, formData, withAuthHeaders());
    categoriesCache = null;
    return data;
  },

  remove: async (id) => {
    const { data } = await axios.delete(`${root()}/categories/${id}`, withAuthHeaders());
    categoriesCache = null;
    return data;
  },
};
