<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="tituloId"
      @click.self="cancelar"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
        <div class="flex items-center gap-3 text-red-600">
          <div class="p-2.5 bg-red-100 rounded-xl shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 :id="tituloId" class="font-bold text-gray-900 text-base">{{ titulo }}</h3>
            <p class="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
          </div>
        </div>

        <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 leading-relaxed">
          <slot />
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            :disabled="cargando"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            @click="cancelar"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="cargando"
            class="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            @click="confirmar"
          >
            {{ cargando ? 'Eliminando...' : textoConfirmar }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  titulo: { type: String, default: '¿Eliminar registro?' },
  textoConfirmar: { type: String, default: 'Sí, eliminar' },
  cargando: { type: Boolean, default: false },
  tituloId: { type: String, default: 'titulo-confirmacion-eliminar' },
})

const emit = defineEmits(['cancelar', 'confirmar'])

const cancelar = () => {
  if (!props.cargando) emit('cancelar')
}

const confirmar = () => {
  if (!props.cargando) emit('confirmar')
}
</script>
