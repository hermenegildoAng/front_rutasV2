import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' 

// 1. IMPORTAR EL PLUGIN DE TOAST
import Toast from 'vue-toastification'

import 'leaflet/dist/leaflet.css'
import './assets/main.css' 
import 'vue-toastification/dist/index.css'

const app = createApp(App)

// 2. REGISTRAR EL PLUGIN
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
})

app.use(createPinia())
app.use(router)

app.mount('#app')