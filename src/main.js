import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // Por si vas a usar archivos separados de rutas

// Importación obligatoria de los estilos CSS de Leaflet para que el mapa no se rompa visualmente
import 'leaflet/dist/leaflet.css'
import './assets/main.css' // Tus estilos de Tailwind

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')