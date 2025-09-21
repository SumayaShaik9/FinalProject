<template>
  <q-page padding class="bg-grey-1">
    <div class="q-gutter-md">

      <!-- 🔑 USER OVERVIEW -->
      <div class="row q-col-gutter-md">
        <q-card class="col-3 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Total Users</div>
            <div class="text-h5">{{ stats.totalUsers }}</div>
            <q-badge color="green" v-if="stats.activeUsers > 0">
              {{ stats.activeUsers }} active
            </q-badge>
          </q-card-section>
        </q-card>

        <q-card class="col-3 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Admins</div>
            <div class="text-h5">{{ stats.admins }}</div>
          </q-card-section>
        </q-card>

        <q-card class="col-3 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Recent Signups</div>
            <div class="text-h5">{{ stats.recentSignups }}</div>
          </q-card-section>
        </q-card>

        <q-card class="col-3 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Last Login</div>
            <div class="text-caption">{{ stats.lastLogin }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 🪪 IDENTITIES + CONTEXTS -->
      <div class="row q-col-gutter-md">
        <q-card class="col-6 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Identities by Visibility</div>
            <q-bar-chart
              :data="identityVisibilityData"
              :options="{ responsive: true }"
            />
          </q-card-section>
        </q-card>

        <q-card class="col-6 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Contexts Usage</div>
            <q-bar-chart
              :data="contextsData"
              :options="{ responsive: true }"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- 🌐 SOCIAL + TAGS -->
      <div class="row q-col-gutter-md">
        <q-card class="col-6 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Top Social Platforms</div>
            <q-pie-chart
              :data="socialLinksData"
              :options="{ responsive: true }"
            />
          </q-card-section>
        </q-card>

        <q-card class="col-6 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Popular Tags</div>
            <div class="row q-col-gutter-sm">
              <q-chip
                v-for="tag in topTags"
                :key="tag.name"
                color="primary"
                text-color="white"
                class="q-mb-sm"
              >
                {{ tag.name }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 📜 AUDIT LOGS + SESSIONS -->
      <div class="row q-col-gutter-md">
        <q-card class="col-6 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Recent Audit Logs</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-table
              :rows="auditLogs"
              :columns="auditColumns"
              dense
              flat
              bordered
              row-key="id"
              :pagination="{ rowsPerPage: 5 }"
            />
          </q-card-section>
        </q-card>

        <q-card class="col-6 bg-white shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-subtitle2">Active Sessions</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-table
              :rows="sessions"
              :columns="sessionColumns"
              dense
              flat
              bordered
              row-key="id"
              :pagination="{ rowsPerPage: 5 }"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue"

// Fake data bindings (replace with API)
const stats = ref({
  totalUsers: 120,
  activeUsers: 95,
  admins: 5,
  recentSignups: 12,
  lastLogin: "15 Sep 2025, 10:45 PM"
})

const identityVisibilityData = ref({
  labels: ["Public", "Private", "Admin-only"],
  datasets: [{ data: [60, 30, 10], backgroundColor: ["#42A5F5", "#66BB6A", "#EF5350"] }]
})

const contextsData = ref({
  labels: ["Work", "Gaming", "Friends", "Legal"],
  datasets: [{ data: [25, 18, 40, 12], backgroundColor: ["#5C6BC0", "#29B6F6", "#FFCA28", "#AB47BC"] }]
})

const socialLinksData = ref({
  labels: ["GitHub", "LinkedIn", "Twitter", "Other"],
  datasets: [{ data: [40, 25, 20, 15], backgroundColor: ["#000000", "#0077b5", "#1da1f2", "#9e9e9e"] }]
})

const topTags = ref([{ name: "Developer" }, { name: "Designer" }, { name: "Admin" }])

const auditColumns = [
  { name: "action", label: "Action", field: "action", align: "left" },
  { name: "user", label: "User", field: "user", align: "left" },
  { name: "timestamp", label: "Timestamp", field: "timestamp", align: "left" }
]

const auditLogs = ref([
  { id: 1, action: "Updated Identity", user: "alice", timestamp: "15 Sep 2025" },
  { id: 2, action: "Added Context", user: "bob", timestamp: "15 Sep 2025" }
])

const sessionColumns = [
  { name: "user", label: "User", field: "user", align: "left" },
  { name: "ip", label: "IP Address", field: "ip", align: "left" },
  { name: "expires", label: "Expires", field: "expires", align: "left" }
]

const sessions = ref([
  { id: 1, user: "alice", ip: "192.168.1.10", expires: "16 Sep 2025" },
  { id: 2, user: "bob", ip: "192.168.1.11", expires: "17 Sep 2025" }
])
</script>
