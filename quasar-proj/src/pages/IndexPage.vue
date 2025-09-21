<template>
  <q-page :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'" class="flex flex-center q-pa-lg">
    <!-- Container -->
    <div class="full-width" style="max-width: 1400px;">
      <div class="row q-col-gutter-lg">

        <!-- Left Column -->
        <div class="col-12 col-md-8">
          <!-- Welcome Card -->
          <q-card class="q-pa-lg q-mb-md" style="border-radius: 15px;">
            <div class="row items-center">
              <q-avatar size="70px" class="q-mr-md">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="avatar" />
              </q-avatar>
              <div>
                <!-- <div class="text-h6">Hi, {{ userProfile?.username }}</div> -->
                <div class="text-h6">{{ t("Hi", `Hi,`) }} {{ userProfile?.username }}</div>
                <div class="text-subtitle2 text-grey-7">
                  {{ userProfile?.description }}
                </div>
              </div>
            </div>
          </q-card>

          <!-- Stats Row -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-4">
              <q-card class="q-pa-md text-center flex flex-col items-center justify-center"
                style="border-radius: 15px; min-height: 150px;">
                <div>
                  <div class="text-h5">{{ totalIdentities }}</div>
                  <div class="text-caption">{{ t("Your Identities", "Your Identities") }}</div>
                </div>
              </q-card>
            </div>
            <div class="col-4">
              <q-card class="q-pa-md text-center flex flex-col items-center justify-center"
                style="border-radius: 15px; min-height: 150px;">
                <div>
                  <div class="text-h5">{{ totalContexts }}</div>
                  <div class="text-caption">{{ t("Contexts Joined", "Contexts Joined") }}</div>
                </div>
              </q-card>
            </div>
            <div class="col-4">
              <q-card class="q-pa-md text-center flex flex-col items-center justify-center"
                style="border-radius: 15px; min-height: 150px;">
                <div>
                  <div class="text-h5">{{ totalLanguages }}</div>
                  <div class="text-caption">{{ t("Languages Used", "Languages Used") }}</div>
                </div>
              </q-card>
            </div>
          </div>

          <!-- Contexts -->
          <q-card class="q-pa-md q-mb-md" style="border-radius: 15px;">
            <div class="text-subtitle1 q-mb-sm">{{ t("Contexts", "Contexts") }}</div>

            <div class="row q-gutter-sm">
              <!-- Render each context -->
              <q-btn v-for="ctx in myContexts" :key="ctx.context_id" unelevated rounded
                class="flex items-center justify-center"
                style="min-width: 100px; min-height: 60px; background-color: #F5F5F5; color: black; border-radius: 10px;">
                <q-icon :name="ctx.icon || 'folder'" class="q-mr-sm" color="blue" />
                {{ ctx.name }}
              </q-btn>

              <!-- Add New -->
              <q-btn unelevated rounded flat class="flex items-center justify-center"
                style="min-width: 100px; min-height: 60px; background-color: #F5F5F5; color: black; border-radius: 10px;">
                <q-icon name="add" />
              </q-btn>
            </div>
          </q-card>

          <!-- Social Links & Tags -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-card class="q-pa-md" style="border-radius: 15px; min-height: 250px;">
                <div class="text-subtitle1 q-mb-sm">{{ t("Social Links", "Social Links") }}</div>

                <!-- Scrollable container with hover scrollbar -->
                <div class="column scroll-on-hover" style="height: 250px; flex-wrap: nowrap;">
                  <div v-for="link in socialLinks" :key="link.link_id"
                    class="row items-center justify-between q-pa-xs content-center q-pr-xl"
                    style="max-width: 400px; width: 100%; margin: 0 auto;">
                    <!-- Social button -->
                    <q-btn flat dense class="justify-start" style="flex: 1;"
                      :icon="platformIcons[link.platform.toLowerCase()] || 'mdi-link'" :label="link.platform"
                      :color="platformColors[link.platform.toLowerCase()] || 'grey-8'" @click="openLink(link.url)" />

                    <!-- Context name on the right -->
                    <div class="text-caption text-grey-7 q-ml-sm">{{ link.context_name || 'No context' }}</div>
                  </div>
                </div>
              </q-card>
            </div>
            <div class="col-6">
              <q-card class="q-pa-md" style="border-radius: 15px; min-height: 250px;">
                <div class="text-subtitle1 q-mb-sm">{{ t("Tags", "Tags") }}</div>

                <div class="row q-gutter-sm">
                  <q-chip v-for="tag in userTags" :key="tag.tag_id" outline color="primary" class="q-mr-sm">
                    {{ tag.name }}
                  </q-chip>
                </div>
              </q-card>
            </div>

          </div>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-4">
          <q-card class="q-pa-md q-mb-md" style="border-radius: 15px;">
            <div class="text-subtitle1 q-mb-sm">{{ t("Profile Overview", "Profile Overview") }}</div>
            <div><strong>{{ t("Primary Identity", "Primary Identity") }}:</strong> {{ profileOverview.primary_identity
              || '' }}</div>
            <div><strong>{{ t("Website", "Website") }}:</strong> <a :href="profileOverview.website">{{
              profileOverview.website || '' }}</a></div>
            <div><strong>{{ t("Location", "Location") }}:</strong> {{ profileOverview.location || '' }}</div>
            <div><strong>{{ t("Organization", "Organization") }}:</strong> {{ profileOverview.organization || '' }}
            </div>

          </q-card>

          <!-- Identities -->
          <q-card class="q-pa-md q-mb-md" style="border-radius: 15px;">
            <div class="text-subtitle1 q-mb-sm">{{ t("Identities", "Identities") }}</div>

            <q-list separator>
              <q-item v-for="identity in identities" :key="identity.identity_id">
                <!-- Avatar -->
                <q-item-section avatar>
                  <q-avatar size="40px" color="primary" text-color="white">
                    {{ getInitials(getFullName(identity.names)) }}
                  </q-avatar>
                </q-item-section>

                <!-- Identity details -->
                <q-item-section>
                  <!-- Constructed name -->
                  <q-item-label class="text-weight-medium">
                    {{ getFullName(identity.names) }}
                  </q-item-label>

                  <!-- Context + visibility + primary -->
                  <q-item-label caption>
                    <q-badge v-if="identity.is_primary" color="primary" class="q-mr-sm" outline>Primary</q-badge>
                    <q-badge color="grey-6" class="q-mr-sm" outline>
                      {{ identity.visibility }}
                    </q-badge>
                    <span v-if="identity.context_name"> in {{ identity.context_name }}</span>
                  </q-item-label>
                </q-item-section>

                <!-- More options -->
                <q-item-section side>
                  <q-btn flat dense round icon="more_vert" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>


          <!-- Recent Activity -->
          <q-card class="q-pa-md" style="border-radius: 15px;">
            <div class="text-subtitle1 q-mb-sm">{{ t("Recent Activity", "Recent Activity") }}</div>

            <q-list separator>
              <q-item v-for="log in auditLogs" :key="log.id">
                <!-- Action / Resource -->
                <q-item-section>
                  {{ log.action }}{{ log.resource ? ' (' + log.resource + ')' : '' }}
                  <span v-if="log.context_name" class="text-grey-6"> - {{ log.context_name }}</span>
                </q-item-section>

                <!-- Timestamp on the right -->
                <q-item-section side class="text-caption text-grey">
                  {{ new Date(log.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const userProfile = ref(null);
const identities = ref([]);
const contextOptions = ref([]);
const myContexts = ref([]);
const userTags = ref([]);
const socialLinks = ref([]);
const auditLogs = ref([]);
const profileOverview = ref({});
const translations = ref({});

const fetchSystemTranslation = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/system/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
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

const fetchUserProfile = async () => {
  try {
    const response = await axios.get('http://localhost:3000/users/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    userProfile.value = response.data;
  } catch (err) {
    console.error('Failed to fetch user profile:', err.response?.data || err.message);
  }
};

const fetchIdentities = async () => {
  try {
    const response = await axios.get('http://localhost:3000/identities', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    identities.value = response.data
    console.log('identities.value', identities.value);
  } catch (err) {
    console.error('Failed to fetch identities:', err.response?.data || err.message)
  }
}

// Fetch contexts for select dropdown
const fetchContexts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/contexts', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    contextOptions.value = response.data
  } catch (err) {
    console.error('Failed to fetch contexts:', err.response?.data || err.message)
  }
}

// Fetch contexts for select dropdown
const fetchmyContexts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/contexts/my-contexts', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    myContexts.value = response.data
  } catch (err) {
    console.error('Failed to fetch contexts:', err.response?.data || err.message)
  }
}

const fetchMyTags = async () => {
  try {
    const response = await axios.get("http://localhost:3000/tags/my-tags", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    userTags.value = response.data;
  } catch (err) {
    console.error("Failed to fetch tags:", err.response?.data || err.message);
  }
};

const fetchMyAuditLogs = async () => {
  try {
    const response = await axios.get("http://localhost:3000/users/audit-logs", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    auditLogs.value = response.data;
  } catch (err) {
    console.error("Failed to fetch audit logs:", err.response?.data || err.message);
  }
};

const fetchProfileOverview = async () => {
  try {
    const response = await axios.get("http://localhost:3000/users/profile-overview", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    profileOverview.value = response.data;
  } catch (err) {
    console.error("Failed to fetch profile overview:", err.response?.data || err.message);
  }
};

const getFullName = (names = []) => {
  // prioritize 'given' + 'family'
  const given = names.find(n => n.type === "given")?.value || "";
  const family = names.find(n => n.type === "family")?.value || "";
  return [given, family].filter(Boolean).join(" ") || "Unnamed";
};

const getInitials = (fullName = "") => {
  return fullName
    .split(" ")
    .map(word => word[0]?.toUpperCase())
    .slice(0, 2) // max 2 letters
    .join("");
};

// Icon mapping for platforms
const platformIcons = {
  github: "mdi-github",
  linkedin: "mdi-linkedin",
  twitter: "mdi-twitter",
  facebook: "mdi-facebook",
  instagram: "mdi-instagram",
  youtube: "mdi-youtube",
  website: "mdi-web"
};

// Color mapping for platforms
const platformColors = {
  github: "black",
  linkedin: "blue-8",
  twitter: "blue-6",
  facebook: "blue-7",
  instagram: "pink-6",
  youtube: "red-7",
  website: "teal-7"
};

// Fetch social links from API
const fetchMySocialLinks = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/sociallinks/my-social-links",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }
    );
    socialLinks.value = response.data;
  } catch (err) {
    console.error("Failed to fetch social links:", err.response?.data || err.message);
  }
};

// Open a link in a new tab
const openLink = (url) => {
  window.open(url, "_blank");
};

// Computed stats
const totalIdentities = computed(() => identities.value.length)
const totalContexts = computed(() => {
  const contextIds = new Set(identities.value.map(i => i.context_id))
  return contextIds.size
})
const totalLanguages = computed(() => {
  const langs = new Set(identities.value.map(i => i.language).filter(Boolean))
  return langs.size
})

onMounted(() => {
  fetchSystemTranslation();
  fetchUserProfile();
  fetchIdentities();
  fetchContexts();
  fetchmyContexts();
  fetchMyTags();
  fetchMySocialLinks();
  fetchMyAuditLogs();
  fetchProfileOverview();
})

</script>


<style scoped>
body {
  font-family: 'DM Sans', sans-serif;
}

.q-dark .drawer-column {
  background: #1b2533;
  /* dark mode */
  color: #e0e0e0;
}

.scroll-on-hover {
  overflow-y: hidden;
  /* hide scrollbar by default */
  transition: all 0.3s;
}

.scroll-on-hover:hover {
  overflow-y: auto;
  /* show scrollbar on hover */
}

/* thin scrollbar for webkit browsers */
.scroll-on-hover::-webkit-scrollbar {
  width: 6px;
}

.scroll-on-hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}
</style>