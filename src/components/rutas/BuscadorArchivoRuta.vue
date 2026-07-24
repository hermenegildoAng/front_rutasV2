<template>
  <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <span class="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"/>
        Cargar Trazo o Paquete GTFS
      </h3>
    </div>

    <div
      @dragover.prevent="esArrastrando = true"
      @dragleave.prevent="esArrastrando = false"
      @drop.prevent="onDropArchivo"
      @click="$refs.inputArchivo.click()"
      :class="[
        'border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-27.5q',
        esArrastrando ? 'border-brand bg-purple-50/50 scale-[0.99]' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50/50'
      ]"
    >
      <input
        ref="inputArchivo"
        type="file"
        class="hidden"
        accept=".geojson,.json,.gpx,.kml,.zip"
        @change="onArchivoSeleccionado"
      />

      <template v-if="!archivoSeleccionado && !archivoCargando">
        <div class="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-brand">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-700">Suelte su archivo aquí o explore</p>
          <p class="text-[10px] text-gray-400 mt-0.5">Formatos: GTFS (.zip), GeoJSON, GPX, KML</p>
        </div>
      </template>
      
      <template v-else-if="archivv">
         
      </template>

      <template v-else-if="archivoCargando">
        <div class="w-6 h-6 border-2 border-purple-200 border-t-brand rounded-full animate-spin"/>
        <p class="text-xs font-medium text-gray-500">Procesando paquete geométrico...</p>
      </template>

      <template v-else>
        <div class="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-brand">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div class="max-w-45 truncate">
          <p class="text-xs font-bold text-gray-800 truncate">{{ archivoSeleccionado.name }}</p>
          <p class="text-[10px]" :class="archivoValido ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'">
            {{ archivoValido ? 'Paquete listo para procesar' : 'Formato no soportado' }}
          </p>
        </div>
      </template>
    </div>

    

    <div v-if="archivoSeleccionado && archivoValido && !archivoCargando" class="flex gap-2">
      <button
        @click.stop="limpiarArchivo"
        class="flex-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
      >
        Cancelar
      </button>
      <button
        @click.stop="procesarArchivo"
        class="flex-1 px-3 py-1.5 bg-brand hover:opacity-90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
      >
        Interpolar
      </button>
    </div>

    <div
      v-if="archivoResultado"
      :class="[
        'p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 border',
        archivoResultado.ok ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
      ]"
    >
      <span>{{ archivoResultado.mensaje }}</span>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLectorRutas } from '@/composables/useLectorRutas'

const emit = defineEmits(['puntos-cargados'])

const esArrastrando = ref(false)

const {
  archivoSeleccionado,
  archivoValido,
  archivoCargando,
  archivoResultado,
  limpiarArchivo,
  procesarArchivo
} = useLectorRutas((puntos) => {
  // Dispara los nodos limpios extraídos al mapa de Leaflet en el componente padre
  emit('puntos-cargados', puntos)
})

// Validación agregando explícitamente la extensión del empaquetado zip de Google
const validarExtension = (nombre) => {
  const ext = '.' + nombre.split('.').pop().toLowerCase()
  return ['.geojson', '.json', '.gpx', '.kml', '.zip'].includes(ext)
}

const onArchivoSeleccionado = (e) => {
  const file = e.target.files[0]
  if (!file) return
  archivoSeleccionado.value = file
  archivoValido.value = validarExtension(file.name)
}

const onDropArchivo = (e) => {
  esArrastrando.value = false
  const file = e.dataTransfer.files[0]
  if (!file) return
  archivoSeleccionado.value = file
  archivoValido.value = validarExtension(file.name)

  
}
</script>
