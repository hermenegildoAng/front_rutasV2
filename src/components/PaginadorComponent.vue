<template>
  <div
    v-if="totalPaginas > 1"
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100"
    aria-label="Paginación"
  >
    <p class="text-[11px] font-medium text-gray-400 text-center sm:text-left">
      Mostrando <span class="font-bold text-gray-600">{{ inicio }}</span>–<span class="font-bold text-gray-600">{{ fin }}</span>
      de <span class="font-bold text-gray-600">{{ total }}</span> registros
    </p>

    <div class="flex items-center justify-center gap-1">
      <button
        type="button"
        :disabled="modelValue <= 1"
        class="boton-pagina px-2.5"
        aria-label="Página anterior"
        @click="cambiarPagina(modelValue - 1)"
      >
        ‹
      </button>

      <button
        v-for="pagina in paginasVisibles"
        :key="pagina"
        type="button"
        :aria-label="`Ir a la página ${pagina}`"
        :aria-current="pagina === modelValue ? 'page' : undefined"
        :class="pagina === modelValue ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand hover:text-brand'"
        class="boton-pagina"
        @click="cambiarPagina(pagina)"
      >
        {{ pagina }}
      </button>

      <button
        type="button"
        :disabled="modelValue >= totalPaginas"
        class="boton-pagina px-2.5"
        aria-label="Página siguiente"
        @click="cambiarPagina(modelValue + 1)"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  total: { type: Number, required: true },
  porPagina: { type: Number, default: 6 },
})

const emit = defineEmits(['update:modelValue'])

const totalPaginas = computed(() => Math.max(1, Math.ceil(props.total / props.porPagina)))
const inicio = computed(() => props.total === 0 ? 0 : ((props.modelValue - 1) * props.porPagina) + 1)
const fin = computed(() => Math.min(props.modelValue * props.porPagina, props.total))

const paginasVisibles = computed(() => {
  const cantidad = Math.min(5, totalPaginas.value)
  let primera = Math.max(1, props.modelValue - Math.floor(cantidad / 2))
  primera = Math.min(primera, totalPaginas.value - cantidad + 1)
  return Array.from({ length: cantidad }, (_, indice) => primera + indice)
})

const cambiarPagina = (pagina) => {
  const paginaValida = Math.min(Math.max(1, pagina), totalPaginas.value)
  if (paginaValida !== props.modelValue) emit('update:modelValue', paginaValida)
}

watch(totalPaginas, (cantidad) => {
  if (props.modelValue > cantidad) emit('update:modelValue', cantidad)
})
</script>

<style scoped>
.boton-pagina {
  min-width: 2rem;
  height: 2rem;
  border-width: 1px;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  transition: 150ms ease;
}

.boton-pagina:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}
</style>
