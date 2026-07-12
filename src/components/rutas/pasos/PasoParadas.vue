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

    <div class="space-y-4 pt-2">
      <div 
        v-for="(parada, index) in form.paradas" 
        :key="index" 
        class="relative border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3.5 pt-10 shadow-sm"
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

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Folio Interno Parada (stop_id)</label>
          <input 
            v-model="parada.folio_parada" 
            placeholder="Ej. SMyT-PAR-024"
            class="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 font-mono text-xs outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre Público (stop_name)</label>
          <input 
            v-model="parada.nombre_parada" 
            placeholder="Ej. Parque de San Juan (Frente a Iglesia)"
            class="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 font-medium outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Latitud (stop_lat)</label>
            <input 
              v-model="parada.latitud" 
              @input="$emit('actualizar-mapa')" 
              placeholder="Ej. 19.313900"
              class="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 font-mono text-xs outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Longitud (stop_lon)</label>
            <input 
              v-model="parada.longitud" 
              @input="$emit('actualizar-mapa')" 
              placeholder="Ej. -98.240400"
              class="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 font-mono text-xs outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
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

defineProps({
  modoActivo: { type: String, default: null }
})

const emit = defineEmits(['toggle-modo', 'actualizar-mapa'])

const agregarParadaManual = () => {
  const orden = form.value.paradas.length + 1
  form.value.paradas.push({ 
    folio_parada: '', 
    nombre_parada: `Parada ${orden}`, 
    latitud: '', 
    longitud: '', 
    orden_parada: orden 
  })
}

const eliminarParada = (index) => {
  form.value.paradas.splice(index, 1)
  // Reindexar el orden secuencial de las paradas restantes
  form.value.paradas.forEach((p, i) => { p.orden_parada = i + 1 })
  emit('actualizar-mapa')
}
</script>