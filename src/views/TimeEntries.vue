<template>
  <div class="page-container">
    <AdminNav />

    <div class="content-wrapper">
      <header class="page-header flex-between">
        <div>
          <h1>Time Entries</h1>
          <p class="text-muted">View and manage all time entries</p>
        </div>
        <button @click="openManualEntry" class="btn btn-primary">
          + Manual Entry
        </button>
      </header>

      <!-- Filters -->
      <div class="filters card">
        <div class="card-body">
          <div class="filter-row">
            <div class="filter-group">
              <label>Employee</label>
              <select
                v-model="filters.employee_id"
                class="form-input"
                @change="loadEntries"
              >
                <option value="">All Employees</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.name }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                v-model="filters.start_date"
                class="form-input"
                @change="loadEntries"
              />
            </div>
            <div class="filter-group">
              <label>End Date</label>
              <input
                type="date"
                v-model="filters.end_date"
                class="form-input"
                @change="loadEntries"
              />
            </div>
            <button @click="clearFilters" class="btn btn-outline">Clear</button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <div v-if="entries.length === 0" class="empty-state">
            <p>No time entries found</p>
          </div>

          <div v-else class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Break</th>
                  <th>Duration</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in entries" :key="entry.id">
                  <td>
                    <div>
                      <strong>{{ entry.employee_name }}</strong>
                      <div
                        class="text-muted text-mono"
                        style="font-size: 0.8rem"
                      >
                        {{ entry.employee_pin }}
                      </div>
                    </div>
                  </td>
                  <td>{{ formatDate(entry.entry_date) }}</td>
                  <td>{{ formatTime(entry.clock_in) }}</td>
                  <td>
                    {{ entry.clock_out ? formatTime(entry.clock_out) : "-" }}
                  </td>
                  <td>{{ entry.break_minutes || 0 }}m</td>
                  <td>
                    <span v-if="entry.clock_out">{{
                      formatDuration(entry.total_minutes)
                    }}</span>
                    <span v-else class="badge badge-success">Active</span>
                  </td>
                  <td>{{ entry.notes || "-" }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        @click="openEditEntry(entry)"
                        class="btn btn-outline btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        @click="confirmDelete(entry)"
                        class="btn btn-outline btn-sm text-error"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual/Edit Entry Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingEntry ? "Edit Time Entry" : "Manual Time Entry" }}</h3>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="saveEntry">
          <div class="modal-body">
            <div v-if="error" class="alert alert-error">{{ error }}</div>

            <div v-if="!editingEntry" class="form-group">
              <label class="form-label">Employee *</label>
              <select
                v-model="entryForm.employee_id"
                class="form-input"
                required
              >
                <option value="">Select Employee</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Clock In *</label>
              <input
                type="datetime-local"
                v-model="entryForm.clock_in"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Clock Out *</label>
              <input
                type="datetime-local"
                v-model="entryForm.clock_out"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Break (minutes)</label>
              <input
                type="number"
                v-model="entryForm.break_minutes"
                class="form-input"
                min="0"
                max="480"
                placeholder="0"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea
                v-model="entryForm.notes"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? "Saving..." : "Save" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="showDeleteModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Delete Time Entry</h3>
          <button @click="showDeleteModal = false" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this time entry?</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button
            @click="deleteEntry"
            class="btn btn-primary"
            style="background: var(--error)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AdminNav from "../components/AdminNav.vue";
import api from "../api";

const loading = ref(true);
const employees = ref([]);
const entries = ref([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingEntry = ref(null);
const deletingEntry = ref(null);
const saving = ref(false);
const error = ref("");

const filters = ref({
  employee_id: "",
  start_date: "",
  end_date: "",
});

const entryForm = ref({
  employee_id: "",
  clock_in: "",
  clock_out: "",
  break_minutes: 0,
  notes: "",
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("en-US", {
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

const toLocalDatetime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const loadEntries = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.value.employee_id)
      params.employee_id = filters.value.employee_id;
    if (filters.value.start_date) params.start_date = filters.value.start_date;
    if (filters.value.end_date) params.end_date = filters.value.end_date;

    const res = await api.getAllTimeEntries(params);
    entries.value = res.data.data;
  } catch (err) {
    console.error("Error loading entries:", err);
  } finally {
    loading.value = false;
  }
};

const loadEmployees = async () => {
  try {
    const res = await api.getEmployees();
    employees.value = res.data.data;
  } catch (err) {
    console.error("Error loading employees:", err);
  }
};

const clearFilters = () => {
  filters.value = { employee_id: "", start_date: "", end_date: "" };
  loadEntries();
};

const openManualEntry = () => {
  editingEntry.value = null;
  entryForm.value = { employee_id: "", clock_in: "", clock_out: "", notes: "" };
  error.value = "";
  showModal.value = true;
};

const openEditEntry = (entry) => {
  editingEntry.value = entry;
  entryForm.value = {
    employee_id: entry.employee_id,
    clock_in: toLocalDatetime(entry.clock_in),
    clock_out: toLocalDatetime(entry.clock_out),
    notes: entry.notes || "",
  };
  error.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingEntry.value = null;
};

const saveEntry = async () => {
  saving.value = true;
  error.value = "";

  try {
    if (editingEntry.value) {
      await api.updateTimeEntry(editingEntry.value.id, {
        clock_in: entryForm.value.clock_in,
        clock_out: entryForm.value.clock_out,
        notes: entryForm.value.notes,
      });
    } else {
      await api.createManualEntry(entryForm.value);
    }
    closeModal();
    await loadEntries();
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to save entry";
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (entry) => {
  deletingEntry.value = entry;
  showDeleteModal.value = true;
};

const deleteEntry = async () => {
  try {
    await api.deleteTimeEntry(deletingEntry.value.id);
    showDeleteModal.value = false;
    deletingEntry.value = null;
    await loadEntries();
  } catch (err) {
    console.error("Delete error:", err);
  }
};

onMounted(async () => {
  await loadEmployees();
  await loadEntries();
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
  align-items: flex-end;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}
</style>
