<template>
  <div class="relative w-full h-[calc(100vh-90px)] overflow-hidden rounded-2xl">

    <div class="absolute inset-0 z-0">
      <div class="w-full h-full bg-[#e5e3df] relative overflow-hidden">
        <div ref="mapContainer" class="w-full h-full cursor-crosshair"></div>

        <div v-if="mapaCargando" class="absolute inset-0 z-40 bg-white/90 flex flex-col items-center justify-center">
          <div class="w-10 h-10 border-4 border-gray-200 border-t-brand rounded-full animate-spin"/>
          <p class="text-sm mt-4 text-gray-500 font-medium">Cargando mapa cartográfico...</p>
        </div>
      </div>
    </div>

    <div
      v-if="modoActivo"
      class="absolute bottom-6 right-6 z-40 bg-brand text-white text-xs px-4 py-2 rounded-xl shadow-lg font-bold uppercase tracking-wider flex items-center gap-2"
    >
      {{ modoActivo === 'trazar' ? 'Modo Trazo: Click para agregar puntos' : 'Modo Parada: Click para colocar parada' }}
      <button @click="activarModo(null)" class="opacity-70 hover:opacity-100 font-bold ml-1">✕</button>
    </div>

    <button
      v-if="!formularioVisible"
      @click="formularioVisible = true"
      class="absolute top-4 left-4 z-30 w-10 h-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-all active:scale-95"
      title="Mostrar formulario"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"/>
      </svg>
    </button>

    <div
      v-if="formularioVisible"
      class="absolute top-4 left-4 z-30 w-105 max-w-[95vw] max-h-[calc(100vh-122px)] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 overflow-hidden flex flex-col"
    >
      <div class="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h2 class="font-bold text-lg text-gray-800">Estructurar Ruta GTFS</h2>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Paso {{ pasoActual + 1 }} de {{ pasos.length }}</p>
        </div>
        <div class="flex gap-2 items-center">
          <button @click="anteriorPaso" :disabled="pasoActual === 0" class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm font-bold transition-all">←</button>
          <button @click="siguientePaso" :disabled="pasoActual === pasos.length - 1" class="w-9 h-9 rounded-xl bg-brand text-white hover:opacity-90 disabled:opacity-40 text-sm font-bold transition-all">→</button>
          <button @click="formularioVisible = false" class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all" title="Ocultar formulario">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-5 overflow-y-auto flex-1 space-y-5">
        <PasoGeneral v-if="pasoActual === 0" v-model="form" />
        <PasoCalendarios v-if="pasoActual === 1" v-model="form" />
        <PasoParadas v-if="pasoActual === 2" v-model="form" :modo-activo="modoActivo" @toggle-modo="activarModo" @actualizar-mapa="redibujarTodosLosMarcadoresParadas" />
        <PasoRegreso v-if="pasoActual === 3" v-model="form" />
      </div>

      <div class="p-5 border-t border-gray-100 bg-white/50 shrink-0">
        <button @click="handleGuardarRuta" class="w-full py-3 rounded-2xl bg-brand text-white font-bold uppercase tracking-wider text-xs hover:opacity-90 shadow-md transition-all active:scale-[0.99]">
          Guardar Configuración de Ruta
        </button>
      </div>
    </div>

    <div class="absolute top-4 right-14 mr-8 z-20 w-72 flex flex-col gap-2">
      <button
        v-if="!panelDerechoVisible"
        @click="panelDerechoVisible = true"
        class="absolute top-4 right-4 z-30 w-10 h-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-all active:scale-95"
        title="Mostrar herramientas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
      </button>

      <div
        v-if="panelDerechoVisible"
        class="absolute top-4 right-4 z-20 w-72 flex flex-col gap-2 max-h-[calc(100vh-122px)]"
      >
        <div class="flex justify-end bg-white/85 backdrop-blur-md p-1 rounded-xl border border-gray-100/50 shadow-sm">
          <button
            @click="panelDerechoVisible = false"
            class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all font-bold uppercase tracking-wider text-[10px]"
          >
            Ocultar herramientas ✕
          </button>
        </div>

        <BuscadorArchivoRuta @puntos-cargados="manejarPuntosDesdeArchivo" />

        <PanelPuntosRuta
          v-model="puntosRuta"
          :modo-activo="modoActivo"
          @toggle-modo="activarModo"
          @borrar-trazo="borrarTrazo"
          class="overflow-y-auto flex-1"
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BuscadorArchivoRuta from './rutas/BuscadorArchivoRuta.vue'
import PanelPuntosRuta from './rutas/PanelPuntosRuta.vue'
import PasoGeneral from './rutas/pasos/PasoGeneral.vue'
import PasoCalendarios from './rutas/pasos/PasoCalendarios.vue'
import PasoParadas from './rutas/pasos/PasoParadas.vue'
import PasoRegreso from './rutas/pasos/PasoRegreso.vue'

// ========================= CONFIGURACIÓN DE ICONOS =========================
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Icono personalizado para paradas usando la estética del SMyT (Alineado a tu color corporativo)
const iconoParada = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b21a8" width="32" height="32">
    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.5-4.512 3.5-7.327a8 8 0 10-16 0c0 2.815 1.556 5.314 3.5 7.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
  </svg>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// ========================= ESTADO REACTIVO =========================
const mapContainer = ref(null)
let map = null
const mapaCargando = ref(true)

const pasoActual = ref(0)
const pasos = ['general', 'calendarios', 'paradas', 'viaje_regreso']
const modoActivo = ref(null)
const formularioVisible = ref(true)
const panelDerechoVisible = ref(true)

// Instancias de Capas de Leaflet
let polylineRuta = null
let marcadoresParadas = []
let marcadoresPuntos = []

const puntosRuta = ref([])

