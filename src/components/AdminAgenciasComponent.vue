<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- 📋 COLUMNA IZQUIERDA: FORMULARIO DE REGISTRO (Solo visible si NO es súper admin) -->
    <div
      v-if="rol !== 'super'"
      class="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 h-fit"
    >
      <div>
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider text-brand">
          Nueva Agencia GTFS
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">Identificación oficial de la empresa operadora</p>
      </div>

      <form @submit.prevent="agregarAgencia" class="space-y-4">
        <!-- agency_id -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1"
            >ID de la Agencia (agency_id)</label
          >
          <input
            v-model="nuevaAgencia.agency_id"
            type="text"
            placeholder="Ej. SMyT-COL-01"
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 font-mono text-xs"
            required
          />
        </div>

        <!-- agency_name -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1"
            >Nombre Público (agency_name)</label
          >
          <input
            v-model="nuevaAgencia.agency_name"
            type="text"
            placeholder="Ej. Colectivos de Tlaxcala S.A."
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900"
            required
          />
        </div>

        <!-- agency_url -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1"
            >Sitio Web (agency_url)</label
          >
          <input
            v-model="nuevaAgencia.agency_url"
            type="url"
            placeholder="https://www.transportetlaxcala.com"
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- agency_timezone -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Zona Horaria</label>
            <select
              v-model="nuevaAgencia.agency_timezone"
              class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 text-xs cursor-pointer"
            >
              <option value="America/Mexico_City">CDMX (Central)</option>
            </select>
          </div>

          <!-- agency_lang -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Idioma (lang)</label>
            <select
              v-model="nuevaAgencia.agency_lang"
              class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 text-xs cursor-pointer"
            >
              <option value="es">Español (es)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-brand hover:opacity-90 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.99] uppercase tracking-wider"
        >
          + Registrar Operadora
        </button>
      </form>
    </div>

    <!-- 📊 COLUMNA DERECHA: LISTADO DE AGENCIAS -->
    <div
      :class="[
        'bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 w-full',
        rol && rol.toLowerCase() === 'super' ? 'lg:col-span-3' : 'lg:col-span-2',
      ]"
    >
      <div>
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-700">
          Operadoras Activas
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">Agencias enlazables al motor de rutas de la SMyT</p>
      </div>

      <div class="overflow-x-auto border border-gray-100 rounded-xl w-full">
        <table class="w-full text-left border-collapse table-auto">
          <thead>
            <tr
              class="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
            >
              <th class="py-3 px-4">ID / Nombre</th>
              <th class="py-3 px-4">URL de Agencia</th>
              <th class="py-3 px-4">Configuración GTFS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-xs">
            <tr
              v-for="agencia in agencias"
              :key="agencia.agency_id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="py-3 px-4 whitespace-nowrap">
                <span
                  class="font-mono font-bold text-brand bg-purple-50 px-1.5 py-0.5 rounded text-[10px] block w-fit mb-0.5"
                >
                  {{ agencia.agency_id }}
                </span>
                <span class="font-bold text-gray-900 text-sm">{{ agencia.agency_name }}</span>
              </td>
              <td class="py-3 px-4 text-blue-600 hover:underline font-medium break-all font-mono">
                <a :href="agencia.agency_url" target="_blank">{{ agencia.agency_url }}</a>
              </td>
              <td class="py-3 px-4 text-gray-500 space-y-0.5 whitespace-nowrap">
                <div class="flex items-center gap-1">
                  <span>⏰</span>
                  <span class="font-medium">{{ agencia.agency_timezone }}</span>
                </div>
                <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider pl-5">
                  Idioma principal: {{ agencia.agency_lang }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  rol: String,
})

// Mocks localizados exactamente para el entorno estatal de transporte
const agencias = ref([
  {
    id: 1,
    agency_id: 'SMyT-COL-01',
    agency_name: 'Colectivos Urbanos de Tlaxcala',
    agency_url: 'https://www.colectivostlax.org.mx',
    agency_timezone: 'America/Mexico_City',
    agency_lang: 'es',
  },
  {
    id: 2,
    agency_id: 'SMyT-FLE-02',
    agency_name: 'Flecha Azul Intermunicipal',
    agency_url: 'https://www.flechaazul-transit.mx',
    agency_timezone: 'America/Mexico_City',
    agency_lang: 'es',
  },
])

const nuevaAgencia = ref({
  agency_id: '',
  agency_name: '',
  agency_url: '',
  agency_timezone: 'America/Mexico_City',
  agency_lang: 'es',
})

const agregarAgencia = () => {
  agencias.value.push({ 
    id: Date.now(),
    ...nuevaAgencia.value 
  })
  nuevaAgencia.value = {
    agency_id: '',
    agency_name: '',
    agency_url: '',
    agency_timezone: 'America/Mexico_City',
    agency_lang: 'es',
  }
}
</script>