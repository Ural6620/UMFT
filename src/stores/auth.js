import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/auth/login', credentials);
        this.token = response.data.access_token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', this.token);
      } catch (error) {
        console.error('Login xato:', error);
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    async checkAuth() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.logout();
        return;
      }

      try {
        const response = await api.get('/auth/checkuser', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.user = response.data.user;
        this.token = token;
        this.isAuthenticated = true;
      } catch (error) {
        console.error('Autentifikatsiya tekshiruvi xato:', error);
        this.logout();
      }
    },
  },
});
