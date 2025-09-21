<template>
    <q-page class="flex flex-center">
        <q-card class="q-pa-md" style="min-width: 600px; max-width: 600px;">

            <!-- Header -->
            <q-card-section class="q-pb-none">
                <div class="text-h6">{{  t("Account Settings", "Account Settings")}}</div>
                <div class="text-subtitle2 text-grey-7 q-mt-xs">
                    {{  t("Update your account information", "Update your account information")}}
                </div>
            </q-card-section>

            <q-separator class="q-my-sm" />

            <q-card-section>
                <q-form @submit.prevent="submitForm" ref="formRef">
                    <div class="q-gutter-md">

                        <!--  Basic Account Info Section -->
                        <div class="q-pa-sm bg-blue-3 text-white" style="border-radius: 6px;">
                            {{  t("Basic Account Info", "Basic Account Info")}}
                        </div>
                        <div class="q-gutter-sm q-mt-sm">
                            <q-input filled dense v-model="form.username" label="Username" />
                            <q-input filled dense v-model="form.email" :label="t('Email', 'Email')"  />

                            <!-- Password -->
                            <q-input filled dense v-model="form.password" type="password" :label="t('Password', 'Password')"  />

                            <!-- Language Preference -->
                            <q-select filled dense v-model="form.language_code" :label="t('Language Preference', 'Language Preference')" 
                                :options="languageOptions" option-label="name" option-value="code" emit-value
                                map-options />

                            <!-- GitHub ID -->
                            <q-input filled dense v-model="form.github_id" :label="t('GitHub ID (optional)', 'GitHub ID (optional)')" />

                            <!-- Role / Permissions (display only) -->
                            <q-input filled dense v-model="form.role" :label="t('Role', 'Role')" readonly />

                            <!-- Account Status (display only) -->
                            <q-input filled dense v-model="form.status" :label="t('Account Status', 'Account Status')" readonly />
                        </div>

                    </div>
                </q-form>
            </q-card-section>

            <q-separator />

            <!-- Actions -->
            <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" @click="close" />
                <q-btn flat label="Save Changes" color="primary" @click="submitForm" />
            </q-card-actions>

        </q-card>
    </q-page>
</template>

<script setup>
import { ref, reactive, watch, defineProps, defineEmits, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
    modelValue: Boolean,
    userData: Object
})

const emits = defineEmits(['update:modelValue', 'saved'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, val => { visible.value = val })
watch(visible, val => { emits('update:modelValue', val) })

const form = reactive({
    user_id: null,
    username: '',
    email: '',
    password: '',
    language_code: 'en',
    github_id: '',
    role: 'user',
    status: 'active'
})

const languageOptions = ref([])

const fetchUser = async () => {
    try {
        const res = await axios.get('http://localhost:3000/users/settings/account-info', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        Object.assign(form, res.data)
    } catch (err) {
        console.error('Failed to fetch user info:', err)
    }
}

const close = () => { visible.value = false }

const submitForm = async () => {
    try {
        // Build payload, skip password if blank
        const payload = { ...form }
        if (!payload.password) delete payload.password

        // Call API to update account
        await axios.put('http://localhost:3000/users/settings/save', payload, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        // Notify user
        console.log('Account updated successfully')
        window.location.reload();
    } catch (err) {
        console.error('Failed to save account info:', err.response?.data || err.message)
    }
}

const translations = ref({});

const fetchSystemTranslation = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/system/account_settings`, {
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

onMounted(async () => {
    // Load available languages
    try {
        const res = await axios.get('http://localhost:3000/users/languages', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        languageOptions.value = res.data
    } catch (err) {
        console.error('Failed to fetch languages:', err)
    }

    // Populate form if editing
    if (props.userData) {
        Object.assign(form, props.userData)
    }
})

onMounted(() => {
    fetchSystemTranslation();
    fetchUser();
})
</script>
