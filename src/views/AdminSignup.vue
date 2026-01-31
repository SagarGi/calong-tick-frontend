<template>
  <div class="auth-page">
    <!-- Show loading while checking -->
    <div v-if="checkingAdmin" class="loading-state">
      <div class="spinner"></div>
    </div>
    <div v-else class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="back-link">← Back to Home</router-link>
        <div class="logo">
          <img src="../assets/images/calong.png" width="250" alt="Image" />
        </div>
        <h2>Create Admin Account</h2>
      </div>

      <form @submit.prevent="handleSignup" class="auth-form">
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div class="form-group">
          <label class="form-label">Username</label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="Choose a username"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Choose a password"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-large w-full"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>
          Already have an account?
          <router-link to="/admin/login">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../api";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});
const loading = ref(false);
const error = ref("");
const checkingAdmin = ref(true);

// Check if admin already exists on page load
onMounted(async () => {
  try {
    const res = await api.checkAdminExists();
    if (res.data.exists) {
      router.push("/admin/login");
    }
  } catch (err) {
    console.error("Error checking admin:", err);
  } finally {
    checkingAdmin.value = false;
  }
});

const handleSignup = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = "Passwords do not match";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await authStore.signup({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    });
    router.push("/admin/dashboard");
  } catch (err) {
    error.value =
      err.response?.data?.message || "Signup failed. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-cream) 0%, #fff5f5 100%);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.back-link {
  display: inline-block;
  margin-bottom: 24px;
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  color: var(--primary);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 2rem;
}

.logo h1 {
  font-size: 1.5rem;
  color: var(--primary);
}

.auth-header h2 {
  color: var(--text-dark);
  font-weight: 500;
  font-size: 1.1rem;
}

.auth-form {
  margin-bottom: 24px;
}

.w-full {
  width: 100%;
}

.auth-footer {
  text-align: center;
  color: var(--text-light);
  font-size: 0.9rem;
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
