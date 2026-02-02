<template>
  <div class="page-container">
    <AdminNav />

    <div class="content-wrapper">
      <header class="page-header">
        <h1>Reports</h1>
        <p class="text-muted">View employee hours and summary reports</p>
      </header>

      <!-- Filters -->
      <div class="filters card">
        <div class="card-body">
          <div class="filter-row">
            <div class="filter-group">
              <label>Period</label>
              <select
                v-model="filters.period"
                class="form-input"
                @change="loadReport"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Employee</label>
              <select
                v-model="filters.employee_id"
                class="form-input"
                @change="loadReport"
              >
                <option value="">All Employees</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <!-- Summary Stats -->
        <div class="summary-cards">
          <div class="summary-card">
            <h4>Total Hours</h4>
            <p class="summary-value">
              {{ totalSummary.hours }}h {{ totalSummary.minutes }}m
            </p>
          </div>
          <div class="summary-card">
            <h4>Total Entries</h4>
            <p class="summary-value">{{ totalSummary.entries }}</p>
          </div>
          <div class="summary-card">
            <h4>Estimated Pay</h4>
            <p class="summary-value">
              £{{ totalSummary.pay?.toLocaleString() || 0 }}
            </p>
          </div>
        </div>

        <!-- Employee Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3>Employee Hours Breakdown</h3>
          </div>
          <div class="card-body">
            <div v-if="report.length === 0" class="empty-state">
              <p>No data for selected period</p>
            </div>

            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Hourly Rate</th>
                    <th>Total Entries</th>
                    <th>Total Hours</th>
                    <th>Estimated Pay</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in report" :key="row.employee_id">
                    <td>
                      <strong>{{ row.employee_name }}</strong>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="
                          row.employee_type === 'full_time'
                            ? 'badge-info'
                            : 'badge-warning'
                        "
                      >
                        {{
                          row.employee_type === "full_time"
                            ? "Full Time"
                            : "Part Time"
                        }}
                      </span>
                    </td>
                    <td>£{{ parseFloat(row.hourly_rate || 0).toFixed(2) }}</td>
                    <td>{{ row.total_entries }}</td>
                    <td>{{ row.total_time }}</td>
                    <td class="text-success">
                      <strong
                        >£{{
                          parseFloat(row.estimated_pay || 0).toFixed(2)
                        }}</strong
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AdminNav from "../components/AdminNav.vue";
import api from "../api";

const loading = ref(true);
const employees = ref([]);
const report = ref([]);

const filters = ref({
  period: "month",
  employee_id: "",
});

const totalSummary = computed(() => {
  const totalMins = report.value.reduce(
    (sum, r) => sum + (r.total_minutes || 0),
    0
  );
  const totalEntries = report.value.reduce(
    (sum, r) => sum + (r.total_entries || 0),
    0
  );
  const totalPay = report.value.reduce(
    (sum, r) => sum + parseFloat(r.estimated_pay || 0),
    0
  );

  return {
    hours: Math.floor(totalMins / 60),
    minutes: totalMins % 60,
    entries: totalEntries,
    pay: totalPay,
  };
});

const loadEmployees = async () => {
  try {
    const res = await api.getEmployees();
    employees.value = res.data.data;
  } catch (err) {
    console.error("Error loading employees:", err);
  }
};

const loadReport = async () => {
  loading.value = true;
  try {
    const params = { period: filters.value.period };
    if (filters.value.employee_id)
      params.employee_id = filters.value.employee_id;

    const res = await api.getSummaryReport(params);
    report.value = res.data.data;
  } catch (err) {
    console.error("Error loading report:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadEmployees();
  await loadReport();
});
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin-bottom: 4px;
}

.filters {
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-light);
}

.filter-group .form-input {
  min-width: 180px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.summary-card h4 {
  color: var(--text-light);
  font-weight: 500;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
