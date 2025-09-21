<template>
  <q-layout>
    <q-page-container>
      <q-page class="bg-grey-1">

        <!-- Hero Section -->
        <section class="hero-section flex flex-center column text-center text-white" v-scroll-animate.once>
          <div class="text-h2 text-bold">Simplify Your Digital Identity</div>
          <div class="text-subtitle1 q-mt-sm">
            Securely manage your identities, profiles, and contexts in one platform — anywhere, anytime.
          </div>
          <div class="q-mt-md">
            <q-btn unelevated color="white" text-color="primary" label="Get Started" class="q-mr-sm pulse-btn" @click="router.push('/register')"/>
            <q-btn flat color="white" label="Sign In" class="glass-btn" @click="router.push('/login')"/>
          </div>
        </section>

        <!-- Features Section -->
        <section class="features-section q-pa-xl q-ml-xl q-mr-xl" v-scroll-animate.once>
          <div class="text-h4 text-center q-mb-xl text-primary text-bold">Why Choose Identity Manager?</div>

          <div class="row q-col-gutter-xl justify-center">
            <div v-for="(feature, index) in features" :key="index" class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div class="feature-tile">
                <div class="icon-wrapper">
                  <q-icon :name="feature.icon" size="48px" color="primary" />
                </div>
                <div class="text-h6 q-mt-md">{{ feature.title }}</div>
                <div class="text-body2 text-grey-7 q-mt-sm">{{ feature.desc }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="steps-section q-ma-xl" v-scroll-animate.once>
          <div class="text-caption text-grey-4 q-mb-sm">HOW IT WORKS</div>
          <div class="text-h4 text-white q-mb-xl">
            Manage your identities securely and effortlessly.
          </div>

          <div class="row q-col-gutter-lg justify-center">
            <div v-for="(step, i) in steps" :key="i" class="col-12 col-md-3">
              <div class="step-card">
                <div class="step-number" :class="'delay-' + i">
                  {{ i + 1 }}
                </div>
                <div class="text-h6 text-white q-mt-sm">{{ step.title }}</div>
                <div class="text-body2 text-grey-4 q-mt-xs">{{ step.desc }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Call To Action Section -->
        <section class="q-pa-xl text-center cta-section q-ml-xl q-mr-xl" v-scroll-animate.once>
          <div class="text-h3">Start Managing Your Identities Today</div>
          <div class="q-mt-sm text-subtitle2">
            Sign up now to secure your accounts, manage contexts, and leverage multi-language support.
          </div>
          <q-btn unelevated color="white" text-color="primary" label="Sign Up Now" class="q-mt-md pulse-btn" />
        </section>

        <!-- Footer -->
        <footer class="q-pa-md bg-primary text-white text-center" v-scroll-animate.once>
          <div>© {{ new Date().getFullYear() }} Identity Manager. All rights reserved.</div>
          <div class="q-mt-sm">
            <q-btn flat dense color="white" label="Privacy Policy" size="sm" class="q-mr-sm" />
            <q-btn flat dense color="white" label="Terms of Service" size="sm" />
          </div>
        </footer>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router'

const router = useRouter();

/* Data */
const features = ref([
  {
    icon: "mdi-shield-check",
    title: "Secure JWT Authentication",
    desc: "All accounts are protected with JWT-based authentication to ensure secure access."
  },
  {
    icon: "mdi-translate",
    title: "Multi-Language Support",
    desc: "Manage your identities in multiple languages using our built-in translation system."
  },
  {
    icon: "mdi-account-group",
    title: "Context Management",
    desc: "Organize multiple professional and personal identities with ease."
  },
  {
    icon: "mdi-tag-multiple",
    title: "Advanced Tagging",
    desc: "Use tags to filter, categorize, and quickly find your identities and profiles."
  }
]);

const steps = ref([
  {
    title: "Create Your Account",
    desc: "Sign up and secure your identity with JWT authentication."
  },
  {
    title: "Add Identities & Contexts",
    desc: "Define multiple identities and assign them to relevant contexts and tags."
  },
  {
    title: "Access Anywhere",
    desc: "Easily switch between identities and languages from any device, securely."
  }
]);

/* Directive for scroll animation */
const vScrollAnimate = {
  mounted(el, binding) {
    el.classList.add("before-enter"); // initial hidden state
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("enter");
            if (binding.modifiers.once) {
              observer.unobserve(el);
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
  },
};
defineExpose({ vScrollAnimate });
</script>

<style scoped>
/* Global font */
* {
  font-family: 'Poppins', sans-serif;
}

/* Hero Section with primary theme */
.hero-section {
  background: linear-gradient(135deg, #0a2a3d, #145374);
  min-height: 80vh;
  padding: 3rem 1rem;
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* Section backgrounds */
.section-light {
  background: #f2f5f7;
}

.steps-section {
  background: #0a2a3d;
  padding: 5rem 2rem;
  border-radius: 16px;
  text-align: center;
}

.cta-section {
  background: linear-gradient(135deg, #145374, #0a2a3d);
  color: white;
  border-radius: 20px 20px 0 0;
}

/* Cards */
.gradient-card {
  background: linear-gradient(135deg, #0a2a3d, #145374);
  color: white;
  border-radius: 16px;
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}

/* Steps */
.step-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem 1rem;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.step-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
}

.step-number {
  font-size: 3rem;
  font-weight: bold;
  color: #fff;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.8s forwards;
}

.delay-0 {
  animation-delay: 0.2s;
}

.delay-1 {
  animation-delay: 0.8s;
}

.delay-2 {
  animation-delay: 1.4s;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Buttons */
.pulse-btn {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.glass-btn {
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Scroll Animation */
.before-enter {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.9s ease;
}

.enter {
  opacity: 1;
  transform: translateY(0);
}

.features-section {
  background: #f9fbfd;
}

.feature-tile {
  background: white;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-tile:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.icon-wrapper {
  background: rgba(33, 150, 243, 0.1); /* soft accent */
  border-radius: 50%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
