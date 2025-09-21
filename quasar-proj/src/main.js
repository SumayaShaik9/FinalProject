import { createApp } from 'vue';
import App from './App.vue';
import { Quasar } from 'quasar';
import { createPinia } from 'pinia';
import router from "./router/router.js";

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

const app = createApp(App);

// Create Pinia instance
const pinia = createPinia();
app.use(pinia); 

app.use(Quasar, { plugins: {} });
app.use(router);
app.mount('#app');
