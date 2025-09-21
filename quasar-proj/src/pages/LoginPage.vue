<template>
    <q-layout>
        <q-page-container>
            <q-page class="login-page flex">

                <!-- Left Side: Info / Hero -->
                <div class="login-left flex flex-center column text-white">
                    <div class="text-h2 text-bold">Welcome Back!</div>
                    <div class="text-subtitle1 q-mt-md">
                        Securely manage your digital identities anywhere, anytime.
                    </div>

                    <div class="features-preview q-mt-xl">
                        <div v-for="(feature, i) in features" :key="i" class="feature-item q-mb-md">
                            <q-icon :name="feature.icon" size="32px" class="q-mr-sm" />
                            <span class="text-subtitle2">{{ feature.title }}</span>
                        </div>
                    </div>
                </div>

                <!-- Right Side: Login Form -->
                <div class="login-right flex flex-center">
                    <q-card class="q-pa-lg shadow-3" style="min-width: 360px; border-radius: 16px;">
                        <q-card-section class="text-center">
                            <q-avatar size="64px" class="bg-primary text-white">
                                <q-icon name="lock" size="32px" />
                            </q-avatar>
                            <div class="text-h6 q-mt-md">Welcome Back</div>
                            <div class="text-subtitle2 text-grey">Login to your account</div>
                        </q-card-section>

                        <q-form @submit="onSubmit" class="q-gutter-md">
                            <!-- Username / Email -->
                            <q-input rounded standout v-model="form.username" label="Email or Username" filled clearable
                                lazy-rules :rules="[val => !!val || 'Field is required']">
                                <template v-slot:prepend>
                                    <q-icon name="person" />
                                </template>
                            </q-input>

                            <!-- Password -->
                            <q-input rounded standout v-model="form.password" label="Password"
                                :type="isPwd ? 'password' : 'text'" filled clearable lazy-rules
                                :rules="[val => !!val || 'Password is required']">
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
                                <q-btn label="Login" type="submit" color="primary" class="full-width" unelevated
                                    rounded />
                            </div>
                        </q-form>

                        <!-- Footer Links -->
                        <q-card-section class="text-center q-mt-sm">
                            <q-btn flat rounded color="black" label="Login with GitHub" icon="mdi-github"
                                @click="loginWithGithub" />
                            <q-btn flat size="sm" label="Forgot Password?" color="primary" />
                            <div>
                                <q-btn flat size="sm" label="Don’t have an account?" color="primary" @click="router.push('/register')"/>
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
import { useUserStore } from '../stores/userStore.js';

const router = useRouter();
const userStore = useUserStore();

const features = ref([
    { icon: 'mdi-shield-check', title: 'Secure JWT Authentication' },
    { icon: 'mdi-translate', title: 'Multi-Language Support' },
    { icon: 'mdi-account-group', title: 'Context Management' },
    { icon: 'mdi-tag-multiple', title: 'Advanced Tagging' }
]);

const form = ref({ username: '', password: '' });
const isPwd = ref(true);

const loginWithGithub = () => {
    window.location.href = 'http://localhost:3000/auth/github'
}

const onSubmit = async () => {
    if (!form.value.username || !form.value.password) return;

    try {
        const response = await axios.post('http://localhost:3000/auth/login', {
            username: form.value.username,
            password: form.value.password,
        });
        console.log("response", response);
        // userStore.user = response.data.user;
        // userStore.token = response.data.token;
        localStorage.setItem('token', response.data.token);
        userStore.isLoggedIn = true;
        userStore.errorMessage = '';

        router.push('/home');
    } catch (error) {
        userStore.errorMessage = error.response?.data?.error || 'Login failed';
    }
};
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
</style>
