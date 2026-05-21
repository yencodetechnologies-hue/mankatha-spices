import axios from "axios";
import { getAdminApiBase } from "../../api/adminApiBase";
import { AUTH_TOKEN_KEY } from "../../constants/authStorage";

const client = axios.create();

client.interceptors.request.use((config) => {
  config.baseURL = getAdminApiBase();
  const token = typeof localStorage !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  async login(email, password) {
    const { data } = await client.post("auth/login", { email, password });
    return data;
  },

  async googleLogin(credential) {
    const { data } = await client.post("auth/google", { credential });
    return data;
  },

  async register(payload) {
    const { data } = await client.post("auth/register", payload);
    return data;
  },

  async registerSendOtp(payload) {
    const { data } = await client.post("auth/register-send-otp", payload);
    return data;
  },

  async registerVerifyOtp(payload) {
    const { data } = await client.post("auth/register-verify-otp", payload);
    return data;
  },

  async forgotSendOtp(payload) {
    const { data } = await client.post("auth/forgot-send-otp", payload);
    return data;
  },

  async forgotVerifyOtp(payload) {
    const { data } = await client.post("auth/forgot-verify-otp", payload);
    return data;
  },

  async resetPassword(payload) {
    const { data } = await client.post("auth/reset-password", payload);
    return data;
  },

  async me() {
    const { data } = await client.get("auth/me");
    return data;
  },
};

