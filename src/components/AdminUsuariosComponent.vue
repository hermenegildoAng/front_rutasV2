<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 text-brand">
        Registrar Nuevo Personal
      </h3>

      <form
        @submit.prevent="agregarUsuario"
        class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Nombre Completo</label>
          <input
            v-model="nuevoUsuario.nombre"
            type="text"
            placeholder="Ej. Sria. Alicia X."
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Correo Electrónico</label>
          <input
            v-model="nuevoUsuario.correo"
            type="email"
            placeholder="alicia@gob.mx"
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Rol de Acceso</label>
          <select
            v-model="nuevoUsuario.rol"
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 cursor-pointer"
          >
            <option value="capturista">Capturista</option>
            <option value="super">Súper Usuario</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            class="w-full bg-brand hover:opacity-90 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-sm active:scale-[0.99] uppercase tracking-wider text-xs"
          >
            Agregar Usuario
          </button>
        </div>
      </form>
    </div>

    <div class="space-y-4">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400 px-2">
        Personal de la Plataforma
      </h3>

      <div
        class="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
            >
              <th class="py-3 px-6">Usuario / Correo</th>
              <th class="py-3 px-6">Rol</th>
              <th class="py-3 px-6">Estado</th>
              <th class="py-3 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr
              v-for="user in listaUsuarios"
              :key="user.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="py-4 px-6">
                <div class="font-semibold text-gray-900">{{ user.nombre }}</div>
                <div class="text-xs text-gray-400 font-mono">{{ user.correo }}</div>
              </td>
              <td class="py-4 px-6">
                <span
                  :class="badgeRol(user.rol)"
                  class="px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wide"
                >
                  {{ user.rol === 'super' ? 'Súper Usuario' : 'Capturista' }}
                </span>
              </td>
              <td class="py-4 px-6">
                <span
                  v-if="user.activo"
                  class="inline-flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full"
                >
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> Activo
                </span>
                <span
                  v-else
                  class="inline-flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                >
                  <span class="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span> Desactivado
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <button
                  @click="toggleEstado(user)"
                  :class="
                    user.activo
                      ? 'text-red-600 hover:bg-red-50 border border-red-200'
                      : 'text-brand hover:bg-gray-50 border border-gray-200'
                  "
                  class="px-3 py-1 text-xs font-bold rounded-lg transition-all"
                >
                  {{ user.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="block md:hidden grid grid-cols-1 gap-4">
        <div
          v-for="user in listaUsuarios"
          :key="'card-' + user.id"
          class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
        >
          <div class="flex justify-between items-start gap-2">
            <div>
              <div class="font-bold text-gray-900 text-base">{{ user.nombre }}</div>
              <div class="text-xs text-gray-400 font-mono">{{ user.correo }}</div>
            </div>
            <button
              @click="toggleEstado(user)"
              :class="user.activo ? 'text-red-600 bg-red-50' : 'text-brand bg-gray-50'"
              class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all active:scale-95"
            >
              {{ user.activo ? 'Desactivar' : 'Activar' }}
            </button>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-gray-50">
            <span
              :class="badgeRol(user.rol)"
              class="px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wide"
            >
              {{ user.rol === 'super' ? 'Súper' : 'Capturista' }}
            </span>

            <span
              v-if="user.activo"
              class="inline-flex items-center text-xs font-semibold text-green-700"
            >
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> Activo
            </span>
            <span v-else class="inline-flex items-center text-xs font-semibold text-gray-400">
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span> Inactivo
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Catálogo limpio alineado a la estructura del SMyT
const listaUsuarios = ref([
  {
    id: 1,
    nombre: 'Ing. Alejandro H.',
    correo: 'alejandro.admin@gob.mx',
    rol: 'super',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Sria. Beatriz M.',
    correo: 'beatriz.captura@gob.mx',
    rol: 'capturista',
    activo: true,
  }
])

const nuevoUsuario = ref({ nombre: '', correo: '', rol: 'capturista' })

const agregarUsuario = () => {
  listaUsuarios.value.unshift({
    id: Date.now(),
    nombre: nuevoUsuario.value.nombre,
    correo: nuevoUsuario.value.correo,
    rol: nuevoUsuario.value.rol,
    activo: true,
  })
  nuevoUsuario.value.nombre = ''
  nuevoUsuario.value.correo = ''
  nuevoUsuario.value.rol = 'capturista'
}

const toggleEstado = (usuario) => {
  usuario.activo = !usuario.activo
}

const badgeRol = (rol) => {
  if (rol === 'super') return 'bg-purple-50 text-purple-600 border border-purple-100'
  return 'bg-blue-50 text-blue-600 border border-blue-100'
}
</script>