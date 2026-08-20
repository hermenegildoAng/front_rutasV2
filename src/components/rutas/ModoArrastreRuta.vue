<template>
  <div class="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg p-3 space-y-2.5">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Ajustar posiciones</h3>
        <p class="text-[10px] text-gray-400 mt-0.5">
          {{ totalElementos }} {{ totalElementos === 1 ? 'elemento disponible' : 'elementos disponibles' }}
        </p>
      </div>

      <button
        type="button"
        :disabled="totalElementos === 0"
        :class="activo ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'"
        class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        @click="$emit('toggle')"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9l-3 3 3 3m4-10l3-3 3 3m0 14l-3 3-3-3m10-4l3-3-3-3M2 12h20M12 2v20" />
        </svg>
        {{ activo ? 'Finalizar ajuste' : 'Mover puntos' }}
      </button>
    </div>

    <p
      v-if="activo"
      class="text-[10px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-2"
    >
      Mantén presionado un punto morado o una parada y arrástralo. Las coordenadas y el recorrido se actualizarán al soltarlo.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activo: { type: Boolean, default: false },
  cantidadPuntos: { type: Number, default: 0 },
  cantidadParadas: { type: Number, default: 0 },
})

defineEmits(['toggle'])

const totalElementos = computed(() => props.cantidadPuntos + props.cantidadParadas)
</script>
