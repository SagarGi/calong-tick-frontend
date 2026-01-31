<template>
  <div class="page-container">
    <AdminNav />

    <div class="content-wrapper">
      <header class="page-header">
        <h1>Welcome to Calong Tick</h1>
        <p class="text-muted">Time tracking made simple :)</p>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <template v-else>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ stats.totalEmployees }}</h3>
              <p>Total Employees</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>{{ stats.activeEmployees }}</h3>
              <p>Active Employees</p>
            </div>
          </div>
        </div>
        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header flex-between">
              <h3>Recent Time Entries</h3>
              <router-link to="/admin/time-entries" class="view-all"
                >View All →</router-link
              >
            </div>
            <div class="card-body">
              <div v-if="recentEntries.length === 0" class="empty-state">
                <p>No time entries yet</p>
              </div>
              <div v-else class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="entry in recentEntries" :key="entry.id">
                      <td>{{ entry.employee_name }}</td>
                      <td>{{ formatDateTime(entry.clock_in) }}</td>
                      <td>
                        {{
                          entry.clock_out
                            ? formatDateTime(entry.clock_out)
                            : "-"
                        }}
                      </td>
                      <td>
                        <span v-if="entry.clock_out">{{
                          formatDuration(entry.total_minutes)
                        }}</span>
                        <span v-else class="badge badge-success">Active</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header flex-between">
              <h3>Employees</h3>
              <router-link to="/admin/employees" class="view-all"
                >Manage →</router-link
              >
            </div>
            <div class="card-body">
              <div v-if="employees.length === 0" class="empty-state">
                <p>No employees yet</p>
                <router-link to="/admin/employees" class="btn btn-primary mt-2"
                  >Add Employee</router-link
                >
              </div>
              <div v-else class="employee-list">
                <div
                  v-for="emp in employees.slice(0, 5)"
                  :key="emp.id"
                  class="employee-item"
                >
                  <div class="employee-info">
                    <span class="employee-name">{{ emp.name }}</span>
                    <span
                      class="employee-type badge"
                      :class="
                        emp.employee_type === 'full_time'
                          ? 'badge-info'
                          : 'badge-warning'
                      "
                    >
                      {{
                        emp.employee_type === "full_time"
                          ? "Full Time"
                          : "Part Time"
                      }}
                    </span>
                  </div>
                  <span class="employee-pin text-mono">PIN: {{ emp.pin }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import AdminNav from "../components/AdminNav.vue";
import api from "../api";

const loading = ref(true);
const employees = ref([]);
const recentEntries = ref([]);

const stats = computed(() => {
  const total = employees.value.length;
  const active = employees.value.filter((e) => e.is_active).length;
  const totalEntries = recentEntries.value.length;

  // Calculate this month's hours
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthEntries = recentEntries.value.filter((e) => {
    const entryDate = new Date(e.entry_date);
    return (
      entryDate.getMonth() + 1 === currentMonth &&
      entryDate.getFullYear() === currentYear
    );
  });
  const monthMinutes = monthEntries.reduce(
    (sum, e) => sum + (e.total_minutes || 0),
    0
  );
  const hours = Math.floor(monthMinutes / 60);
  const mins = monthMinutes % 60;

  return {
    totalEmployees: total,
    activeEmployees: active,
    totalEntries: totalEntries,
    thisMonthHours: `${hours}h ${mins}m`,
  };
});

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes) => {
  if (!minutes) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const loadData = async () => {
  try {
    const [empRes, entriesRes] = await Promise.all([
      api.getEmployees(),
      api.getAllTimeEntries(),
    ]);
    employees.value = empRes.data.data;
    recentEntries.value = entriesRes.data.data.slice(0, 10);
  } catch (err) {
    console.error("Error loading dashboard:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  margin-bottom: 4px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
  color: var(--text-light);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  font-size: 1.75rem;
  color: var(--text-dark);
}

.stat-content p {
  color: var(--text-light);
  font-size: 0.9rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.view-all {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-light);
}

.employee-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.employee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.employee-item:last-child {
  border-bottom: none;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-name {
  font-weight: 500;
}

.employee-pin {
  color: var(--text-light);
  font-size: 0.85rem;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
