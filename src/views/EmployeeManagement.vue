<template>
  <div class="page-container">
    <AdminNav />

    <div class="content-wrapper">
      <header class="page-header flex-between">
        <div>
          <h1>Employee Management</h1>
          <p class="text-muted">Manage your restaurant staff</p>
        </div>
        <button @click="openAddModal" class="btn btn-primary">
          + Add Employee
        </button>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <div v-if="employees.length === 0" class="empty-state">
            <p>No employees registered yet</p>
            <button @click="openAddModal" class="btn btn-primary mt-2">
              Add Your First Employee
            </button>
          </div>

          <div v-else class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>PIN</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Hourly Rate</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="emp in employees" :key="emp.id">
                  <td>
                    <strong>{{ emp.name }}</strong>
                  </td>
                  <td class="text-mono">{{ emp.pin }}</td>
                  <td>
                    <span class="badge badge-role">{{
                      formatRole(emp.role)
                    }}</span>
                  </td>
                  <td>
                    <span
                      class="badge"
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
                  </td>
                  <td>£{{ parseFloat(emp.hourly_rate || 0).toFixed(2) }}</td>
                  <td>{{ emp.phone || "-" }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="emp.is_active ? 'badge-success' : 'badge-error'"
                    >
                      {{ emp.is_active ? "Active" : "Inactive" }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        @click="openEditModal(emp)"
                        class="btn btn-outline btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        @click="confirmDelete(emp)"
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

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingEmployee ? "Edit Employee" : "Add New Employee" }}</h3>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="saveEmployee">
          <div class="modal-body">
            <div v-if="error" class="alert alert-error">{{ error }}</div>

            <div class="form-group">
              <label class="form-label">Name *</label>
              <input
                v-model="form.name"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div v-if="editingEmployee" class="form-group">
              <label class="form-label">PIN</label>
              <input
                v-model="form.pin"
                type="text"
                class="form-input text-mono"
                maxlength="6"
                pattern="[0-9]{6}"
              />
              <small class="text-muted">6-digit PIN code</small>
            </div>

            <div class="form-group">
              <label class="form-label">Role *</label>
              <select v-model="form.role" class="form-input" required>
                <optgroup label="Back of House">
                  <option value="head_chef">Head Chef</option>
                  <option value="sous_chef">Sous Chef</option>
                  <option value="junior_chef">Junior Chef</option>
                  <option value="kitchen_helper">Kitchen Helper</option>
                  <option value="dishwasher">Dishwasher</option>
                </optgroup>
                <optgroup label="Front of House">
                  <option value="restaurant_manager">Restaurant Manager</option>
                  <option value="floor_manager">Floor Manager</option>
                  <option value="head_waiter">Head Waiter</option>
                  <option value="waiter">Waiter</option>
                  <option value="bartender">Bartender</option>
                  <option value="host">Host</option>
                  <option value="busser">Busser</option>
                  <option value="cashier">Cashier</option>
                </optgroup>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Employee Type *</label>
              <select v-model="form.employee_type" class="form-input" required>
                <option value="part_time">Part Time</option>
                <option value="full_time">Full Time</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Hourly Rate (£)</label>
              <input
                v-model="form.hourly_rate"
                type="number"
                class="form-input"
                min="0"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone</label>
              <input v-model="form.phone" type="tel" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-input" />
            </div>

            <div v-if="editingEmployee" class="form-group">
              <label class="form-label">
                <input type="checkbox" v-model="form.is_active" /> Active
                Employee
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? "Saving..." : editingEmployee ? "Update" : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="showDeleteModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Delete Employee</h3>
          <button @click="showDeleteModal = false" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete
            <strong>{{ deletingEmployee?.name }}</strong
            >?
          </p>
          <p class="text-muted mt-1">
            This will also delete all their time entries.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button
            @click="deleteEmployee"
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
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingEmployee = ref(null);
const deletingEmployee = ref(null);
const saving = ref(false);
const error = ref("");

const form = ref({
  name: "",
  employee_type: "part_time",
  role: "waiter",
  hourly_rate: 0,
  phone: "",
  email: "",
  pin: "",
  is_active: true,
});

const roleLabels = {
  head_chef: "Head Chef",
  sous_chef: "Sous Chef",
  junior_chef: "Junior Chef",
  kitchen_helper: "Kitchen Helper",
  dishwasher: "Dishwasher",
  restaurant_manager: "Restaurant Manager",
  floor_manager: "Floor Manager",
  head_waiter: "Head Waiter",
  waiter: "Waiter",
  bartender: "Bartender",
  host: "Host",
  busser: "Busser",
  cashier: "Cashier",
};

const formatRole = (role) => roleLabels[role] || role || "Staff";

const resetForm = () => {
  form.value = {
    name: "",
    employee_type: "part_time",
    role: "waiter",
    hourly_rate: 0,
    phone: "",
    email: "",
    pin: "",
    is_active: true,
  };
  error.value = "";
};

const openAddModal = () => {
  editingEmployee.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = (emp) => {
  editingEmployee.value = emp;
  form.value = {
    name: emp.name,
    employee_type: emp.employee_type,
    role: emp.role || "waiter",
    hourly_rate: emp.hourly_rate || 0,
    phone: emp.phone || "",
    email: emp.email || "",
    pin: emp.pin,
    is_active: emp.is_active,
  };
  error.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingEmployee.value = null;
  resetForm();
};

const saveEmployee = async () => {
  saving.value = true;
  error.value = "";

  try {
    if (editingEmployee.value) {
      await api.updateEmployee(editingEmployee.value.id, form.value);
    } else {
      await api.createEmployee(form.value);
    }
    closeModal();
    await loadEmployees();
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to save employee";
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (emp) => {
  deletingEmployee.value = emp;
  showDeleteModal.value = true;
};

const deleteEmployee = async () => {
  try {
    await api.deleteEmployee(deletingEmployee.value.id);
    showDeleteModal.value = false;
    deletingEmployee.value = null;
    await loadEmployees();
  } catch (err) {
    console.error("Delete error:", err);
  }
};

const loadEmployees = async () => {
  try {
    const res = await api.getEmployees();
    employees.value = res.data.data;
  } catch (err) {
    console.error("Error loading employees:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(loadEmployees);
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin-bottom: 4px;
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

.badge-role {
  background: #f0e6ff;
  color: #7c3aed;
}
</style>
