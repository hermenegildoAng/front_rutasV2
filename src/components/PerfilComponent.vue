<template>
  <div class="w-full mx-auto p-6 space-y-6 bg-gray-50/50 rounded-2xl">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Mi Perfil</h1>
      <p class="text-sm text-gray-500">Administra tus datos de usuario y seguridad de la cuenta.</p>
    </div>

    <hr class="border-gray-200" />

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <!-- Tarjeta Izquierda (Información del Usuario) -->
      <div class="lg:col-span-1 space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-fit">
        <div class="flex flex-col items-center text-center space-y-2 pb-4 border-b border-gray-100">
          <div :class="[
            'w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-md',
            rol === 'admin' ? 'bg-brand shadow-purple-900/10' : 'bg-blue-600 shadow-blue-900/10'
          ]">
            {{ inicialUsuario }}
          </div>
          <div>
            <h2 class="font-bold text-gray-800">{{ nombreUsuario }}</h2>
            <p :class="[
              'text-xs font-bold tracking-wider uppercase mt-0.5',
              rol === 'admin' ? 'text-brand' : 'text-blue-600'
            ]">{{ rol === 'admin' ? 'Administrador' : 'Capturista' }}</p>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <div>
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre de Usuario</label>
            <p class="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg mt-1 select-all font-mono">
              {{ nombreCuenta }}
            </p>
          </div>
          <div>
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
            <p class="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg mt-1 select-all overflow-hidden text-ellipsis font-mono">
              {{ correo }}
            </p>
          </div>
        </div>
      </div>

      <!-- Formulario Derecho (Cambio de Password) -->
      <div class="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Actualizar Contraseña</h3>
        
        <div v-if="mensajeExito" class="mb-4 p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg font-medium">
          {{ mensajeExito }}
        </div>
        <div v-if="mensajeError" class="mb-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg font-medium">
           {{ mensajeError }}
        </div>

        <form @submit.prevent="cambiarPassword" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Contraseña Actual</label>
            <input 
              v-model="passwordActual" 
              type="password" 
              autocomplete="current-password"
              class="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
              placeholder="••••••••"
              :disabled="cargando"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nueva Contraseña</label>
              <input 
                v-model="passwordNueva" 
                type="password" 
                autocomplete="new-password"
                class="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                placeholder="Mínimo 8 caracteres"
                :disabled="cargando"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Confirmar Nueva Contraseña</label>
              <input 
                v-model="passwordConfirmar" 
                type="password" 
                autocomplete="new-password"
                class="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                placeholder="Repite la contraseña"
                :disabled="cargando"
              />
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button 
              type="submit" 
              :disabled="cargando"
              class="px-5 py-2.5 bg-brand hover:opacity-90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span v-if="cargando">Actualizando...</span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { setSession } from '../services/auth'

const props = defineProps({
  usuario: {
    type: Object,
    required: true,
  }
})
const emit = defineEmits(['usuarioActualizado'])

const datosUsuario = ref({ ...props.usuario })
const rol = computed(() => datosUsuario.value.tipo_usuario)
const nombreUsuario = computed(() => datosUsuario.value.nombre_completo || datosUsuario.value.username || 'Usuario')
const nombreCuenta = computed(() => datosUsuario.value.username || '')
const correo = computed(() => datosUsuario.value.email || '')
const inicialUsuario = computed(() => nombreUsuario.value.charAt(0).toUpperCase())

const passwordActual = ref('')
const passwordNueva = ref('')
const passwordConfirmar = ref('')

const cargando = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')

onMounted(async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/auth/perfil/')
    datosUsuario.value = response.data
    emit('usuarioActualizado', response.data)
  } catch {
    mensajeError.value = 'No se pudo actualizar la información del perfil.'
  }
})

const cambiarPassword = async () => {
  mensajeExito.value = ''
  mensajeError.value = ''

  if (!passwordActual.value || !passwordNueva.value || !passwordConfirmar.value) {
    mensajeError.value = 'Por favor, llena todos los campos.'
    return
  }

  if (passwordNueva.value !== passwordConfirmar.value) {
    mensajeError.value = 'La nueva contraseña y la confirmación no coinciden.'
    return
  }

  if (passwordNueva.value.length < 8) {
    mensajeError.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }

  cargando.value = true

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/auth/cambiar-password/', {
      password_actual: passwordActual.value,
      password_nueva: passwordNueva.value,
      password_confirmar: passwordConfirmar.value,
    })
    setSession(response.data.token, datosUsuario.value)
    
    mensajeExito.value = '¡Contraseña actualizada correctamente!'
    passwordActual.value = ''
    passwordNueva.value = ''
    passwordConfirmar.value = ''
  } catch (error) {
    const data = error.response?.data
    const primerError = data && typeof data === 'object' ? Object.values(data)[0] : null
    mensajeError.value = Array.isArray(primerError)
      ? primerError[0]
      : primerError || 'No se pudo cambiar la contraseña.'
  } finally {
    cargando.value = false
  }
}
</script>
