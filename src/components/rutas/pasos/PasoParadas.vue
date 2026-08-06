<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between sticky top-0 z-10 bg-white/95 py-2 border-b border-gray-100">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Inventario de Paradas</h3>
      <div class="flex gap-2">
        <button 
          @click="$emit('toggle-modo', 'parada')" 
          :class="modoActivo === 'parada' ? 'bg-brand text-white shadow-md' : 'bg-purple-50 text-brand border border-purple-100'"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all select-none cursor-pointer"
        >
          <MapPinIcon class="w-3.5 h-3.5"/> En Mapa
        </button>
        <button 
          @click="agregarParadaManual" 
          class="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all shadow-sm select-none cursor-pointer"
        >
          + Manual
        </button>
      </div>
    </div>

    <!-- Alerta General de Errores (Ej. Mínimo de paradas) -->
    <div v-if="errores?.general_paradas" class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold shadow-sm">
       {{ errores.general_paradas }}
    </div>

    <div class="space-y-4 pt-2">
      <div 
        v-for="(parada, index) in form.paradas" 
        :key="index" 
        :class="['relative border rounded-2xl p-4 space-y-3.5 pt-10 shadow-sm transition-all', 
                 errores?.paradas?.[index]?.secuencia ? 'border-orange-400 bg-orange-50/30' : 'border-gray-200 bg-gray-50/50']"
      >
        <button 
          @click="eliminarParada(index)" 
          class="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          ✕ Quitar
        </button>
        
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-extrabold shadow-sm">
            {{ parada.orden_parada }}
          </span>
          <h4 class="font-bold text-xs text-gray-800 uppercase tracking-wide">Parada Georreferenciada</h4>
        </div>

        <!-- Alerta de Secuencia de Distancia -->
        <div v-if="errores?.paradas?.[index]?.secuencia" class="text-[10px] font-bold text-orange-600 bg-orange-100 p-2 rounded-lg">
           La distancia de esta parada es menor a la anterior. Revisa el orden en el mapa.
        </div>
        <!-- Alerta de Alejamiento del Trazado -->
        <div 
          v-if="errores?.paradas?.[index]?.distancia_trazado" 
          class="text-[10px] font-bold text-red-600 bg-red-100 p-2 rounded-lg"
        >
           La parada está a {{ errores.paradas[index].metros_desviacion }}m del trazado. Debe estar a menos de 50m de la ruta.
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Folio Interno Parada (stop_id)</label>
          <input 
            v-model="parada.folio_parada" 
            placeholder="Ej. SMyT-PAR-024"
            :class="['w-full px-4 py-2 text-sm rounded-xl border bg-white text-gray-900 font-mono text-xs outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all',
                     errores?.paradas?.[index]?.folio_parada ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200']"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre Público (stop_name)</label>
          <input 
            v-model="parada.nombre_parada" 
            placeholder="Ej. Parque de San Juan (Frente a Iglesia)"
            :class="['w-full px-4 py-2 text-sm rounded-xl border bg-white text-gray-900 font-medium outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all',
                     errores?.paradas?.[index]?.nombre_parada ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200']"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Latitud (stop_lat)</label>
            <input 
              v-model="parada.latitud" 
              @input="$emit('actualizar-mapa')" 
              placeholder="Ej. 19.313900"
              :class="['w-full px-4 py-2 text-sm rounded-xl border bg-white text-gray-900 font-mono text-xs outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all',
                       errores?.paradas?.[index]?.latitud ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200']"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Longitud (stop_lon)</label>
            <input 
              v-model="parada.longitud" 
              @input="$emit('actualizar-mapa')" 
              placeholder="Ej. -98.240400"
              :class="['w-full px-4 py-2 text-sm rounded-xl border bg-white text-gray-900 font-mono text-xs outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all',
                       errores?.paradas?.[index]?.longitud ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200']"
            />
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="form.paradas.length === 0" 
      class="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50"
    >
      No hay paradas marcadas para esta ruta. Activa el botón de <span class="font-bold text-brand">"En Mapa"</span> para posicionarlas directamente con clicks o usa <span class="font-bold text-gray-600 font-mono">+ Manual</span>.
    </div>
  </div>
</template>

<script setup>
import { MapPin as MapPinIcon } from '@lucide/vue'

const form = defineModel({ type: Object, required: true })

// Agregamos la prop "errores" que viene de tu composable useRutaValidation
defineProps({
  modoActivo: { type: String, default: null },
  errores: { type: Object, default: () => ({ paradas: [] }) }
})

const emit = defineEmits(['toggle-modo', 'actualizar-mapa'])

const agregarParadaManual = () => {
  const orden = form.value.paradas.length + 1
  form.value.paradas.push({ 
    folio_parada: '', 
    nombre_parada: '', 
    latitud: '', 
    longitud: '', 
    orden_parada: orden 
  })
}

const eliminarParada = (index) => {
  form.value.paradas.splice(index, 1)
  form.value.paradas.forEach((p, i) => { p.orden_parada = i + 1 })
  emit('actualizar-mapa')
}
</script>