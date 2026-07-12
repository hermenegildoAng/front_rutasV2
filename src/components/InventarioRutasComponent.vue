<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
    >
      <div>
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider text-brand">
          Rutas Registradas en el Sistema
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">Inventario general de mapeo</p>
      </div>

      <div class="w-full sm:w-64">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          class="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900"
        />
      </div>
    </div>

    <div class="space-y-4">
      <div
        class="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
            >
              <th class="py-3 px-6">Código / Nombre</th>
              <th class="py-3 px-6">Estado Mapeo</th>
              <th class="py-3 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="ruta in rutas" :key="ruta.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-4 px-6">
                <div class="font-bold text-brand">{{ ruta.codigo }}</div>
                <div class="font-medium text-gray-900 text-xs">{{ ruta.nombre }}</div>
              </td>

              <td class="py-4 px-6">
                <span
                  :class="[
                    'inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full font-bold',
                    ruta.completo
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full mr-1', ruta.completo ? 'bg-green-500' : 'bg-red-500']"></span>
                  <span>{{ ruta.completo ? 'Completo' : 'Incompleto' }}</span>
                </span>
              </td>

              <td class="py-4 px-6 text-right space-x-2">
                <button
                  @click="$emit('editarRuta', ruta)"
                  class="px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold rounded-xl transition-all"
                >
                  Editar
                </button>
                <button
                  @click="$emit('eliminarRuta', ruta.id)"
                  class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="block md:hidden grid grid-cols-1 gap-4">
        <div
          v-for="ruta in rutas"
          :key="'ruta-card-' + ruta.id"
          class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
        >
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-extrabold text-brand block uppercase tracking-wide">
                {{ ruta.codigo }}
              </span>
              <span class="font-bold text-gray-900 text-sm block mt-0.5">{{ ruta.nombre }}</span>
            </div>

            <span
              :class="[
                'text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide',
                ruta.completo ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              ]"
            >
              {{ ruta.completo ? 'Completo' : 'Incompleto' }}
            </span>
          </div>

          <div class="flex items-center justify-end pt-2 border-t border-gray-50 gap-2">
            <button
              @click="$emit('editarRuta', ruta)"
              class="px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold rounded-lg transition-all"
            >
              Editar
            </button>
            <button
              @click="$emit('eliminarRuta', ruta.id)"
              class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div
        v-if="mostrarToast"
        class="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-800 flex items-center space-x-3 z-50"
      >
        <span class="text-green-400 font-bold">🎉</span>
        <div class="text-xs">
          <p class="font-bold">Archivo {{ archivoDescargado }} generado</p>
          <p class="text-gray-400 text-[10px]">Listo para cargar en Google Maps Engine / GTFS</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mostrarToast = ref(false)
const archivoDescargado = ref('')

// Cambié las propiedades viejas por el booleano 'completo' para controlar los badges
const rutas = ref([
  {
    id: 1,
    codigo: 'R-01 TRONCAL',
    nombre: 'Centro Histórico - Central de Autobuses',
    completo: true,
  },
  {
    id: 2,
    codigo: 'R-12 LINEA B',
    nombre: 'Circuito Periférico Norte - Hospitales',
    completo: false,
  },
  {
    id: 3,
    codigo: 'R-25 MARGARITAS',
    nombre: 'Colonia Las Flores - Vía Alterna Express',
    completo: true,
  },
  {
    id: 4,
    codigo: 'R-INT-04',
    nombre: 'Zona Metropolitana - Parque Industrial',
    completo: false,
  },
])
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
</style>
