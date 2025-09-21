<template>
  <q-page class="q-pa-lg">
    <div class="column items-center">

      <!-- Search Bar -->
      <q-input filled rounded dense v-model="search" placeholder="Search identities..." class="q-mb-lg"
        style="max-width: 600px; width: 100%;" @click="userStore.showSearchDialog = true;">
        <template v-slot:prepend>
          <q-icon name="menu" />
        </template>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- Cards Grid -->
      <div class="row q-col-gutter-lg full-width justify-center">
        <div v-for="identity in filteredIdentities" :key="identity.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card class="q-pa-md" style="border-radius: 15px;">
            <div class="row items-center q-mb-md">
              <q-avatar size="50px">
                <img :src="defaultAvatar" />
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-subtitle1">{{ identity.name }}</div>
                <div class="text-caption text-grey">{{ identity.context }}</div>
              </div>
            </div>
            <div class="text-body2 q-mb-sm">
              <q-icon name="mail" size="16px" class="q-mr-xs" />
              {{ identity.email }}
            </div>
            <div class="text-body2">
              <q-icon name="person" size="16px" class="q-mr-xs" />
              {{ identity.username }}
            </div>
          </q-card>
        </div>
      </div>
    </div>
    <SearchDialog />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import SearchDialog from './SearchDialog.vue';
import defaultAvatar from '../../src/assets/default-avatar.png';
import { useUserStore } from '../stores/userStore.js';

const userStore = useUserStore();
const search = ref('');
const identities = ref([]);

// Computed filtered identities based on search
const filteredIdentities = computed(() =>
  identities.value.filter(identity => {
    const name = identity.name || '';
    const username = identity.username || '';
    const email = identity.email || '';
    const context = identity.context || '';

    const searchTerm = search.value.toLowerCase();

    return (
      name.toLowerCase().includes(searchTerm) ||
      username.toLowerCase().includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm) ||
      context.toLowerCase().includes(searchTerm)
    );
  })
);
// let dialogOpenedOnce = false;
// const openSearchDialog = () => {
//   if (!dialogOpenedOnce) {
//     userStore.showSearchDialog = true;
//     userStore.showSearchResults = false;
//     dialogOpenedOnce = true;
//   }
// };

// Fetch 6 users from backend
const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/users/six', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    identities.value = response.data;
    console.log('identities.value', identities.value);
  } catch (err) {
    console.error('Failed to fetch users:', err.response?.data || err.message);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>