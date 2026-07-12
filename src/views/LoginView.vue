<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <div
      class="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100/80 transform transition-all"
    >
      <div class="flex flex-col items-center justify-center">
        <div class="h-14 flex items-center justify-center mb-2">
          
        </div>
        <h2 class="mt-3 text-center text-xl font-extrabold text-gray-900 tracking-tight uppercase text-brand">
          Plataforma GTFS
        </h2>
        <p class="mt-1.5 text-center text-xs font-medium text-gray-400 max-w-xs leading-relaxed">
          Migración y digitalización de rutas de transporte público para Google Maps
        </p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="manejarLogin">
        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="usuario@smyt.gob.mx"
              class="appearance-none rounded-xl relative block w-full px-4 py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-sm bg-gray-50/50"
              v-model="correo"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              class="appearance-none rounded-xl relative block w-full px-4 py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-sm bg-gray-50/50"
              v-model="password"
              required
            />
          </div>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl text-white bg-brand hover:opacity-90 shadow-md transition-all active:scale-[0.98]"
          >
            Ingresar al Sistema
          </button>
        </div>
      </form>

      <div class="mt-6 pt-5 border-t border-gray-100">
        <p class="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
          Accesos de prueba (Sandbox):
        </p>
        <div class="grid grid-cols-2 gap-3">
          <button 
            @click="loginRapido('super')" 
            class="px-3 py-2 bg-purple-50 text-brand text-xs font-bold rounded-xl border border-purple-100 hover:bg-brand hover:text-white transition-all uppercase tracking-wider text-center"
          >
             Súper Admin
          </button>
          <button 
            @click="loginRapido('capturista')" 
            class="px-3 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-200 hover:text-gray-800 transition-all uppercase tracking-wider text-center"
          >
             Capturista
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const correo = ref('')
const password = ref('')

const manejarLogin = () => {
  // Simulación inteligente según dominio o credencial
  if (correo.value.includes('admin') || correo.value.includes('super')) {
    localStorage.setItem('user-rol', 'super')
  } else {
    localStorage.setItem('user-rol', 'capturista')
  }
  router.push('/dashboard')
}

const loginRapido = (rol) => {
  localStorage.setItem('user-rol', rol)
  router.push('/dashboard')
}
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div.max-w-md {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>