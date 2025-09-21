<template>
  <q-page class="q-pa-md">
    <h4>User List</h4>
    <q-list bordered>
      <q-item v-for="user in users" :key="user.user_id">
        <q-item-section>{{ user.user_name }}</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/users/list-users')
    users.value = res.data
  } catch (err) {
    console.error('Failed to fetch users', err)
  }
})
</script>
