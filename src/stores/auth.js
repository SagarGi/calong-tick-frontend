import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    admin: JSON.parse(localStorage.getItem('admin_data')) || null,
    token: localStorage.getItem('admin_token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(credentials) {
      const response = await api.adminSignin(credentials)
      const { token, ...adminData } = response.data.data
      
      this.token = token
      this.admin = adminData
      
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_data', JSON.stringify(adminData))
      
      return response.data
    },

    async signup(userData) {
      const response = await api.adminSignup(userData)
      const { token, ...adminData } = response.data.data
      
      this.token = token
      this.admin = adminData
      
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_data', JSON.stringify(adminData))
      
      return response.data
    },

    logout() {
      this.admin = null
      this.token = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_data')
    }
  }
})
