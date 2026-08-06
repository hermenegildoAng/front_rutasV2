<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- 📋 FORMULARIO DE REGISTRO -->
    <div
      v-if="rol !== 'super'"
      class="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 h-fit"
    >
      <div>
        <h3 class="text-sm font-bold uppercase tracking-wider text-brand">
          Nueva Agencia GTFS
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">Identificación oficial de la empresa operadora</p>
      </div>

      <form @submit.prevent="agregarAgencia" class="space-y-4" novalidate>
        <!-- agency_id -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">
            ID de la Agencia (agency_id)
          </label>
          <input
            v-model="nuevaAgencia.agency_id"
            type="text"
            placeholder="Ej. SMyT-COL-01"
            :class="[
              'w-full px-3 py-2 text-xs font-mono rounded-xl border focus:outline-none focus:ring-2 transition-all',
              erroresCreacion.agency_id
                ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                : 'border-gray-200 bg-gray-50 focus:ring-brand focus:bg-white text-gray-900'
            ]"
          />
          <p v-if="erroresCreacion.agency_id" class="text-[11px] text-red-500 mt-1 font-medium">
            {{ erroresCreacion.agency_id }}
          </p>
        </div>

        <!-- agency_name -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">
            Nombre Público (agency_name)
          </label>
          <input
            v-model="nuevaAgencia.agency_name"
            type="text"
            placeholder="Ej. Colectivos de Morelos S.A."
            :class="[
              'w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all',
              erroresCreacion.agency_name
                ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                : 'border-gray-200 bg-gray-50 focus:ring-brand focus:bg-white text-gray-900'
            ]"
          />
          <p v-if="erroresCreacion.agency_name" class="text-[11px] text-red-500 mt-1 font-medium">
            {{ erroresCreacion.agency_name }}
          </p>
        </div>

        <!-- agency_url -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">
            Sitio Web (agency_url)
          </label>
          <input
            v-model="nuevaAgencia.agency_url"
            type="url"
            placeholder="https://www.transportemorelos.com"
            :class="[
              'w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all',
              erroresCreacion.agency_url
                ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                : 'border-gray-200 bg-gray-50 focus:ring-brand focus:bg-white text-gray-900'
            ]"
          />
          <p v-if="erroresCreacion.agency_url" class="text-[11px] text-red-500 mt-1 font-medium">
            {{ erroresCreacion.agency_url }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="guardando"
          class="w-full bg-brand hover:bg-brand-700 disabled:bg-brand-300 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.99] uppercase tracking-wider cursor-pointer"
        >
          {{ guardando ? 'Guardando...' : '+ Registrar Operadora' }}
        </button>
      </form>
    </div>

    <!-- 📊 LISTADO DE AGENCIAS -->
    <div
      :class="[
        'bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 w-full',
        rol && rol.toLowerCase() === 'super' ? 'lg:col-span-3' : 'lg:col-span-2',
      ]"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-700">
            Operadoras Activas
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">Agencias enlazables al motor de rutas de la SMyT</p>
        </div>
        <span class="bg-brand-500 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-full font-mono">
          {{ agencias.length }}
        </span>
      </div>

      <!-- Estado Cargando -->
      <div v-if="cargando" class="py-12 text-center text-xs text-gray-400 animate-pulse font-medium">
        Cargando agencias desde la base de datos GTFS...
      </div>

      <!-- Estado Sin Datos -->
      <div v-else-if="agencias.length === 0" class="py-12 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
        No hay agencias registradas aún. ¡Agrega la primera desde el formulario!
      </div>

      <!-- GRID DE CARDS -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="agencia in agencias"
          :key="agencia.agency_id"
          class="group relative flex flex-col justify-between p-4 bg-gray-50/50 hover:bg-white rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200 space-y-3"
        >
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono font-bold text-brand bg-purple-100/70 px-2 py-0.5 rounded text-[10px] tracking-wide">
                {{ agencia.agency_id }}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {{ agencia.agency_lang || 'es' }}
                </span>

                <!-- BOTÓN DE EDITAR EN CARD -->
                <button
                  @click="abrirModalEdicion(agencia)"
                  title="Editar agencia"
                  class="p-1 rounded-lg hover:bg-gray-200/70 text-gray-400 hover:text-brand transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                <!-- BOTÓN DE ELIMINAR EN CARD (NUEVO) -->
                <button
                  @click="abrirModalEliminar(agencia)"
                  title="Eliminar agencia"
                  class="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <h4 class="font-bold text-brand text-sm leading-snug group-hover:text-brand transition-colors">
              {{ agencia.agency_name }}
            </h4>
          </div>

          <div class="pt-1 border-t border-gray-100">
            <a
              :href="agencia.agency_url"
              target="_blank"
              class="inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand font-medium truncate max-w-full font-mono group/link"
            >
              <svg class="w-3.5 h-3.5 shrink-0 text-brand group-hover/link:text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span class="truncate">{{ agencia.agency_url }}</span>
            </a>
          </div>

          <div class="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <div class="flex items-center gap-1 text-gray-600">
              <span class="font-medium font-mono text-[10px]">{{ agencia.agency_timezone || 'America/Mexico_City' }}</span>
            </div>
          </div>
        </div>
      </div>


    </div>

    <!-- 🪟 MODAL FLOTANTE DE EDICIÓN -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-all"
    >
      <div class="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-brand">
              Editar Agencia GTFS
            </h3>
            <p class="text-xs text-gray-400">Modifica la información de la operadora</p>
          </div>
          <button
            @click="cerrarModalEdicion"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="actualizarAgencia" class="space-y-4" novalidate>
          <!-- agency_id -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">
              ID de la Agencia (agency_id)
            </label>
            <input
              v-model="agenciaEdicion.agency_id"
              type="text"
              class="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed font-medium select-none"
              disabled
            />
            <p class="text-[10px] text-gray-400 mt-1 pl-1">
              Identificador único no editable.
            </p>
          </div>

          <!-- agency_name -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">
              Nombre Público (agency_name)
            </label>
            <input
              v-model="agenciaEdicion.agency_name"
              type="text"
              :class="[
                'w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all',
                erroresEdicion.agency_name
                  ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                  : 'border-gray-200 bg-gray-50 focus:ring-brand focus:bg-white text-gray-900'
              ]"
            />
            <p v-if="erroresEdicion.agency_name" class="text-[11px] text-red-500 mt-1 font-medium">
              {{ erroresEdicion.agency_name }}
            </p>
          </div>

          <!-- agency_url -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">
              Sitio Web (agency_url)
            </label>
            <input
              v-model="agenciaEdicion.agency_url"
              type="url"
              :class="[
                'w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all',
                erroresEdicion.agency_url
                  ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400'
                  : 'border-gray-200 bg-gray-50 focus:ring-brand focus:bg-white text-gray-900'
              ]"
            />
            <p v-if="erroresEdicion.agency_url" class="text-[11px] text-red-500 mt-1 font-medium">
              {{ erroresEdicion.agency_url }}
            </p>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="cerrarModalEdicion"
              class="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="bg-brand hover:bg-brand-700 disabled:bg-brand-300 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>


  <!-- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN  -->
