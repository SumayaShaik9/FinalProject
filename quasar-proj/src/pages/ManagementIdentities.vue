<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Identities Used -->
        <q-card flat class="col text-center q-pa-md q-ma-md" style="background-color: #ffe0e0; border-radius: 12px;">
          <q-icon name="person" size="32px" color="red" />
          <div class="text-h6 q-mt-sm text-black">{{ totalIdentities }}</div>
          <div class="text-subtitle2 text-grey-7">{{ t('Identities Used', 'Identities Used') }}</div>
          <div class="text-caption text-blue-6">{{ t('Total identities', 'Total identities') }}: {{ totalIdentities }}</div>
        </q-card>

        <!-- Contexts Used -->
        <q-card flat class="col text-center q-pa-md q-ma-md" style="background-color: #fff2d6; border-radius: 12px;">
          <q-icon name="layers" size="32px" color="orange" />
          <div class="text-h6 q-mt-sm text-black">{{ totalContexts }}</div>
          <div class="text-subtitle2 text-grey-7">{{ t('Contexts Used', 'Contexts Used') }}</div>
          <div class="text-caption text-blue-6">{{ t('Total contexts', 'Total contexts') }}: {{ totalContexts }}</div>
        </q-card>

        <!-- Languages Used -->
        <q-card flat class="col text-center q-pa-md q-ma-md" style="background-color: #d9f7dc; border-radius: 12px;">
          <q-icon name="translate" size="32px" color="green" />
          <div class="text-h6 q-mt-sm text-black">{{ totalLanguages }}</div>
          <div class="text-subtitle2 text-grey-7">{{ t('Languages Used', 'Languages Used') }}</div>
          <div class="text-caption text-blue-6">{{ t('Total languages', 'Total languages') }}: {{ totalLanguages }}</div>
        </q-card>

        <!-- Public/Private Profiles -->
        <q-card flat class="col text-center q-pa-md q-ma-md" style="background-color: #e8e0ff; border-radius: 12px;">
          <q-icon name="visibility" size="32px" color="purple" />
          <div class="text-h6 q-mt-sm text-black">{{ totalPublicPrivate }}</div>
          <div class="text-subtitle2 text-grey-7">{{ t('Public/Private Profiles', 'Public/Private Profiles') }} </div>
          <div class="text-caption text-blue-6">
           {{ t('Public', 'Public') }}: {{ publicIdentities }}, {{ t('Private', 'Private') }} : {{ privateIdentities }}
          </div>
        </q-card>
      </div>
    </div>

    <!-- Identity Table -->
    <q-table
      :title="t('Identity Management', 'Identity Management')"
      :rows="processedIdentities"
      :columns="columns"
      row-key="identity_id"
      flat
      bordered
      dense
      separator="cell"
      :filter="filter"
      style="height: 50vh;"
    >
      <template v-slot:top-right>
        <q-input bordered rounded standout dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn class="q-ml-md" color="primary" icon="add" flat round @click="addIdentity" />
      </template>

      <!-- Name parts tooltip -->
      <template v-slot:body-cell-display_name="props">
        <q-td :props="props">
          <q-tooltip anchor="bottom middle">
            <div v-for="part in props.row.name_parts" :key="part.id">
              {{ part.type }}: {{ part.value }}
            </div>
          </q-tooltip>
          {{ props.row.display_name }}
        </q-td>
      </template>

      <!-- Primary -->
      <template v-slot:body-cell-primary="props">
        <q-td :props="props" class="text-center">
          <q-icon :name="props.row.is_primary ? 'check' : 'close'" :color="props.row.is_primary ? 'green' : 'grey'" />
        </q-td>
      </template>

      <!-- Visibility -->
      <template v-slot:body-cell-visibility="props">
        <q-td :props="props" class="text-center">
          {{ props.row.visibility }}
        </q-td>
      </template>

      <!-- Context -->
      <template v-slot:body-cell-context="props">
        <q-td :props="props">
          {{ props.row.context_name || 'N/A' }}
        </q-td>
      </template>

      <!-- Translations tooltip -->
      <template v-slot:body-cell-language="props">
        <q-td :props="props">
          <q-tooltip anchor="bottom middle">
            <div v-for="t in props.row.translations" :key="t.language_code">
              {{ t.language_code }}: {{ t.display_name || 'N/A' }}
            </div>
          </q-tooltip>
          {{ props.row.language || 'N/A' }}
        </q-td>
      </template>

      <!-- Actions -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn flat icon="edit" color="primary" round dense @click="editIdentity(props.row)" />
          <q-btn flat icon="delete" color="negative" round dense @click="deleteIdentity(props.row)" />
        </q-td>
      </template>
    </q-table>

    <IdentityDialog
      v-model="dialog"
      :editData="selectedIdentity"
      :contextOptions="contextOptions"
      @saved="fetchIdentities"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import IdentityDialog from './IdentityDialog.vue'
