import axios from "axios";
import { getAdminApiBase, withAuthHeaders } from "./adminApiBase";

const client = axios.create();
client.interceptors.request.use((config) => {
  config.baseURL = getAdminApiBase();
  const merged = withAuthHeaders({ headers: config.headers });
  config.headers = merged.headers;
  return config;
});

export const settingsApi = {
  getSettings: async () => {
    const { data } = await client.get("settings");
    return data;
  },
  /** Full or partial save (backend merges allowed keys). */
  saveSettings: async (payload) => {
    const { data } = await client.put("settings", payload);
    return data;
  },
  patchSettings: async (payload) => {
    const { data } = await client.patch("settings", payload);
    return data;
  },
};