// Formulario reactivo completo integrado con las tarifas bases
const form = ref({
  folio: '',
  nombre_corto: '',
  nombre_largo: '',
  agencia: '',
  tipo_ruta: '',
  duracion_ruta: null,
  tarifa_base: null,
  moneda: 'MXN',
  calendarios: [],
  paradas: [],
  viaje_regreso: {
    tiene_viaje_regreso: false,
    mismos_horarios: true,
    calendarios: [],
    mismas_paradas: true,
    paradas: [],
  },
})

// ========================= WATCHERS =========================
watch(puntosRuta, () => { redibujarRuta() }, { deep: true })

// ========================= FLUJO DEL ASISTENTE =========================
const siguientePaso = () => { if (pasoActual.value < pasos.length - 1) pasoActual.value++ }
const anteriorPaso  = () => { if (pasoActual.value > 0) pasoActual.value-- }

const activarModo = (modo) => {
  modoActivo.value = modoActivo.value === modo ? null : modo
  if (map) map.getContainer().style.cursor = modoActivo.value ? 'crosshair' : 'grab'
}

// ========================= MÓDULO CARTOGRÁFICO DE LEAFLET =========================
onMounted(() => {
  // Inicialización centrada en el estado de Tlaxcala
  map = L.map(mapContainer.value, { zoomControl: false }).setView([19.3139, -98.2404], 13)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    if (modoActivo.value === 'trazar') {
      puntosRuta.value.push({ lat: lat.toFixed(6), lng: lng.toFixed(6) })
    } else if (modoActivo.value === 'parada') {
      agregarParadaDesdeMapa(lat.toFixed(6), lng.toFixed(6))
      pasoActual.value = 2 // Forzar el foco al paso de paradas
    }
  })

  setTimeout(() => { mapaCargando.value = false }, 800)
})

onBeforeUnmount(() => { if (map) map.remove() })

const redibujarRuta = () => {
  if (polylineRuta) { map.removeLayer(polylineRuta); polylineRuta = null }
  marcadoresPuntos.forEach((m) => map.removeLayer(m))
  marcadoresPuntos = []

  const coords = puntosRuta.value
    .filter((p) => p.lat !== '' && p.lng !== '' && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)))
    .map((p) => [parseFloat(p.lat), parseFloat(p.lng)])

  if (coords.length < 2) return

  // Trazado de línea geométrica principal
  polylineRuta = L.polyline(coords, { color: '#6b21a8', weight: 4, opacity: 0.85, lineJoin: 'round', lineCap: 'round' }).addTo(map)

  coords.forEach(([lat, lng], i) => {
    const m = L.circleMarker([lat, lng], { radius: 5, fillColor: '#6b21a8', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map)
    m.bindTooltip(`Punto ${i + 1}`, { permanent: false, direction: 'top' })
    marcadoresPuntos.push(m)
  })
}

const borrarTrazo = () => {
  if (polylineRuta) { map.removeLayer(polylineRuta); polylineRuta = null }
  marcadoresPuntos.forEach((m) => map.removeLayer(m))
  marcadoresPuntos = []
  puntosRuta.value = []
  modoActivo.value = null
  if (map) map.getContainer().style.cursor = 'grab'
}

// ========================= CONTROL CARTOGRÁFICO DE PARADAS =========================
const limpiarTodosLosMarcadoresParada = () => {
  marcadoresParadas.forEach((m) => { if (m) map.removeLayer(m) })
  marcadoresParadas = []
}

const redibujarTodosLosMarcadoresParadas = () => {
  limpiarTodosLosMarcadoresParada()
  form.value.paradas.forEach((parada, i) => {
    const lat = parseFloat(parada.latitud)
    const lng = parseFloat(parada.longitud)
    if (!isNaN(lat) && !isNaN(lng)) {
      const marcador = L.marker([lat, lng], { icon: iconoParada }).addTo(map)
        .bindPopup(`<b>${parada.nombre_parada || 'Parada ' + (i + 1)}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
      marcadoresParadas[i] = marcador
    }
  })
}

const agregarParadaDesdeMapa = (lat = '', lng = '') => {
  const orden = form.value.paradas.length + 1
  form.value.paradas.push({ folio_parada: '', nombre_parada: `Parada ${orden}`, latitud: lat, longitud: lng, orden_parada: orden })

  if (lat && lng) {
    redibujarTodosLosMarcadoresParadas()
    map.panTo([parseFloat(lat), parseFloat(lng)])
  }
}

const manejarPuntosDesdeArchivo = (puntos) => {
  puntosRuta.value = puntos
  const coords = puntos.map(p => [parseFloat(p.lat), parseFloat(p.lng)])
  if (map && coords.length > 0) {
    map.fitBounds(L.latLngBounds(coords), { padding: [32, 32] })
  }
}

// ========================= PROCESAMIENTO GENERAL FINAL =========================
const handleGuardarRuta = () => {
  const { viaje_regreso, ...restoForm } = form.value

  const payload = {
    ...restoForm,
    geometria_linea: puntosRuta.value.filter((p) => p.lat && p.lng),
    viaje_regreso: viaje_regreso.tiene_viaje_regreso
      ? {
          tiene_viaje_regreso: true,
          mismos_horarios: viaje_regreso.mismos_horarios,
          calendarios: viaje_regreso.mismos_horarios ? form.value.calendarios : viaje_regreso.calendarios,
          mismas_paradas: viaje_regreso.mismas_paradas,
          paradas: viaje_regreso.mismas_paradas ? form.value.paradas : viaje_regreso.paradas,
        }
      : { tiene_viaje_regreso: false },
  }

  console.log('Payload Estructura GTFS Completo:', payload)
  alert('¡Configuración de ruta e historial geométrico compilados correctamente!')
}
</script>