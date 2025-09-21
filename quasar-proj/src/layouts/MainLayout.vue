<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated style="background-color: black;">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <div class="row items-center q-gutter-md" style="width: 100%;">
          <q-toolbar-title class="col-auto">NameSphere App</q-toolbar-title>
          <q-space />

          <!-- <div class="col-auto">Quasar v{{ $q.version }}</div> -->
          <q-btn :icon="$q.dark.isActive ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'" color="white" flat
            round @click="toggleDarkMode" />

        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="drawer-column">
      <!-- Logo / Brand -->
      <div class="drawer-header flex flex-center column q-pa-md">
        <q-avatar size="56px" class="bg-primary text-white">
          <q-icon name="apps" size="28px" />
        </q-avatar>
        <div class="text-h6  q-mt-sm">NameSphere App</div>
      </div>

      <!-- Links -->
      <q-list padding class="flex-1 scroll-links">
        <q-item-label header class="text-bold q-ml-sm q-mb-sm">{{  t("Essential Links", "Essential Links")}} </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link"
          :class="{ 'active-link': currentRoute === link.route }" @click="handleLinkClick(link)" />
      </q-list>

      <!-- Logout button pinned to bottom -->
      <div class="logout-btn q-pa-md">
        <q-btn unelevated rounded icon="logout" :label="t('Logout', 'Logout')" @click="logout" class="full-width text-red" />
      </div>
    </q-drawer>

    <q-dialog v-model="dialog" persistent>
      <!-- Dialog content here -->
    </q-dialog>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed,onMounted} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

import { useQuasar } from 'quasar'

const $q = useQuasar()

function toggleDarkMode() {
  $q.dark.toggle()
}
const dialog = ref(false)
const leftDrawerOpen = ref(false)

const currentRoute = computed(() => route.path.split('/').pop())
const translations = ref({});

const fetchSystemTranslation = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/system/leftdrawer`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    console.log("response.data", response.data);
    translations.value = response.data.reduce((acc, t) => {
      acc[t.entity_name] = t.translation;
      return acc;
    }, {});
  } catch (err) {
    console.error("Failed to fetch translations:", err.response?.data || err.message);
  }
};

const t = (key, fallback) => {
  return translations.value[key] || fallback || key;
};

const linksList = computed(() => [
  { title: t("DashBoard", "DashBoard"), caption: t("View DashBoard", "View DashBoard"), icon: "dashboard", route: "" },
  { title: t("Search", "Search"), caption: t("Find people", "Find people"), icon: "search", route: "search" },
  { title: t("Manage Identities", "Manage Identities"), caption: t("Your identity types", "Your identity types"), icon: "chat", route: "identity" },
  { title: t("Manage Contexts and tags", "Manage Contexts and tags"), caption: t("contexts and tags", "contexts and tags"), icon: "chat", route: "context" },
  { title: t("Account Settings", "Account Settings"), caption: t("Update your account", "Update your account"), icon: "record_voice_over", route: "settings" }
]);


function handleLinkClick(link) {
  router.push(`/home/${link.route}`)
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(() => {
  fetchSystemTranslation();
})

</script>

<style scoped>
.drawer-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #1e2a38, #121b26);
  /* modern dark gradient */
  color: #e0e0e0;
}

/* Logo section */
.drawer-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

/* Scrollable links */
.scroll-links {
  flex: 1 1 auto;
  overflow-y: auto;
  padding-top: 0.5rem;
}

/* EssentialLink modern style */
EssentialLink {
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  margin: 0.3rem 0;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #cfd8dc;
}

EssentialLink q-icon {
  color: #64b5f6;
  margin-right: 0.75rem;
}

EssentialLink:hover {
  background: rgba(100, 181, 246, 0.1);
  transform: translateX(5px);
  color: #fff;
}

.active-link {
  background: #1976d2;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Logout button pinned at bottom */
.logout-btn {
  margin-top: 350px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn q-btn {
  font-weight: bold;
}
</style>
