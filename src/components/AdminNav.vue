<template>
  <nav class="admin-nav">
    <div class="nav-content">
      <router-link to="/admin/dashboard" class="nav-brand">
        <img src="../assets/images/calong.png" width="180" alt="Image" />
      </router-link>

      <div class="nav-links">
        <router-link
          to="/admin/dashboard"
          class="nav-link"
          :class="{ active: $route.name === 'AdminDashboard' }"
        >
          Dashboard
        </router-link>
        <router-link
          to="/admin/employees"
          class="nav-link"
          :class="{ active: $route.name === 'EmployeeManagement' }"
        >
          Employees
        </router-link>
        <router-link
          to="/admin/time-entries"
          class="nav-link"
          :class="{ active: $route.name === 'TimeEntries' }"
        >
          Time Entries
        </router-link>
        <router-link
          to="/admin/reports"
          class="nav-link"
          :class="{ active: $route.name === 'Reports' }"
        >
          Reports
        </router-link>
      </div>

      <div class="nav-user">
        <span class="user-name">{{ authStore.admin?.username }}</span>
        <button @click="handleLogout" class="btn btn-outline btn-sm">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};
</script>

<style scoped>
.admin-nav {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: var(--text-light);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--text-dark);
  background: var(--bg-cream);
}

.nav-link.active {
  color: var(--primary);
  background: var(--primary-light);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  color: var(--text-dark);
  font-weight: 500;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .nav-content {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 0;
    gap: 12px;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .user-name {
    display: none;
  }
}
</style>
