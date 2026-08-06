<!-- PasoGeneral.vue -->
<template>
  <div class="space-y-4">
    <div v-for="campo in camposGenerales" :key="campo.key">
      <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {{ campo.label }}
      </label>
      
      <!-- Select dinámico -->
      <div v-if="campo.opciones">
        <select 
          v-model="form[campo.key]" 
          class="w-full px-4 py-3 rounded-2xl border bg-white text-sm outline-none transition-all duration-200 cursor-pointer"
          :class="errores[campo.key] ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50/20' : 'border-gray-200 focus:ring-2 focus:ring-brand text-gray-900'"
        >
          <option value="">-- Selecciona una opción --</option>
          <option v-for="op in campo.opciones" :key="op.value" :value="op.value">
            {{ op.texto }}
          </option>
        </select>
        <p v-if="errores[campo.key]" class="text-xs text-red-500 mt-1 font-medium pl-1">
          {{ errores[campo.key] }}
        </p>
      </div>
      
      <!-- Input de texto -->
      <div v-else>
        <input 
          v-model="form[campo.key]" 
          type="text"
          :placeholder="campo.placeholder"
          class="w-full px-4 py-3 rounded-2xl border bg-white text-sm outline-none transition-all duration-200 font-medium"
          :class="errores[campo.key] ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50/20' : 'border-gray-200 focus:ring-2 focus:ring-brand text-gray-900'"
        />
        <p v-if="errores[campo.key]" class="text-xs text-red-500 mt-1 font-medium pl-1">
          {{ errores[campo.key] }}
        </p>
      </div>
    </div>
    
    <!-- Campo de Duración de Ruta (minutos) -->
    <div>
      <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        Duración Estimada del Viaje (minutos)
      </label>
      <input
        v-model.number="form.duracion_ruta"
        type="number"
        min="1"
        placeholder="Ej. 45"
        class="w-full px-4 py-3 rounded-2xl border bg-white text-sm outline-none transition-all duration-200 font-medium"
        :class="errores.duracion_ruta ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50/20' : 'border-gray-200 focus:ring-2 focus:ring-brand text-gray-900'"
      />
      <p v-if="errores.duracion_ruta" class="text-xs text-red-500 mt-1 font-medium pl-1">
        {{ errores.duracion_ruta }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAgencias } from '@/composables/useAgencias'

const form = defineModel({ type: Object, required: true })

// Prop para recibir los errores desde el componente padre
defineProps({
  errores: {
    type: Object,
    default: () => ({})
  }
})

const { agencias, obtenerAgencias } = useAgencias()

const camposGenerales = ref([
  { key: 'route_id', label: 'Folio Interno de Ruta (SMyT)', placeholder: 'Ej. RUTA-HUA-05' },
  { key: 'route_short_name', label: 'Nombre Corto / Identificador (route_short_name)', placeholder: 'Ej. R-10' },
  { key: 'route_long_name', label: 'Nombre Largo Completo (route_long_name)', placeholder: 'Ej. Huamantla Centro - Ocotlán' },
  { key: 'agency_id', label: 'Agencia / Operadora Concesionaria', opciones: [] },
  { 
    key: 'route_type', 
    label: 'Tipo de Servicio de Transporte (route_type)', 
    opciones: [
      { value: '3', texto: 'Autobús / Microbús / Colectivo (Terrestre convencional)' }
    ] 
  },
])

const cargarAgenciasYFormatear = async () => {
  await obtenerAgencias()
  const opcionesAgencias = agencias.value.map(agencia => ({
    value: agencia.agency_id,
    texto: `${agencia.agency_name} (${agencia.agency_id})`
  }))

  const campoAgencia = camposGenerales.value.find(c => c.key === 'agency_id')
  if (campoAgencia) {
    campoAgencia.opciones = opcionesAgencias
  }
}

onMounted(() => {
  cargarAgenciasYFormatear()
})
</script>