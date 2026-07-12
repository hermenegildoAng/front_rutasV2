<template>
  <div class="space-y-4">
    <div v-for="campo in camposGenerales" :key="campo.key">
      <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {{ campo.label }}
      </label>
      
      <select 
        v-if="campo.opciones" 
        v-model="form[campo.key]" 
        class="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-brand text-gray-900 cursor-pointer"
        required
      >
        <option value="">-- Selecciona una opción --</option>
        <option v-for="op in campo.opciones" :key="op.value" :value="op.value">
          {{ op.texto }}
        </option>
      </select>
      
      <input 
        v-else 
        v-model="form[campo.key]" 
        type="text"
        :placeholder="campo.placeholder"
        class="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-brand text-gray-900 font-medium"
        required
      />
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          Duración del Itinerario (min)
        </label>
        <input
          v-model.number="form.duracion_ruta"
          type="number"
          min="1"
          placeholder="Ej. 45"
          class="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-brand text-gray-900 font-medium"
          required
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          Tarifa Base Público
        </label>
        <div class="relative">
          <span class="absolute left-4 top-3 text-gray-400 text-sm font-bold">$</span>
          <input
            v-model.number="form.tarifa_base"
            type="number"
            step="0.50"
            min="0"
            placeholder="12.00"
            class="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-brand text-gray-900 font-mono"
            required
          />
        </div>
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        Divisa / Moneda Regulada
      </label>
      <select 
        v-model="form.moneda" 
        class="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-brand text-gray-900 font-medium"
      >
        <option value="MXN">MXN - Peso Mexicano</option>
      </select>
    </div>
  </div>
</template>

<script setup>
// Usamos el defineModel nativo de Vue 3 para evitar mutar props directamente
const form = defineModel({ type: Object, required: true })

// Configuración de campos alineados al estándar del estado y GTFS (route_type)
const camposGenerales = [
  { key: 'folio', label: 'Folio Interno de Ruta (SMyT)', placeholder: 'Ej. RUTA-HUA-05' },
  { key: 'nombre_corto', label: 'Nombre Corto / Identificador (route_short_name)', placeholder: 'Ej. R-10' },
  { key: 'nombre_largo', label: 'Nombre Largo Completo (route_long_name)', placeholder: 'Ej. Huamantla Centro - Ocotlán' },
  { 
    key: 'agencia', 
    label: 'Agencia / Operadora Concesionaria', 
    opciones: [
      { value: 'SMyT-COL-01', texto: 'Colectivos Urbanos de Tlaxcala' },
      { value: 'SMyT-FLE-02', texto: 'Flecha Azul Intermunicipal' }
    ] 
  },
  { 
    key: 'tipo_ruta', 
    label: 'Tipo de Servicio de Transporte (route_type)', 
    opciones: [
      { value: '3', texto: 'Autobús / Microbús (Terrestre convencional)' },
      { value: '3', texto: 'Colectivo / Combi local' }
    ] 
  },
]
</script>