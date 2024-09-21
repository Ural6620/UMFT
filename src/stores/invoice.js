import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    invoices: [],
    count: null,
    invoiceById: null,
  }),

  actions: {
    async get(limit = 10, page = '', title = '') {
      const responce = await api.get(`/invoice?limit=${limit}&page=${page}&title=${title}`);
      this.invoices = responce.data?.data;
      this.count = responce.data?.count;
    },

    async addInvoice(data) {
      await api.post("/invoice", data);
    },

    async updateInvoice(data) {
      await api.put("/invoice/allcode", data);
    },

    async deleteInvoice(id) {
      await api.delete(`/invoice/${id}`)
    },

    async getInvoiceById(id) {
      const responce = await api.get(`/invoice/${id}`);
      this.invoiceById = responce.data
    },

    async uploadInvoice(data) {
      const responce = await api.post("/upload/invoice", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return responce;
    }
  }
})