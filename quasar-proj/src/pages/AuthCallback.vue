<template>
    <div class="text-center q-pa-md">
        <div v-if="loading">Logging in via GitHub...</div>
        <div v-else>
            Login successful! Redirecting...
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);

onMounted(() => {
  // Get token from query string
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    localStorage.setItem('token', token);
    loading.value = false;
    setTimeout(() => router.push('/home'), 1000); // redirect after 1s
  } else {
    loading.value = false;
    alert('GitHub login failed: token missing');
  }
});
</script>
