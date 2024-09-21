import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/plugins/axios';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([]);
  const count = ref(null);
  const categoryById = ref(null);

  const get = async (limit = 8, page = 1, title = '') => {
    const response = await api.get(`/categoryinventor?limit=${limit}&page=${page}&title=${title}`);
    categories.value = response.data.data;
    count.value = response.data.count;
  };

  const addCategory = async (data) => {
    await api.post("/crud/categoryinventor", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  };


  const updateCategory = async (data) => {
    await api.put("/crud/categoryinventor", data);
  };

  const deleteCategory = async (id) => {
    await api.delete(`/crud/categoryinventor/${id}`);
  }

  const getCategoryById = async (id) => {
    const response = await api.get(`/crud/categoryinventor/${id}`);
    categoryById.value = response.data;
  };

  const uploadCategory = async (formData) => {
    const response = await api.post("/upload/categoryinventor", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  };

  return {
    categories,
    categoryById,
    count,
    get,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    uploadCategory,
  };
});