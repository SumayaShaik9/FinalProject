<template>
  <q-layout>
    <q-page-container>
      <q-page class="login-page flex">

        <!-- Left Side: Info / Hero -->
        <div class="login-left flex flex-center column text-white">
          <div class="text-h2 text-bold">Join Us!</div>
          <div class="text-subtitle1 q-mt-md">
            Create your account to securely manage your digital identities anywhere.
          </div>
        </div>

        <!-- Right Side: Register Form -->
        <div class="login-right flex flex-center">
          <q-card class="q-pa-lg shadow-3" style="min-width: 400px; border-radius: 16px;">
            <q-card-section class="text-center">
              <q-avatar size="64px" class="bg-primary text-white">
                <q-icon name="person_add" size="32px" />
              </q-avatar>
              <div class="text-h6 q-mt-md">Create Account</div>
              <div class="text-subtitle2 text-grey">Sign up to get started</div>
            </q-card-section>

            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Username -->
              <q-input v-model="form.username" label="Username" rounded standout filled clearable lazy-rules
                :rules="[val => !!val || 'Username is required']">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <!-- Email -->
              <q-input v-model="form.email" label="Email" type="email" rounded standout filled clearable lazy-rules
                :rules="[val => !!val || 'Email is required']">
                <template v-slot:prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>

              <!-- Password -->
              <q-input v-model="form.password" label="Password" :type="isPwd ? 'password' : 'text'" rounded standout filled clearable
                lazy-rules :rules="[val => !!val || 'Password is required']">
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                    @click="isPwd = !isPwd" />
                </template>
              </q-input>

              <!-- Submit -->
              <div class="row items-center justify-between q-mt-md">
                <q-btn label="Register" type="submit" color="primary" class="full-width" unelevated rounded />
              </div>
            </q-form>

            <!-- Footer Links -->
            <q-card-section class="text-center q-mt-sm">
              <q-btn flat rounded color="black" label="Register with GitHub" icon="mdi-github"
                                @click="loginWithGithub" />
              <div class="q-mt-sm text-grey">
                Already have an account?
                <q-btn flat size="sm" label="Login" color="primary" @click="router.push('/login')" />
              </div>
            </q-card-section>
          </q-card>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const form = ref({ username: '', email: '', password: '' });
const isPwd = ref(true);

const onSubmit = async () => {
  if (!form.value.username || !form.value.email || !form.value.password) return;
  try {
    const response = await axios.post('http://localhost:3000/auth/register', form.value);
    console.log('Registration success:', response.data);
    router.push('/login');
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
};

const loginWithGithub = () => {
    window.location.href = 'http://localhost:3000/auth/github'
}

</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

/* Left side */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #0a2a3d, #145374);
  padding: 4rem 2rem;
}

.features-preview {
  margin-top: 3rem;
}

.feature-item {
  display: flex;
  align-items: center;
}

/* Right side */
.login-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #f9fbfd;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  padding: 2rem;
}

.icon-wrapper {
  background: #2196f3;
  border-radius: 50%;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pulse-btn {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 15px rgba(33, 150, 243, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

.text-grey-4 {
  color: rgba(0, 0, 0, 0.6);
}

.text-grey-7 {
  color: rgba(0, 0, 0, 0.45);
}
</style>
