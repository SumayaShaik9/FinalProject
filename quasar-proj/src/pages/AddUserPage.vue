<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 400px; margin: auto;">
      <h3>Add New User</h3>

      <q-input
        filled
        v-model="userName"
        label="User Name"
        :rules="[val => !!val || 'User name is required']"
      />

      <q-btn
        label="Add User"
        color="primary"
        @click="submitForm"
        :disable="!userName"
      />

      <q-banner v-if="message" class="q-mt-md" dense>
        {{ message }}
      </q-banner>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const userName = ref('')
const message = ref('')

const submitForm = async () => {
    console.log('userName.value',userName.value);
  try {
    const response = await axios.post('http://localhost:3000/users/add-user', {
      user_name: userName.value
    })

    message.value = response.data
    userName.value = '' // reset input
  } catch (error) {
    message.value = 'Error adding user: ' + error.message
  }
}
</script>
