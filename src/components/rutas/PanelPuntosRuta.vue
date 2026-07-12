<template>
  <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 overflow-hidden flex flex-col max-h-[calc(100vh-280px)]">
    
    <div class="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
      <div>
        <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Nodos del Trazo</h3>
        <p class="text-[11px] text-gray-400 font-semibold font-mono">{{ puntos.length }} punto(s) geométrico(s)</p>
      </div>
      <div class="flex gap-1.5">
        <button
          @click="$emit('toggle-modo', 'trazar')"
          :class="modoActivo === 'trazar' ? 'bg-brand text-white shadow-sm' : 'bg-purple-50 text-brand border border-purple-100'"
          class="text-[10px] px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all hover:opacity-90 select-none cursor-pointer"
        >
          ✏️ Mapa
        </button>
        <button
          @click="agregarPuntoManual"
          class="text-[10px] px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all font-bold uppercase tracking-wider select-none cursor-pointer"
        >
          + Manual
        </button>
      </div>
    </div>

    <div v-show="listaPuntosVisible" class="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
      <div
        v-for="(punto, index) in puntos"
        :key="index"
        class="flex items-center gap-2 bg-gray-50/50 rounded-xl p-2 border border-gray-200 transition-all focus-within:border-purple-300"
      >
        <span class="w-5 h-5 rounded-full bg-brand text-white text-[9px] flex items-center justify-center font-extrabold shadow-sm shrink-0 font-mono">
          {{ index + 1 }}
        </span>
        
        <div class="flex-1 grid grid-cols-2 gap-1.5">
          <input
            v-model="punto.lat"
            placeholder="Latitud"
            class="text-xs font-mono px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-brand focus:border-transparent w-full"
          />
          <input
            v-model="punto.lng"
            placeholder="Longitud"
            class="text-xs font-mono px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-brand focus:border-transparent w-full"
          />
        </div>
        
        <button
          @click="eliminarPuntoRuta(index)"
          class="text-gray-300 hover:text-red-500 transition-colors shrink-0 text-xs font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div v-if="puntos.length === 0" class="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
        Sin coordenadas capturadas. Activa la herramienta de <span class="font-bold text-brand">"Mapa"</span> para trazar con clicks.
      </div>
    </div>

    <div class="p-3 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-2">
      <button
        @click="$emit('borrar-trazo')"
        class="py-2 px-3.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors select-none cursor-pointer"
      >
        Borrar Todo
      </button>
      <button
        @click="listaPuntosVisible = !listaPuntosVisible"
        class="flex-1 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 select-none cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
          :class="listaPuntosVisible ? 'rotate-180' : ''"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
        </svg>
        {{ listaPuntosVisible ? 'Ocultar Listado' : 'Mostrar Listado' }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// Macro reactivo nativo de Vue 3.4+ para mapear bidireccionalmente el Array v-model
const puntos = defineModel({ type: Array, required: true })

defineProps({
  modoActivo: { type: String, default: null }
})

defineEmits(['toggle-modo', 'borrar-trazo'])

const listaPuntosVisible = ref(true)

const agregarPuntoManual = () => {
  // Al usar defineModel() podemos empujar directo al arreglo reactivo de forma limpia
  puntos.value.push({ lat: '', lng: '' })
}

const eliminarPuntoRuta = (index) => {
  puntos.value.splice(index, 1)
}
</script>