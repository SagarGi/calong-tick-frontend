<template>
  <div class="employee-page">
    <header class="employee-header">
      <img src="../assets/images/calong.png" width="250" alt="Image" />
      <div>
        <router-link to="/" class="back-link">← Back to Home</router-link>
      </div>
    </header>
    <!-- PIN Entry Screen -->
    <div v-if="!employee" class="pin-screen">
      <div class="pin-card">
        <div class="pin-card-header">
          <div class="pin-icon">🔐</div>
          <h2>Enter Your PIN</h2>
          <p class="text-muted">
            Enter your 6-digit PIN to access your dashboard
          </p>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <div class="pin-display">
          <div
            v-for="i in 6"
            :key="i"
            class="pin-box"
            :class="{ filled: pin.length >= i }"
          >
            {{ pin.length >= i ? "•" : "" }}
          </div>
        </div>

        <div class="pin-keypad">
          <button
            v-for="n in 9"
            :key="n"
            @click="addDigit(n)"
            class="keypad-btn"
          >
            {{ n }}
          </button>
          <button @click="clearPin" class="keypad-btn keypad-clear">
            <span>Clear</span>
          </button>
          <button @click="addDigit(0)" class="keypad-btn">0</button>
          <button
            @click="submitPin"
            class="keypad-btn keypad-enter"
            :disabled="pin.length !== 6 || loading"
          >
            <span v-if="loading">...</span>
            <span v-else>Enter</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Employee Dashboard -->
    <div v-else class="employee-dashboard">
      <div class="dashboard-container">
        <!-- Employee Header Card -->
        <div class="employee-card">
          <div class="employee-avatar">{{ employee.name.charAt(0) }}</div>
          <div class="employee-details">
            <h2>{{ employee.name }}</h2>
            <div class="employee-meta">
              <span class="badge badge-role">{{
                formatRole(employee.role)
              }}</span>
              <span
                class="badge"
                :class="
                  employee.employee_type === 'full_time'
                    ? 'badge-info'
                    : 'badge-warning'
                "
              >
                {{
                  employee.employee_type === "full_time"
                    ? "Full Time"
                    : "Part Time"
                }}
              </span>
            </div>
            <p class="employee-rate">
              £{{ parseFloat(employee.hourly_rate || 0).toFixed(2) }} / hour
            </p>
          </div>
          <button @click="logout" class="btn btn-outline btn-sm logout-btn">
            Switch User
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-nav">
          <button
            @click="activeTab = 'entry'"
            class="tab-btn"
            :class="{ active: activeTab === 'entry' }"
          >
            <span class="tab-icon">📝</span>
            Add Time Entry
          </button>
          <button
            @click="activeTab = 'history'"
            class="tab-btn"
            :class="{ active: activeTab === 'history' }"
          >
            <span class="tab-icon">📊</span>
            My History
          </button>
        </div>

        <!-- Time Entry Form Tab -->
        <div v-if="activeTab === 'entry'" class="tab-content">
          <div class="entry-card">
            <h3>Add New Time Entry</h3>
            <p class="text-muted">Enter your work hours for a specific date</p>

            <div
              v-if="entryMessage"
              class="alert"
              :class="
                entryMessageType === 'success' ? 'alert-success' : 'alert-error'
              "
            >
              {{ entryMessage }}
            </div>

            <form @submit.prevent="submitTimeEntry" class="entry-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Date *</label>
                  <input
                    type="date"
                    v-model="entryForm.date"
                    class="form-input"
                    :max="today"
                    required
                  />
                </div>
              </div>

              <div class="form-row two-col">
                <div class="form-group">
                  <label class="form-label">Start Time *</label>
                  <input
                    type="time"
                    v-model="entryForm.start_time"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">End Time *</label>
                  <input
                    type="time"
                    v-model="entryForm.end_time"
                    class="form-input"
                    required
                  />
                </div>
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
                <label class="form-label">Notes (optional)</label>
                <textarea
                  v-model="entryForm.notes"
                  class="form-input"
                  rows="3"
                  placeholder="Any additional notes about this shift..."
                ></textarea>
              </div>

              <div v-if="calculatedHours" class="calculated-hours">
                <span class="calc-label">Total Hours:</span>
                <span class="calc-value">{{ calculatedHours }}</span>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-large"
                :disabled="entryLoading"
              >
                <span v-if="entryLoading">Submitting...</span>
                <span v-else>Submit Time Entry</span>
              </button>
            </form>
          </div>
        </div>

        <!-- History Tab -->
        <div v-if="activeTab === 'history'" class="tab-content">
          <div class="history-card">
            <div class="history-header">
              <h3>My Time History</h3>
              <div class="history-filters">
                <button
                  @click="historyPeriod = 'week'"
                  class="filter-btn"
                  :class="{ active: historyPeriod === 'week' }"
                >
                  This Week
                </button>
                <button
                  @click="historyPeriod = 'month'"
                  class="filter-btn"
                  :class="{ active: historyPeriod === 'month' }"
                >
                  This Month
                </button>
                <button
                  @click="historyPeriod = 'all'"
                  class="filter-btn"
                  :class="{ active: historyPeriod === 'all' }"
                >
                  All Time
                </button>
              </div>
            </div>

            <div class="summary-bar">
              <div class="summary-item">
                <span class="summary-label">Total Hours</span>
                <span class="summary-value">{{
                  historySummary.total_time
                }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Entries</span>
                <span class="summary-value">{{
                  historySummary.total_entries
                }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Est. Earnings</span>
                <span class="summary-value earnings"
                  >£{{ estimatedEarnings }}</span
                >
              </div>
            </div>

            <div v-if="historyLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading history...</p>
            </div>

            <div v-else-if="historyEntries.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>No time entries found for this period</p>
              <button @click="activeTab = 'entry'" class="btn btn-primary mt-2">
                Add Your First Entry
              </button>
            </div>

            <div v-else class="history-list">
              <div
                v-for="entry in historyEntries"
                :key="entry.id"
                class="history-entry"
              >
                <div class="entry-date-col">
                  <span class="entry-day">{{
                    formatDay(entry.entry_date)
                  }}</span>
                  <span class="entry-date">{{
                    formatDate(entry.entry_date)
                  }}</span>
                </div>
                <div class="entry-times-col">
                  <span class="entry-time">{{
                    formatTime(entry.clock_in)
                  }}</span>
                  <span class="entry-arrow">→</span>
                  <span class="entry-time">{{
                    formatTime(entry.clock_out)
                  }}</span>
                  <span v-if="entry.break_minutes" class="entry-break"
                    >({{ entry.break_minutes }}m break)</span
                  >
                </div>
                <div class="entry-duration-col">
                  <span class="duration-value">{{
                    formatDuration(entry.total_minutes)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="modal-overlay"
      @click.self="showConfirmModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Confirm Time Entry</h3>
          <button @click="showConfirmModal = false" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-intro">
            Please review your time entry before submitting:
          </p>

          <div class="confirm-summary">
            <div class="confirm-row">
              <span class="confirm-label">Date : </span>
              <span class="confirm-value"><b>{{
                formatConfirmDate(entryForm.date)
              }}</b></span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Start Time : </span>
              <span class="confirm-value"><b>{{ entryForm.start_time }}</b></span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">End Time : </span>
              <span class="confirm-value">{{ entryForm.end_time }}</span>
            </div>
            <div class="confirm-row" v-if="entryForm.break_minutes > 0">
              <span class="confirm-label">Break : </span>
              <span class="confirm-value"
                ><b>{{ entryForm.break_minutes }} minutes</b></span
              >
            </div>
            <div class="confirm-row total">
              <span class="confirm-label">Total Hours : </span>
              <span class="confirm-value highlight"><b>{{ calculatedHours }}</b></span>
            </div>
            <div class="confirm-row" v-if="entryForm.notes">
              <span class="confirm-label">Notes</span>
              <span class="confirm-value">{{ entryForm.notes }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showConfirmModal = false" class="btn btn-outline">
            Go Back
          </button>
          <button
            @click="confirmAndSubmit"
            class="btn btn-primary"
            :disabled="entryLoading"
          >
            {{ entryLoading ? "Submitting..." : "Confirm & Submit" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Entry Modal -->
    <div
      v-if="showEditModal"
      class="modal-overlay"
      @click.self="closeEditModal"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Time Entry</h3>
          <button @click="closeEditModal" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="updateEntry">
          <div class="modal-body">
            <div v-if="editError" class="alert alert-error">
              {{ editError }}
            </div>

            <div class="form-group">
              <label class="form-label">Date</label>
              <input
                type="date"
                v-model="editForm.date"
                class="form-input"
                required
              />
            </div>

            <div class="form-row two-col">
              <div class="form-group">
                <label class="form-label">Start Time</label>
                <input
                  type="time"
                  v-model="editForm.start_time"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">End Time</label>
                <input
                  type="time"
                  v-model="editForm.end_time"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Break (minutes)</label>
              <input
                type="number"
                v-model="editForm.break_minutes"
                class="form-input"
                min="0"
                max="480"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea
                v-model="editForm.notes"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              @click="confirmDeleteEntry"
              class="btn btn-outline text-error"
            >
              Delete
            </button>
            <div class="modal-footer-right">
              <button
                type="button"
                @click="closeEditModal"
                class="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="editLoading"
              >
                {{ editLoading ? "Saving..." : "Save Changes" }}
              </button>
            </div>
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
      <div class="modal modal-small">
        <div class="modal-header">
          <h3>Delete Entry</h3>
          <button @click="showDeleteModal = false" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this time entry?</p>
          <p class="text-muted">This action cannot be undone.</p>
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
import { ref, computed, watch } from "vue";
import api from "../api";

// PIN & Auth State
const pin = ref("");
const employee = ref(null);
const loading = ref(false);
const error = ref("");

// Tab State
const activeTab = ref("entry");

// Time Entry Form State
const entryForm = ref({
  date: new Date().toISOString().split("T")[0],
  start_time: "",
  end_time: "",
  break_minutes: 0,
  notes: "",
});
const entryLoading = ref(false);
const entryMessage = ref("");
const entryMessageType = ref("success");
const showConfirmModal = ref(false);

// History State
const historyPeriod = ref("week");
const historyLoading = ref(false);
const historyEntries = ref([]);
const historySummary = ref({
  total_time: "0h 0m",
  total_entries: 0,
  total_hours: 0,
  total_minutes: 0,
});

// Edit Modal State
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingEntry = ref(null);
const editForm = ref({
  date: "",
  start_time: "",
  end_time: "",
  break_minutes: 0,
  notes: "",
});
const editLoading = ref(false);
const editError = ref("");

const today = computed(() => new Date().toISOString().split("T")[0]);

const calculatedHours = computed(() => {
  if (!entryForm.value.start_time || !entryForm.value.end_time) return null;

  const [startH, startM] = entryForm.value.start_time.split(":").map(Number);
  const [endH, endM] = entryForm.value.end_time.split(":").map(Number);

  let totalMins = endH * 60 + endM - (startH * 60 + startM);
  if (totalMins < 0) totalMins += 24 * 60; // Handle overnight shifts

  // Subtract break
  totalMins = Math.max(
    0,
    totalMins - (parseInt(entryForm.value.break_minutes) || 0)
  );

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return `${hours}h ${mins}m`;
});

const formatConfirmDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const estimatedEarnings = computed(() => {
  const totalMins =
    (historySummary.value.total_hours || 0) * 60 +
    (historySummary.value.total_minutes || 0);
  const hours = totalMins / 60;
  const rate = parseFloat(employee.value?.hourly_rate || 0);
  return (hours * rate).toFixed(2);
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

// PIN Functions
const addDigit = (digit) => {
  if (pin.value.length < 6) {
    pin.value += digit.toString();
  }
};

const clearPin = () => {
  pin.value = "";
  error.value = "";
};

const submitPin = async () => {
  if (pin.value.length !== 6) return;
  loading.value = true;
  error.value = "";
  try {
    const res = await api.verifyPin(pin.value);
    employee.value = res.data.data;
    await loadHistory();
  } catch (err) {
    error.value = err.response?.data?.message || "Invalid PIN";
    pin.value = "";
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  employee.value = null;
  pin.value = "";
  error.value = "";
  activeTab.value = "entry";
  historyEntries.value = [];
};

// Time Entry Functions
// Show confirmation modal instead of submitting directly
const submitTimeEntry = () => {
  // Validate form first
  if (
    !entryForm.value.date ||
    !entryForm.value.start_time ||
    !entryForm.value.end_time
  ) {
    entryMessage.value = "Please fill in all required fields";
    entryMessageType.value = "error";
    return;
  }

  // Show confirmation modal
  showConfirmModal.value = true;
};

// Actually submit after confirmation
const confirmAndSubmit = async () => {
  entryLoading.value = true;
  entryMessage.value = "";

  try {
    const clockIn = `${entryForm.value.date}T${entryForm.value.start_time}:00`;
    const clockOut = `${entryForm.value.date}T${entryForm.value.end_time}:00`;

    await api.createEmployeeEntry(pin.value, {
      clock_in: clockIn,
      clock_out: clockOut,
      break_minutes: parseInt(entryForm.value.break_minutes) || 0,
      notes: entryForm.value.notes,
    });

    // Close modal
    showConfirmModal.value = false;

    entryMessage.value = "Time entry submitted successfully!";
    entryMessageType.value = "success";

    // Reset form
    entryForm.value = {
      date: today.value,
      start_time: "",
      end_time: "",
      break_minutes: 0,
      notes: "",
    };

    // Refresh history
    await loadHistory();

    // Clear message after 3 seconds
    setTimeout(() => {
      entryMessage.value = "";
    }, 3000);
  } catch (err) {
    entryMessage.value =
      err.response?.data?.message || "Failed to submit time entry";
    entryMessageType.value = "error";
    showConfirmModal.value = false;
  } finally {
    entryLoading.value = false;
  }
};

// History Functions
const loadHistory = async () => {
  historyLoading.value = true;
  try {
    const params =
      historyPeriod.value !== "all" ? { period: historyPeriod.value } : {};
    const res = await api.getMyEntries(pin.value, params);
    historyEntries.value = res.data.data.entries;
    historySummary.value = res.data.data.summary;
  } catch (err) {
    console.error("History load error:", err);
  } finally {
    historyLoading.value = false;
  }
};

// This function is of not use of now
// can be removed if not used in the future anymore
const editEntry = (entry) => {
  editingEntry.value = entry;
  const clockInDate = new Date(entry.clock_in);
  const clockOutDate = new Date(entry.clock_out);

  editForm.value = {
    date: entry.entry_date,
    start_time: clockInDate.toTimeString().slice(0, 5),
    end_time: clockOutDate.toTimeString().slice(0, 5),
    break_minutes: entry.break_minutes || 0,
    notes: entry.notes || "",
  };
  editError.value = "";
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingEntry.value = null;
};

const updateEntry = async () => {
  editLoading.value = true;
  editError.value = "";

  try {
    const clockIn = `${editForm.value.date}T${editForm.value.start_time}:00`;
    const clockOut = `${editForm.value.date}T${editForm.value.end_time}:00`;

    await api.updateEmployeeEntry(pin.value, editingEntry.value.id, {
      clock_in: clockIn,
      clock_out: clockOut,
      break_minutes: parseInt(editForm.value.break_minutes) || 0,
      notes: editForm.value.notes,
    });

    closeEditModal();
    await loadHistory();
  } catch (err) {
    editError.value = err.response?.data?.message || "Failed to update entry";
  } finally {
    editLoading.value = false;
  }
};

const confirmDeleteEntry = () => {
  showDeleteModal.value = true;
};

const deleteEntry = async () => {
  try {
    await api.deleteEmployeeEntry(pin.value, editingEntry.value.id);
    showDeleteModal.value = false;
    closeEditModal();
    await loadHistory();
  } catch (err) {
    console.error("Delete error:", err);
  }
};

// Formatters
const formatDay = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "short" });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("en-GB", {
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

// Watchers
watch(historyPeriod, () => {
  if (employee.value) loadHistory();
});

watch(activeTab, (tab) => {
  if (tab === "history" && employee.value) loadHistory();
});
</script>

<style scoped>
.employee-page {
  min-height: 100vh;
  background: #ffffff;
}

.employee-header {
  text-align: center;
  padding: 24px 20px;
  background: white;
  border-bottom: 1px solid var(--border);
}

.back-link {
  display: inline-block;
  margin-bottom: 12px;
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--primary);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo-icon {
  font-size: 2rem;
}

.logo h1 {
  font-size: 1.5rem;
  color: var(--primary);
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--text-light);
  margin-top: 4px;
  font-size: 0.95rem;
}

/* PIN Screen */
.pin-screen {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.pin-card {
  background: rgb(255, 222, 222);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  max-width: 420px;
  width: 100%;
}

.pin-card-header {
  text-align: center;
  margin-bottom: 32px;
}

.pin-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.pin-card-header h2 {
  margin-bottom: 8px;
  color: var(--text-dark);
}

.pin-display {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 32px 0;
}

.pin-box {
  width: 48px;
  height: 56px;
  border: 2px solid var(--border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary);
  transition: all 0.2s;
  background: var(--bg-cream);
}

.pin-box.filled {
  border-color: var(--primary);
  background: var(--primary-light);
}

.pin-keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 320px;
  margin: 0 auto;
}

.keypad-btn {
  padding: 18px;
  font-size: 1.4rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: var(--bg-cream);
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.15s;
}

.keypad-btn:hover {
  background: #e8e4df;
  transform: scale(1.02);
}

.keypad-btn:active {
  transform: scale(0.98);
}

.keypad-clear {
  font-size: 0.9rem;
  color: var(--text-light);
}

.keypad-enter {
  background: var(--primary);
  color: white;
}

.keypad-enter:hover {
  background: var(--primary-dark);
}

.keypad-enter:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Employee Dashboard */
.employee-dashboard {
  padding: 24px 20px 40px;
}

.dashboard-container {
  max-width: 700px;
  margin: 0 auto;
}

.employee-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  position: relative;
}

.employee-avatar {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary) 0%, #e85a56 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.employee-details h2 {
  font-size: 1.25rem;
  margin-bottom: 6px;
}

.employee-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.badge-role {
  background: #f0e6ff;
  color: #7c3aed;
}

.employee-rate {
  color: var(--text-light);
  font-size: 0.9rem;
}

.logout-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 0.8rem;
  padding: 6px 12px;
}

/* Tabs */
.tab-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  background: white;
  color: var(--text-light);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-btn:hover {
  color: var(--text-dark);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(199, 62, 58, 0.3);
}

.tab-icon {
  font-size: 1.1rem;
}

/* Entry Form */
.entry-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.entry-card h3 {
  margin-bottom: 4px;
}

.entry-card > .text-muted {
  margin-bottom: 24px;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.calculated-hours {
  background: var(--bg-cream);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calc-label {
  color: var(--text-light);
  font-weight: 500;
}

.calc-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  font-family: "Space Mono", monospace;
}

/* History */
.history-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.history-filters {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: white;
  color: var(--text-light);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.summary-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.summary-item {
  background: var(--bg-cream);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-light);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-dark);
}

.summary-value.earnings {
  color: var(--success);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 12px;
  color: var(--text-light);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-light);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-entry {
  display: grid;
  grid-template-columns: 80px 1fr 80px 60px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}

.history-entry:last-child {
  border-bottom: none;
}

.entry-date-col {
  display: flex;
  flex-direction: column;
}

.entry-day {
  font-weight: 600;
  color: var(--text-dark);
}

.entry-date {
  font-size: 0.85rem;
  color: var(--text-light);
}

.entry-times-col {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Space Mono", monospace;
  font-size: 0.9rem;
}

.entry-arrow {
  color: var(--text-light);
}

.entry-duration-col {
  text-align: right;
}

.duration-value {
  font-weight: 600;
  color: var(--primary);
}

.btn-xs {
  padding: 4px 10px;
  font-size: 0.8rem;
}

.entry-break {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-left: 8px;
}

/* Modal Styles */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-footer-right {
  display: flex;
  gap: 12px;
}

.modal-small {
  max-width: 400px;
}

@media (max-width: 600px) {
  .employee-card {
    flex-direction: column;
    text-align: center;
  }

  .logout-btn {
    position: static;
    margin-top: 8px;
  }

  .form-row.two-col {
    grid-template-columns: 1fr;
  }

  .history-entry {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .entry-times-col {
    justify-content: flex-end;
  }

  .entry-duration-col {
    text-align: left;
  }

  .entry-actions-col {
    text-align: right;
  }

  .summary-bar {
    grid-template-columns: 1fr;
  }

  .history-header {
    flex-direction: column;
    align-items: stretch;
  }

  .history-filters {
    justify-content: center;
  }

  .confirm-intro {
    color: var(--text-light);
    margin-bottom: 20px;
  }

  .confirm-summary {
    background: var(--bg-cream);
    border-radius: 12px;
    padding: 20px;
  }

  .confirm-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }

  .confirm-row:last-child {
    border-bottom: none;
  }

  .confirm-row.total {
    margin-top: 8px;
    padding-top: 16px;
    border-top: 2px solid var(--border);
    border-bottom: none;
  }

  .confirm-label {
    color: var(--text-light);
    font-weight: 500;
  }

  .confirm-value {
    font-weight: 600;
    color: var(--text-dark);
  }

  .confirm-value.highlight {
    font-size: 1.25rem;
    color: var(--primary);
  }
}
</style>
