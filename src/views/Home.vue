<template>
  <div class="home-page">
    <div class="hero">
      <div class="hero-content">
        <div class="clock">
          <span style="font-size: 50px">🕒</span>
        </div>
        <img src="../assets/images/calong.png" width="250" alt="Image" />
        <p class="location">
          35 Stoke Newington church street<br />
          London, United Kingdom N16 0NX
        </p>
        <div class="action-cards">
          <div class="action-card employee-card" @click="goToEmployee">
            <div class="card-icon">👤</div>
            <h3>Employee</h3>
            <p>Clock in/out with your PIN</p>
            <span class="card-arrow">→</span>
          </div>

          <div class="action-card admin-card" @click="goToAdmin">
            <div class="card-icon">⚙️</div>
            <h3>Admin</h3>
            <p>Manage employees & time entries</p>
            <span class="card-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
    <footer class="home-footer">
      <p>Made with <span class="heart">❤️</span> by Sagar</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const goToEmployee = () => {
  router.push("/employee");
};

const goToAdmin = () => {
  if (authStore.isAuthenticated) {
    router.push("/admin/dashboard");
  } else {
    router.push("/admin/login");
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff 100%;
}

.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.hero-content {
  text-align: center;
  max-width: 600px;
}

.location {
  font-size: 1rem;
  color: var(--text-light);
  margin: 16px 0 32px 0;
}

.tagline {
  font-size: 1.1rem;
  color: var(--text-light);
  margin-bottom: 8px;
}

.description {
  color: var(--text-light);
  margin-bottom: 48px;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.action-card {
  background: rgb(244, 244, 244);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.employee-card:hover {
  border-color: var(--primary);
}

.admin-card:hover {
  border-color: var(--secondary);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.action-card h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
  color: var(--text-dark);
}

.action-card p {
  font-size: 0.9rem;
  color: var(--text-light);
}

.card-arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
  font-size: 1.5rem;
  color: var(--border);
  transition: all 0.3s ease;
}

.action-card:hover .card-arrow {
  color: var(--primary);
  transform: translateX(4px);
}

.home-footer {
  text-align: center;
  padding: 20px;
  color: var(--text-light);
  font-size: 0.85rem;
}

@media (max-width: 500px) {
  .action-cards {
    grid-template-columns: 1fr;
  }
}
</style>