<Teleport to="body">
  <div 
    v-if="mostrandoModalEliminar" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
  >
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all space-y-4">
      
      <div class="flex items-center gap-3 text-red-600">
        <div class="p-2.5 bg-red-100 rounded-xl">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-gray-900 text-base">¿Eliminar agencia?</h3>
          <p class="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
        </div>
      </div>

      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600">
        Estás a punto de borrar la agencia <span class="font-bold text-gray-900 font-mono">{{ agenciaEliminar?.agency_id }}</span> ({{ agenciaEliminar?.agency_name }}).
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          @click="cerrarModalEliminar"
          :disabled="cargandoEliminar"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          @click="confirmarEliminar"
          :disabled="cargandoEliminar"
          class="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span v-if="cargandoEliminar">Eliminando...</span>
          <span v-else>Sí, eliminar</span>
        </button>
      </div>

    </div>
  </div>
</Teleport>
</template>
<script setup>
import { onMounted } from 'vue'
import { useAgencias } from '@/composables/useAgencias'

defineProps({
  rol: String,
})

const {
  agencias,
  cargando,
  guardando,
  nuevaAgencia,
  agenciaEdicion,
  modalAbierto,
  erroresCreacion, 
  erroresEdicion, 
  
  obtenerAgencias,
  agregarAgencia,
  actualizarAgencia,
  abrirModalEdicion,
  cerrarModalEdicion,
  agenciaEliminar,
  mostrandoModalEliminar,
  cargandoEliminar,
  abrirModalEliminar,
  cerrarModalEliminar,
  confirmarEliminar
} = useAgencias()

onMounted(() => {
  obtenerAgencias()
})
</script>