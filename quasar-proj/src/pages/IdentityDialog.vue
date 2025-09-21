<template>
  <q-dialog v-model="visible" persistent>
    <q-card class="q-pa-md" style="min-width: 600px; max-width: 600px;">

      <!-- Header -->
      <q-card-section class="q-pb-none">
        <div class="text-h6">{{ isEdit ? 'Edit Identity' : 'Add New Identity' }}</div>
        <div class="text-subtitle2 text-grey-7">
          Fill in the details for the {{ isEdit ? 'identity' : 'new identity' }}
        </div>
      </q-card-section>

      <q-separator class="q-my-sm" />

      <q-card-section>
        <q-form @submit.prevent="submitForm" ref="formRef">
          <div class="q-gutter-md">

            <!-- ===== Basic Identity Section ===== -->
            <div class="q-pa-sm bg-blue-3 text-white" style="border-radius: 6px;">
              Basic Identity
            </div>
            <div class="q-gutter-sm q-mt-sm">
              <q-input filled dense v-model="form.display_name" label="Display Name *" />
              <q-input filled dense v-model="form.gender_identity" label="Gender Identity" />
              <q-input filled dense v-model="form.nickname" label="Nickname" />

              <!-- Profile Photo -->
              <q-input filled dense v-model="form.profile_photo" label="Profile Photo URL (optional)" />

              <!-- Context Selection -->
              <q-select filled dense v-model="form.context_id" label="Context" :options="props.contextOptions"
                option-label="name" option-value="context_id" emit-value map-options clearable />

              <!-- Visibility -->
              <q-option-group v-model="form.visibility" type="radio" inline :options="[
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
                { label: 'Admin Only', value: 'admin-only' }
              ]" />
            </div>

            <!-- ===== Names Section ===== -->
            <div class="q-pa-sm bg-blue-3 text-white" style="border-radius: 6px;">
              Names
            </div>
            <div class="q-gutter-sm q-mt-sm">
              <div v-for="(name, i) in form.names" :key="i" class="row q-col-gutter-sm q-mt-sm">
                <div class="col-4">
                  <q-select filled dense v-model="name.type"
                    :options="['given', 'family', 'patronymic', 'mononym', 'other']" label="Name Type" />
                </div>
                <div class="col-8">
                  <q-input filled dense v-model="name.value"
                    :label="name.type ? name.type.charAt(0).toUpperCase() + name.type.slice(1) + ' Name' : 'Name Value'" />
                </div>
              </div>

              <q-btn flat dense color="primary" label="+ Add another name part" class="q-mt-sm" @click="addNamePart" />
            </div>

            <!-- ===== Translations Section ===== -->
            <div class="q-pa-sm bg-blue-3 text-white" style="border-radius: 6px;">
              Translations
            </div>
            <div class="q-gutter-sm q-mt-sm">
              <div v-for="(tr, index) in form.translations" :key="index" class="q-gutter-sm">
                <q-select filled dense v-model="tr.language_code" label="Language *" :options="languageOptions"
                  option-label="name" option-value="code" emit-value map-options />
                <q-input filled dense v-model="tr.display_name_translation" label="Display Name Translation" />
                <q-input filled dense v-model="tr.nickname_translation" label="Nickname Translation" />
                <q-input filled dense v-model="tr.gender_identity_translation" label="Gender Identity Translation" />
              </div>
              <q-btn flat dense color="primary" label="+ Add Translation" class="q-mt-sm" @click="form.translations.push({
                language_code: '',
                display_name_translation: '',
                nickname_translation: '',
                gender_identity_translation: ''
              })" />
            </div>

          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="close" />
        <q-btn flat label="Save" color="primary" @click="submitForm" />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, defineEmits, defineProps, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  editData: Object,
  contextOptions: Array
})

const emits = defineEmits(['update:modelValue', 'saved'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, val => { visible.value = val })
watch(visible, val => { emits('update:modelValue', val) })

const form = reactive({
  identity_id: null,
  display_name: '',
  given_name: '',
  family_name: '',
  gender_identity: '',
  nickname: '',
  profile_photo: '',
  language_code: '',
  visibility: 'public',

  names: [],
  translations: [],
  context_id: null,
  is_primary: false
})

const languageOptions = ref([])

// Load languages
const fetchLanguages = async () => {
  try {
    const res = await axios.get('http://localhost:3000/users/languages', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    languageOptions.value = res.data
  } catch (err) {
    console.error('Failed to fetch languages:', err)
  }
}
onMounted(fetchLanguages)

const isEdit = ref(false)
watch(() => props.editData, (val) => {
  if (val) {
    // Populate form fields
    Object.assign(form, val)

    // Extract first translation for flat fields
    if (val.translations && val.translations.length > 0) {
      const t = val.translations[0]
      form.display_name = t.display_name || ''
      form.nickname = t.nickname || ''
      form.gender_identity = t.gender_identity || ''
      form.language_code = t.language_code || ''
    }

    // Extract structured names if present
    if (val.names) {
      form.names = val.names.map(n => ({ ...n }))
    } else {
      form.names = []
    }

    form.context_id = val.context_id || null
    form.is_primary = !!val.is_primary

    isEdit.value = true
  } else {
    resetForm()
    isEdit.value = false
  }
})

const resetForm = () => {
  Object.assign(form, {
    identity_id: null,
    display_name: '',
    given_name: '',
    family_name: '',
    gender_identity: '',
    nickname: '',
    profile_photo: '',
    language_code: '',
    visibility: 'public',
    names: [],
    translations: [],
    context_id: null,
    is_primary: false
  })
}

const addNamePart = () => {
  form.names.push({
    type: '',
    value: '',
    order_index: form.names.length + 1
  })
}

const close = () => { visible.value = false }

const submitForm = async () => {
  try {
    // Filter out empty names
    const filteredNames = form.names.filter(n => n.value)

    // Ensure translations array exists
    let translations = form.translations || []

    // Build English translation from Basic Identity fields
    const enTranslation = {
      language_code: 'en',
      display_name: form.display_name || '',
      nickname: form.nickname || '',
      gender_identity: form.gender_identity || '',
      legal_name: form.given_name || ''
    }

    // Replace existing en translation if exists
    const existingIndex = translations.findIndex(t => t.language_code === 'en')
    if (existingIndex !== -1) {
      translations[existingIndex] = { ...translations[existingIndex], ...enTranslation }
    } else {
      translations.push(enTranslation)
    }

    // Build payload for backend
    const payload = {
      profile_photo: form.profile_photo,
      visibility: form.visibility,
      context_id: form.context_id,
      is_primary: form.is_primary,
      names: filteredNames,
      translations
    }

    if (isEdit.value) {
      await axios.put(`http://localhost:3000/identities/${form.identity_id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    } else {
      await axios.post('http://localhost:3000/identities', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    }

    emits('saved')
    close()
  } catch (err) {
    console.error('Failed to save identity:', err.response?.data || err.message)
  }
}

</script>