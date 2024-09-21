import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    count: null,
    productById: null,
  }),
  actions: {
    async get(limit = 8, page = '', title = '') {
      const response = await api.get(`/product?limit=${limit}&page=${page}&title=${title}`);
      this.products = response.data?.data;
      this.count = response.data?.count;
    },

    async addProduct(data) {
      await api.post("/crud/product", data);
    },

    async updateProduct(data) {
      await api.put("/crud/product", data);
    },

    async deleteProduct(id) {
      await api.delete(`/crud/product/${id}`);
    },

    async getProductById(id) {
      const response = await api.get(`/crud/product/${id}`);
      this.productById = response.data;
    },

    async uploadProduct(formData) {
      const response = await api.post("/upload/product", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    }
  }
});