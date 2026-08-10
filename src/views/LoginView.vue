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
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Correo o usuario</label>
            <input
              type="text"
              placeholder="usuario@smyt.gob.mx o nombre.usuario"
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

        <p v-if="mensajeError" class="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {{ mensajeError }}
        </p>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="cargando"
            class="w-full flex justify-center py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl text-white bg-brand hover:opacity-90 shadow-md transition-all active:scale-[0.98]"
          >
            {{ cargando ? 'Validando acceso...' : 'Ingresar al Sistema' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { setSession } from '../services/auth'

const router = useRouter()
const correo = ref('')
const password = ref('')
const cargando = ref(false)
const mensajeError = ref('')

const manejarLogin = async () => {
  mensajeError.value = ''
  cargando.value = true
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
      identificador: correo.value.trim(),
      password: password.value,
    })
    setSession(response.data.token, response.data.usuario)
    await router.push('/dashboard')
  } catch (error) {
    mensajeError.value = error.response?.data?.error || 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
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
