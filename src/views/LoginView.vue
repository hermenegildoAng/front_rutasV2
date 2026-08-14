<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
    <div
      class="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100/80 transform transition-all"
    >
      <div class="flex flex-col items-center justify-center">
        <img
          :src="logo"
          alt="Logotipo de la Plataforma GTFS"
          class="h-24 w-full object-contain mb-2"
        />
        <h1 class="mt-2 text-center text-xl font-extrabold text-gray-900 tracking-tight uppercase text-brand">
          Plataforma GTFS
        </h1>
        <p class="mt-1.5 text-center text-xs font-medium text-gray-400 max-w-xs leading-relaxed">
          Migración y digitalización de rutas de transporte público para Google Maps
        </p>
      </div>

      <form v-if="vista === 'login'" class="mt-6 space-y-4" @submit.prevent="manejarLogin">
        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Correo o usuario</label>
            <input
              v-model="identificador"
              type="text"
              autocomplete="username"
              placeholder="usuario@smyt.gob.mx o nombre.usuario"
              class="appearance-none rounded-xl relative block w-full px-4 py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-sm bg-gray-50/50"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contraseña</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="appearance-none rounded-xl relative block w-full px-4 py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-sm bg-gray-50/50"
              required
            />
          </div>
        </div>

        <p v-if="mensajeExito" class="mensaje mensaje-exito">{{ mensajeExito }}</p>
        <p v-if="mensajeError" class="mensaje mensaje-error">{{ mensajeError }}</p>

        <button
          type="button"
          class="w-full text-center text-xs font-bold text-brand hover:underline"
          @click="abrirRecuperacion"
        >
          ¿Olvidaste tu contraseña? Recuperar contraseña
        </button>

        <div class="pt-1">
          <button
            type="submit"
            :disabled="cargando"
            class="boton-principal"
          >
            {{ cargando ? 'Validando acceso...' : 'Ingresar al Sistema' }}
          </button>
        </div>
      </form>

      <section v-else class="mt-6 space-y-4" aria-labelledby="titulo-recuperacion">
        <div>
          <h2 id="titulo-recuperacion" class="text-base font-extrabold text-gray-800">
            Recuperar contraseña
          </h2>
          <p class="mt-1 text-xs text-gray-500 leading-relaxed">
            {{ pasoRecuperacion === 'correo'
              ? 'Escribe el correo registrado en tu cuenta y te enviaremos un código de seis dígitos.'
              : `Escribe el código enviado a ${emailRecuperacion} y elige una contraseña nueva.`
            }}
          </p>
        </div>

        <form v-if="pasoRecuperacion === 'correo'" class="space-y-4" @submit.prevent="solicitarCodigo">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Correo electrónico</label>
            <input
              v-model="emailRecuperacion"
              type="email"
              autocomplete="email"
              placeholder="usuario@smyt.gob.mx"
              class="campo"
              required
            />
          </div>

          <p v-if="mensajeError" class="mensaje mensaje-error">{{ mensajeError }}</p>

          <button type="submit" :disabled="cargando" class="boton-principal">
            {{ cargando ? 'Enviando...' : 'Enviar código' }}
          </button>
        </form>

        <form v-else class="space-y-3.5" @submit.prevent="restablecerPassword">
          <p v-if="mensajeExito" class="mensaje mensaje-exito">{{ mensajeExito }}</p>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Código de verificación</label>
            <input
              v-model="codigo"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              pattern="[0-9]{6}"
              placeholder="000000"
              class="campo text-center text-lg font-bold tracking-[0.35em]"
              required
              @input="codigo = codigo.replace(/\D/g, '').slice(0, 6)"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contraseña nueva</label>
            <input
              v-model="passwordNueva"
              type="password"
              autocomplete="new-password"
              minlength="8"
              placeholder="Mínimo 8 caracteres"
              class="campo"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirmar contraseña</label>
            <input
              v-model="passwordConfirmar"
              type="password"
              autocomplete="new-password"
              minlength="8"
              placeholder="Repite la contraseña"
              class="campo"
              required
            />
          </div>

          <p v-if="mensajeError" class="mensaje mensaje-error">{{ mensajeError }}</p>

          <button type="submit" :disabled="cargando" class="boton-principal">
            {{ cargando ? 'Actualizando...' : 'Cambiar contraseña' }}
          </button>

          <button
            type="button"
            :disabled="cargando"
            class="w-full text-xs font-bold text-brand hover:underline disabled:opacity-50"
            @click="cambiarCorreo"
          >
            Cambiar correo o solicitar otro código
          </button>
        </form>

        <button
          type="button"
          class="w-full text-xs font-semibold text-gray-500 hover:text-gray-800"
          @click="volverLogin"
        >
          Volver al inicio de sesión
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
//import logo from '../assets/logo.jpeg'
import logo from '../assets/logo.png'
import { setSession } from '../services/auth'

