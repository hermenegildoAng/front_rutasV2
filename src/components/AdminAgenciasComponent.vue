<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- 📋 COLUMNA IZQUIERDA: FORMULARIO DE REGISTRO (Solo visible si NO es súper admin) -->
    <div
      v-if="rol !== 'super'"
      class="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 h-fit"
    >
      <div>
        <h3 class="text-sm font-bold uppercase tracking-wider text-purple-700">
          Nueva Agencia GTFS
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">Identificación oficial de la empresa operadora</p>
      </div>

      <form @submit.prevent="agregarAgencia" class="space-y-4">
        <!-- agency_id -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">
            ID de la Agencia (agency_id)
          </label>
          <input
            v-model="nuevaAgencia.agency_id"
            type="text"
            placeholder="Ej. SMyT-COL-01"
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-gray-900 font-mono text-xs"
            required
          />
        </div>

        <!-- agency_name -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">
            Nombre Público (agency_name)
          </label>
          <input
            v-model="nuevaAgencia.agency_name"
            type="text"
            placeholder="Ej. Colectivos de Tlaxcala S.A."
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-gray-900"
            required
          />
        </div>

        <!-- agency_url -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">
            Sitio Web (agency_url)
          </label>
          <input
            v-model="nuevaAgencia.agency_url"
            type="url"
            placeholder="https://www.transportetlaxcala.com"
            class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-gray-900"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- agency_timezone -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Zona Horaria</label>
            <select
              v-model="nuevaAgencia.agency_timezone"
              class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-gray-900 text-xs cursor-pointer"
            >
              <option value="America/Mexico_City">CDMX (Central)</option>
            </select>
          </div>

          <!-- agency_lang -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Idioma (lang)</label>
            <select
              v-model="nuevaAgencia.agency_lang"
              class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-gray-900 text-xs cursor-pointer"
            >
              <option value="es">Español (es)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.99] uppercase tracking-wider cursor-pointer"
        >
          + Registrar Operadora
        </button>
      </form>
    </div>

    <!-- 📊 COLUMNA DERECHA: LISTADO DE AGENCIAS EN CARDS -->
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
        <span class="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full font-mono">
          {{ agencias.length }}
        </span>
      </div>

      <!-- GRID DE CARDS RESPONSIVE -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="agencia in agencias"
          :key="agencia.agency_id"
          class="group relative flex flex-col justify-between p-4 bg-gray-50/50 hover:bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 space-y-3"
        >
          <!-- Top Card: ID Badge + Nombre -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded text-[10px] tracking-wide">
                {{ agencia.agency_id }}
              </span>
              <span class="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {{ agencia.agency_lang }}
              </span>
            </div>
            <h4 class="font-bold text-gray-900 text-sm leading-snug group-hover:text-purple-900 transition-colors">
              {{ agencia.agency_name }}
            </h4>
          </div>

          <!-- Middle Card: URL Web -->
          <div class="pt-1 border-t border-gray-100">
            <a
              :href="agencia.agency_url"
              target="_blank"
              class="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium truncate max-w-full font-mono group/link"
            >
              <svg class="w-3.5 h-3.5 shrink-0 text-gray-400 group-hover/link:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span class="truncate">{{ agencia.agency_url }}</span>
            </a>
          </div>

          <!-- Bottom Card: Config GTFS -->
          <div class="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <div class="flex items-center gap-1 text-gray-600">
              <span>⏰</span>
              <span class="font-medium font-mono text-[10px]">{{ agencia.agency_timezone }}</span>
            </div>
          </div>
        </div>
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