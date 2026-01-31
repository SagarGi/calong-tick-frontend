import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

// Views
import Home from './views/Home.vue'
import AdminLogin from './views/AdminLogin.vue'
import AdminSignup from './views/AdminSignup.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import EmployeeDashboard from './views/EmployeeDashboard.vue'
import EmployeeManagement from './views/EmployeeManagement.vue'
import TimeEntries from './views/TimeEntries.vue'
import Reports from './views/Reports.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/signup',
    name: 'AdminSignup',
    component: AdminSignup
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/employees',
    name: 'EmployeeManagement',
    component: EmployeeManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/time-entries',
    name: 'TimeEntries',
    component: TimeEntries,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/employee',
    name: 'EmployeeDashboard',
    component: EmployeeDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'AdminLogin' })
  } else {
    next()
  }
})

export default router
