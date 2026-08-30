import axiosClient from "../../../shared/api/axiosClient";
import { CATEGORY_ENDPOINTS } from "./category.endpoints";

export const categoryApi = {
  getCategories: async () => {
    const res = await axiosClient.get(CATEGORY_ENDPOINTS.LIST);
    return res.data;
  },

  createCategory: async (payload) => {
    const res = await axiosClient.post(CATEGORY_ENDPOINTS.CREATE, payload);
    return res.data;
  },

  updateCategory: async (catId, payload) => {
    const res = await axiosClient.put(CATEGORY_ENDPOINTS.UPDATE(catId), payload);
    return res.data;
  },

  deleteCategory: async (catId) => {
    const res = await axiosClient.delete(CATEGORY_ENDPOINTS.DELETE(catId));
    return res.data;
  },
};

export default categoryApi;
