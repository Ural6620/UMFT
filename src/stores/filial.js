import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/plugins/axios";

export const useFilialStore = defineStore("filial", () => {
  const filials = ref([]);
  const count = ref(null)
  const filialById = ref(null);

  const get = async (limit = 8, page = '', title = '') => {
    const response = await api.get(`/crud/filial?limit=${limit}&page=${page}&title=${title}`);
    filials.value = response.data.data;
    count.value = response.data.count;
  };

  const addFilial = async (data) => {
    await api.post("/crud/filial", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  };

  const updateFilial = async (data) => {
    await api.put("/crud/filial", data);
  };

  const deleteFilial = async (id) => {
    await api.delete(`/crud/filial/${id}`);
  };

  const getFilialById = async (id) => {
    const response = await api.get(`/crud/filial/${id}`);
    filialById.value = response.data;
  };

  const uploadFilial = async (formData) => {
    const response = await api.post("/upload/filial", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  };

  return {
    filials,
    filialById,
    count,
    get,
    addFilial,
    updateFilial,
    deleteFilial,
    getFilialById,
    uploadFilial,
  };
});