const API_AUTH = 'http://127.0.0.1:8000/api/auth/'
const route = useRoute()
const router = useRouter()

const vista = ref('login')
const pasoRecuperacion = ref('correo')  
const identificador = ref('')
const password = ref('')
const emailRecuperacion = ref('')
const codigo = ref('')
const passwordNueva = ref('')
const passwordConfirmar = ref('')
const cargando = ref(false)
const mensajeError = ref('')
const mensajeExito = ref('')

onMounted(() => {
  if (route.query.recuperar === '1') abrirRecuperacion()
})

const limpiarMensajes = () => {
  mensajeError.value = ''
  mensajeExito.value = ''
}

const obtenerMensajeError = (error, respaldo) => {
  const data = error.response?.data
  if (!data || typeof data !== 'object') return respaldo
  const valor = data.error || data.detail || Object.values(data)[0]
  return Array.isArray(valor) ? valor[0] : valor || respaldo
}

const manejarLogin = async () => {
  limpiarMensajes()
  cargando.value = true
  try {
    const response = await axios.post(`${API_AUTH}login/`, {
      identificador: identificador.value.trim(),
      password: password.value,
    })
    setSession(response.data.token, response.data.usuario)
    await router.push('/dashboard')
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error, 'No se pudo conectar con el servidor.')
  } finally {
    cargando.value = false
  }
}

const abrirRecuperacion = () => {
  limpiarMensajes()
  emailRecuperacion.value = identificador.value.includes('@') ? identificador.value.trim() : ''
  vista.value = 'recuperacion'
  pasoRecuperacion.value = 'correo'
}

const solicitarCodigo = async () => {
  limpiarMensajes()
  cargando.value = true
  try {
    const response = await axios.post(`${API_AUTH}recuperar-password/solicitar/`, {
      email: emailRecuperacion.value.trim(),
    })
    pasoRecuperacion.value = 'codigo'
    mensajeExito.value = response.data.modo_correo === 'console'
      ? 'Modo local: el código se imprimió en la terminal donde está ejecutándose Django.'
      : response.data.mensaje
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error, 'No fue posible solicitar el código.')
  } finally {
    cargando.value = false
  }
}

const restablecerPassword = async () => {
  limpiarMensajes()
  if (passwordNueva.value !== passwordConfirmar.value) {
    mensajeError.value = 'Las contraseñas no coinciden.'
    return
  }

  cargando.value = true
  try {
    const response = await axios.post(`${API_AUTH}recuperar-password/confirmar/`, {
      email: emailRecuperacion.value.trim(),
      codigo: codigo.value,
      password_nueva: passwordNueva.value,
      password_confirmar: passwordConfirmar.value,
    })
    identificador.value = emailRecuperacion.value.trim()
    password.value = ''
    vista.value = 'login'
    mensajeExito.value = response.data.mensaje
    codigo.value = ''
    passwordNueva.value = ''
    passwordConfirmar.value = ''
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error, 'No fue posible restablecer la contraseña.')
  } finally {
    cargando.value = false
  }
}

const cambiarCorreo = () => {
  limpiarMensajes()
  codigo.value = ''
  passwordNueva.value = ''
  passwordConfirmar.value = ''
  pasoRecuperacion.value = 'correo'
}

const volverLogin = () => {
  limpiarMensajes()
  vista.value = 'login'
}
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

div.max-w-md {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.campo {
  appearance: none;
  position: relative;
  display: block;
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: rgba(249, 250, 251, 0.5);
  color: #111827;
  font-size: 0.875rem;
  outline: none;
}

.campo:focus {
  border-color: var(--color-brand);
  background: white;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand) 55%, transparent);
}

.boton-principal {
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: var(--color-brand);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: 150ms ease;
}

.boton-principal:hover { opacity: 0.9; }
.boton-principal:active { transform: scale(0.98); }
.boton-principal:disabled { cursor: not-allowed; opacity: 0.5; }

.mensaje {
  padding: 0.5rem 0.75rem;
  border: 1px solid;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
}

.mensaje-error {
  border-color: #fee2e2;
  background: #fef2f2;
  color: #b91c1c;
}

.mensaje-exito {
  border-color: #dcfce7;
  background: #f0fdf4;
  color: #15803d;
}
</style>