import axios from 'axios'

const identities = ref([])
const dialog = ref(false)
const selectedIdentity = ref(null)
const contextOptions = ref([])
const filter = ref('')
const userLanguage = ref('en') // from store or Accept-Language

// // Columns aligned with processedIdentities
// const columns = [
//   { name: 'display_name', label: 'Display Name', field: 'display_name', sortable: true },
//   // { name: 'legal_name', label: 'Legal Name', field: 'legal_name', sortable: true },
//   { name: 'pronouns', label: 'Pronouns', field: 'gender_identity', sortable: true },
//   { name: 'nickname', label: 'Nickname', field: 'nickname', sortable: true },
//   { name: 'context', label: 'Context', field: 'context_name', sortable: true },
//   { name: 'language', label: 'Language', field: 'language', sortable: true },
//   { name: 'primary', label: 'Primary', field: 'is_primary', sortable: true },
//   { name: 'visibility', label: 'Visibility', field: 'visibility', sortable: true },
//   { name: 'actions', label: 'Actions', field: 'actions' }
// ]

// Process identities to include translations, structured names, and primary/context info
const processedIdentities = computed(() =>
  identities.value.map(id => {
    const translation = id.translations?.find(t => t.language_code === userLanguage.value) || id.translations?.[0] || {}
    return {
      ...id,
      display_name: translation.display_name || '',
      legal_name: translation.legal_name || '',
      gender_identity: translation.gender_identity || '',
      nickname: translation.nickname || '',
      language: translation.language_code || '',
      name_parts: id.names || [],
      translations: id.translations || [],
      context_name: id.context_name || null,
      is_primary: id.is_primary || false
    }
  })
)

const translations = ref({});

const fetchSystemTranslation = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/system/identity`, {
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


const columns = computed(() => [
  { name: 'display_name', label: t('Display Name','Display Name'), field: 'display_name', sortable: true },
  { name: 'pronouns', label: t('Pronouns','Pronouns'), field: 'gender_identity', sortable: true },
  { name: 'nickname', label: t('Nickname','Nickname'), field: 'nickname', sortable: true },
  { name: 'context', label: t('Context','Context'), field: 'context_name', sortable: true },
  { name: 'language', label: t('Language','Language'), field: 'language', sortable: true },
  { name: 'primary', label: t('Primary','Primary'), field: 'is_primary', sortable: true },
  { name: 'visibility', label: t('Visibility','Visibility'), field: 'visibility', sortable: true },
  { name: 'actions', label: t('Actions','Actions'), field: 'actions' }
]);


// Fetch identities from backend
const fetchIdentities = async () => {
  try {
    const res = await axios.get('http://localhost:3000/identities', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    identities.value = res.data
  } catch (err) {
    console.error('Failed to fetch identities:', err.response?.data || err.message)
  }
}

// Fetch contexts for dropdown
const fetchContexts = async () => {
  try {
    const res = await axios.get('http://localhost:3000/contexts', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    contextOptions.value = res.data
  } catch (err) {
    console.error('Failed to fetch contexts:', err.response?.data || err.message)
  }
}

// Stats
const totalIdentities = computed(() => identities.value.length)
const totalContexts = computed(() => new Set(identities.value.map(i => i.context_name)).size)
const totalLanguages = computed(() => new Set(identities.value.map(i => i.language).filter(Boolean)).size)
const publicIdentities = computed(() => identities.value.filter(i => i.visibility === 'public').length)
const privateIdentities = computed(() => identities.value.filter(i => i.visibility === 'private').length)
const totalPublicPrivate = computed(() => publicIdentities.value + privateIdentities.value)

// Add/Edit/Delete
const addIdentity = () => { selectedIdentity.value = null; dialog.value = true }
const editIdentity = identity => { selectedIdentity.value = { ...identity }; dialog.value = true }
const deleteIdentity = async identity => {
  try {
    await axios.delete(`http://localhost:3000/identities/${identity.identity_id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    identities.value = identities.value.filter(i => i.identity_id !== identity.identity_id)
  } catch (err) {
    console.error('Delete failed:', err.response?.data || err.message)
  }
}

onMounted(() => {
  fetchSystemTranslation()
  fetchIdentities()
  fetchContexts()
})
</script>

<style scoped>
.q-table td,
.q-table th {
  text-align: left;
}
</style>
