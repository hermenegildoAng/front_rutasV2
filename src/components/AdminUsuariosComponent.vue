<template>
  <div class="space-y-6">
    <!-- FORMULARIO DE REGISTRO -->
    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 text-purple-700">
        Registrar Nuevo Personal
      </h3>

      <form @submit.prevent="agregarUsuario" class="grid grid-cols-1 md:grid-cols-5 gap-4 items-start" novalidate>
        <!-- Nombre Completo -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Nombre Completo</label>
          <input
            v-model="nuevoUsuario.nombre_completo"
            type="text"
            placeholder="Ej. Alicia Xu"
            :class="[
              'w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all',
              errores.nombre_completo
                ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                : 'border-gray-200 bg-gray-50 focus:ring-purple-600 focus:bg-white text-gray-900'
            ]"
          />
          <p v-if="errores.nombre_completo" class="text-[11px] text-red-500 mt-1 font-medium">
            {{ errores.nombre_completo }}
          </p>
        </div>

        <!-- Usuario Autogenerado (Readonly) -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Usuario (Auto)</label>
          <input
            v-model="nuevoUsuario.username"
            type="text"
            placeholder="Autogenerado..."
            readonly
            class="w-full px-3 py-2 text-xs font-mono bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none"
          />
        </div>

        <!-- Correo Electrónico -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Correo Electrónico</label>
          <input
            v-model="nuevoUsuario.email"
            type="email"
            placeholder="alicia@gob.mx"
            :class="[
              'w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all',
              errores.email
                ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                : 'border-gray-200 bg-gray-50 focus:ring-purple-600 focus:bg-white text-gray-900'
            ]"
          />
          <p v-if="errores.email" class="text-[11px] text-red-500 mt-1 font-medium">
            {{ errores.email }}
          </p>
        </div>

        <!-- Rol de Acceso -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Rol de Acceso</label>
          <select
            v-model="nuevoUsuario.tipo_usuario"
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-gray-900 cursor-pointer"
          >
            <option value="capturador">Capturista</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <!-- Botón submit -->
        <div class="pt-5">
          <button
            type="submit"
            :disabled="guardando"
            class="w-full bg-brand hover:bg-brand-700 disabled:bg-brand-300 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.99] uppercase tracking-wider cursor-pointer"
          >
            {{ guardando ? 'Guardando...' : '+ Agregar' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="passwordTemporal" class="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-5 py-4 text-sm">
      Contraseña temporal del usuario recién creado:
      <strong class="font-mono select-all ml-1">{{ passwordTemporal }}</strong>.
      Compártela de forma segura; no volverá a mostrarse.
    </div>

    <!-- LISTADO DE USUARIOS -->
    <div class="space-y-4">
      <div class="flex items-center justify-between px-2">
        <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">
          Personal de la Plataforma
        </h3>
        <span class="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full font-mono">
          {{ listaUsuarios.length }}
        </span>
      </div>

      <!-- Estado Cargando -->
      <div v-if="cargando" class="py-12 text-center text-xs text-gray-400 animate-pulse font-medium">
        Cargando personal registrado...
      </div>

      <!-- Vista Tabla (Pantallas Medias y Grandes) -->
      <div v-else-if="listaUsuarios.length > 0" class="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th class="py-3 px-6">Nombre / Usuario</th>
              <th class="py-3 px-6">Correo</th>
              <th class="py-3 px-6">Rol</th>
              <th class="py-3 px-6">Estado</th>
              <th class="py-3 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="user in usuariosPaginados" :key="user.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-4 px-6">
                <div class="font-semibold text-gray-900">{{ user.nombre_completo || user.username }}</div>
                <div class="text-xs text-gray-400 font-mono">@{{ user.username }}</div>
              </td>
              <td class="py-4 px-6 text-xs font-mono text-gray-600">
                {{ user.email }}
              </td>
              <td class="py-4 px-6">
                <select
                  :value="user.tipo_usuario"
                  :disabled="user.id === usuarioActualId"
                  @change="cambiarRol(user, $event)"
                  class="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="capturador">Capturista</option>
                  <option value="admin">Administrador</option>
                </select>
              </td>
              <td class="py-4 px-6">
                <span v-if="user.activo" class="inline-flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> Activo
                </span>
                <span v-else class="inline-flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <span class="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span> Inactivo
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="toggleEstado(user)"
                    :disabled="user.id === usuarioActualId"
                    :class="user.activo ? 'text-red-600 hover:bg-red-50 border border-red-200' : 'text-purple-700 hover:bg-purple-50 border border-purple-200'"
                    class="px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {{ user.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button
                    @click="abrirModalEliminar(user)"
                    :disabled="user.id === usuarioActualId"
                    class="px-3 py-1 text-xs font-bold rounded-lg text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vista Cards (Móviles) -->
      <div v-if="!cargando && listaUsuarios.length > 0" class="block md:hidden grid grid-cols-1 gap-4">
        <div v-for="user in usuariosPaginados" :key="'card-' + user.id" class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div class="flex justify-between items-start gap-2">
            <div>
              <div class="font-bold text-gray-900 text-base">{{ user.nombre_completo || user.username }}</div>
              <div class="text-xs text-purple-700 font-mono font-semibold">@{{ user.username }}</div>
              <div class="text-xs text-gray-400 font-mono mt-0.5">{{ user.email }}</div>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <button
                @click="toggleEstado(user)"
                :disabled="user.id === usuarioActualId"
                :class="user.activo ? 'text-red-600 bg-red-50' : 'text-purple-700 bg-purple-50'"
                class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-40"
              >
                {{ user.activo ? 'Desactivar' : 'Activar' }}
              </button>
              <button
                @click="abrirModalEliminar(user)"
                :disabled="user.id === usuarioActualId"
                class="px-2.5 py-1 text-xs font-bold rounded-lg text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-40"
              >
                Eliminar
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-gray-50">
            <select
              :value="user.tipo_usuario"
              :disabled="user.id === usuarioActualId"
              @change="cambiarRol(user, $event)"
              class="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
            >
              <option value="capturador">Capturista</option>
              <option value="admin">Administrador</option>
            </select>

            <span v-if="user.activo" class="inline-flex items-center text-xs font-semibold text-green-700">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> Activo
            </span>
            <span v-else class="inline-flex items-center text-xs font-semibold text-gray-400">
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span> Inactivo
            </span>
          </div>
        </div>
      </div>

      <PaginadorComponent
        v-model="paginaActual"
        :total="listaUsuarios.length"
        :por-pagina="USUARIOS_POR_PAGINA"
      />
    </div>

    <ConfirmacionEliminarComponent
      :model-value="mostrandoModalEliminar"
      titulo="¿Eliminar usuario?"
      titulo-id="titulo-eliminar-usuario"
      texto-confirmar="Sí, eliminar usuario"
      :cargando="cargandoEliminar"
      @cancelar="cerrarModalEliminar"
      @confirmar="confirmarEliminar"
    >
      Estás a punto de borrar al usuario
      <span class="font-bold text-gray-900">{{ usuarioEliminar?.nombre_completo || usuarioEliminar?.username }}</span>
      (<span class="font-mono">@{{ usuarioEliminar?.username }}</span>).
      Su cuenta y sus sesiones se eliminarán permanentemente.
    </ConfirmacionEliminarComponent>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUsuarios } from '@/composables/useUsuarios'
import { getUser } from '@/services/auth'
import ConfirmacionEliminarComponent from './ConfirmacionEliminarComponent.vue'
import PaginadorComponent from './PaginadorComponent.vue'

const usuarioActualId = getUser()?.id

const {
  listaUsuarios,
  cargando,
  guardando,
  passwordTemporal,
  nuevoUsuario,
  errores,
  obtenerUsuarios,
  agregarUsuario,
  toggleEstado,
  actualizarRol,
  usuarioEliminar,
  mostrandoModalEliminar,
  cargandoEliminar,
  abrirModalEliminar,
  cerrarModalEliminar,
  confirmarEliminar,
} = useUsuarios()

const paginaActual = ref(1)
const USUARIOS_POR_PAGINA = 6
const usuariosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * USUARIOS_POR_PAGINA
  return listaUsuarios.value.slice(inicio, inicio + USUARIOS_POR_PAGINA)
})

const cambiarRol = (usuario, event) => {
  const anterior = usuario.tipo_usuario
  usuario.tipo_usuario = event.target.value
  actualizarRol(usuario, anterior)
}

onMounted(() => {
  obtenerUsuarios()
})
</script>
