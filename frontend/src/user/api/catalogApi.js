import axios from "axios";
import { getAdminApiBase } from "../../admin/api/adminApiBase";
import { adaptBackendProduct, markFeatured } from "../../utils/productAdapter";

export const catalogApi = {
  async getProducts(limit = 500) {
    const base = getAdminApiBase();
    const { data } = await axios.get(`${base}/products`, { params: { limit } });
    const adapted = (data?.products || []).map((p, i) => adaptBackendProduct(p, i));
    return markFeatured(adapted);
  },
};

