import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [],
    departments: [],
    count: null,
    employeeById: null
  }),
  actions: {
    async get(limit = 8, page = '', title = '', code = '') {
      const response = await api.get(`/employee?limit=${limit}&page=${page}&full_name=${title}&department=${code}`);
      this.employees = response.data?.data;
      this.count = response.data?.count;
    },

    async getDepartment() {
      const response = await api.get('/employee');
      this.departments = response.data.data.map((item) => item.department)
    },
    async patch() {
      await api.patch("/employee");
    },
    async editeEmployee(data) {
      await api.put("/employee", data);
    },
  }
})