<template>
    <q-dialog v-model="userStore.showSearchDialog" persistent>
        <q-card class="q-pa-lg shadow-2 rounded-2xl" style="min-width: 400px; max-width: 600px;">
            <div class="text-h6 q-mb-md">Find People</div>

            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <div class="row q-col-gutter-md q-ma-md">
                    <div class="col-12 col-md-6">
                        <q-input v-model="filters.display_name" filled dense clearable label="Display Name" />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input v-model="filters.nickname" filled dense clearable label="Nickname" />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-select v-model="filters.gender_identity" :options="userStore.genderOptions" filled dense
                            clearable label="Gender Identity" />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-select v-model="filters.language"
                            :options="userStore.languages.map(l => ({ label: l.name, value: l.language_id }))" filled
                            dense clearable label="Language" />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input v-model="filters.location" filled dense clearable label="Location" />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input v-model="filters.organization" filled dense clearable label="Organization" />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-select v-model="filters.context"
                            :options="userStore.contexts.map(c => ({ label: c.name, value: c.context_id }))" filled
                            dense clearable label="Context" />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-select v-model="filters.tags"
                            :options="userStore.tags.map(t => ({ label: t.name, value: t.tag_id }))" filled dense
                            clearable multiple use-chips label="Tags / Skills" />
                    </div>
                    <div class="col-12">
                        <q-input v-model="filters.website" filled dense clearable label="Website" type="url" />
                    </div>
                </div>

                <div class="row justify-end q-gutter-sm q-mt-md">
                    <q-btn flat label="Close" color="secondary" @click="userStore.showSearchDialog = false" />
                    <q-btn label="Search" color="primary" type="submit" />
                </div>
            </q-form>
        </q-card>
    </q-dialog>
    <SearchResults />

</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import SearchResults from './SearchResults.vue';

import { useUserStore } from "../stores/userStore.js";

const userStore = useUserStore();

const filters = ref({
    display_name: "",
    nickname: "",
    gender_identity: null,
    language: null,
    location: "",
    organization: "",
    context: null,
    tags: [],
    website: "",
});

const onSubmit = () => {
    fetchFilteredIdentities(filters.value);
};

const fetchFilteredIdentities = async (filters = {}) => {
    try {
        // Prepare payload for backend: extract value from context & tags
        const payload = {
            display_name: filters.display_name || "",
            nickname: filters.nickname || "",
            gender_identity: filters.gender_identity || "",
            language: filters.language || "",
            location: filters.location || "",
            organization: filters.organization || "",
            context: filters.context?.value || filters.context || "",
            tags: filters.tags?.map(t => t.value || t) || [],
            website: filters.website || ""
        };

        const response = await axios.post(
            "http://localhost:3000/users/search",
            payload,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        userStore.filteredIdenitities = response.data;
        userStore.showSearchResults = true;
        console.log("Fetched filtered identities:", response.data);
    } catch (err) {
        console.error("Failed to fetch filtered identities:", err.response?.data || err.message);
    }
};

onMounted(() => {
    userStore.fetchAllMeta();
});
</script>
