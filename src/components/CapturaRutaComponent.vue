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
      v-if="modoActivo && !soloLectura"
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
          <h2 class="font-bold text-lg text-gray-800">{{ soloLectura ? 'Detalle de Ruta GTFS' : 'Estructurar Ruta GTFS' }}</h2>
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

      <fieldset :disabled="soloLectura" class="p-5 overflow-y-auto flex-1 space-y-5">
        <PasoGeneral v-if="pasoActual === 0" v-model="form" :errores="errores" />
        <PasoCalendarios v-if="pasoActual === 1" v-model="form" :errores="errores" />
        <PasoParadas
          v-if="pasoActual === 2" v-model="form" :errores="errores"
          :modo-activo="modoActivo"
          @toggle-modo="toggleModo"
          @actualizar-mapa="redibujarTodosLosMarcadoresParadas"
        />
      <PasoRegreso  v-if="pasoActual === 3"  v-model="form.viaje_regreso.tiene_viaje_regreso"/>
      </fieldset>

      <div class="p-5 border-t border-gray-100 bg-white/50 shrink-0">
        <p v-if="soloLectura" class="text-center text-xs font-bold uppercase tracking-wider text-gray-500">
          Vista de solo lectura
        </p>
        <!-- Botón de Siguiente (Visible en pasos 1, 2 y 3) -->
        <button 
          v-else-if="pasoActual < pasos.length - 1"
          @click="siguientePaso" 
          class="w-full py-3 rounded-2xl bg-gray-800 text-white font-bold uppercase tracking-wider text-xs hover:opacity-90 shadow-md transition-all active:scale-[0.99]"
        >
          Siguiente Paso ({{ pasoActual + 1 }}/{{ pasos.length }})
        </button>
        
        <!-- Botón de Guardar (Visible SOLO en el último paso) -->
        <button 
          v-else-if="!soloLectura"
          @click="handleGuardarRuta" 
          class="w-full py-3 rounded-2xl bg-brand text-white font-bold uppercase tracking-wider text-xs hover:opacity-90 shadow-md transition-all active:scale-[0.99]"
        >
          {{ esModoEdicion ? 'Actualizar Cambios' : 'Guardar Ruta' }}
        </button>
      </div>
    </div>

    <div class="absolute top-4 right-14 mr-8 z-20 w-72 flex flex-col gap-2">
      <!-- 🛠️ BOTÓN FLOTANTE PARA MOSTRAR HERRAMIENTAS (Cuando el panel está oculto) -->
        <button
          v-if="!soloLectura && !panelDerechoVisible"
          @click="panelDerechoVisible = true"
          type="button"
          class="absolute top-4 right-4 z-30 w-10 h-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-purple-700 hover:bg-purple-700 hover:text-white transition-all active:scale-95 cursor-pointer"
          title="Mostrar herramientas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
        </button>

        <!-- 📋 PANEL FLOTANTE DE HERRAMIENTAS (Cuando está visible) -->
        <div
          v-if="!soloLectura && panelDerechoVisible"
          class="absolute top-4 inset-x-4 md:left-auto md:right-4 z-20 w-auto md:w-80 lg:w-96 flex flex-col gap-2 max-h-[calc(100vh-120px)] transition-all duration-300"
        >
          <!-- Barra superior con botón ocultar -->
          <div class="flex items-center justify-between bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-purple-800 md:hidden">
              Herramientas de Ruta
            </span>
            <button
              @click="panelDerechoVisible = false"
              type="button"
              class="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all font-bold uppercase tracking-wider text-[10px] ml-auto cursor-pointer"
            >
              Ocultar ✕
            </button>
          </div>

          <!-- Componentes flotantes -->
          <BuscadorArchivoRuta @puntos-cargados="manejarPuntosDesdeArchivo" />

          <PanelPuntosRuta
            v-model="puntosRuta"
            :modo-activo="modoActivo"
            @toggle-modo="toggleModo"
            @borrar-trazo="borrarTrazo"
            class="overflow-y-auto flex-1 max-h-[50vh] md:max-h-[60vh] rounded-2xl"
          />
          
        </div>
    </div>

  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BuscadorArchivoRuta from './rutas/BuscadorArchivoRuta.vue'
import PanelPuntosRuta from './rutas/PanelPuntosRuta.vue'
import PasoGeneral from './rutas/pasos/PasoGeneral.vue'
import PasoCalendarios from './rutas/pasos/PasoCalendarios.vue'
import PasoParadas from './rutas/pasos/PasoParadas.vue'
import PasoRegreso from './rutas/pasos/PasoRegreso.vue'
import { useRouter } from 'vue-router'; 
import { useToast } from 'vue-toastification';
import { useRutaValidation } from '../composables/useRutaValidation'

const emit = defineEmits(['rutaGuardada']);
const {
  errores,
  validarPaso0,
  validarPasoHorarios,
  validarPasoParadas,
  validarVelocidadFinal,
  limpiarErrores,
} = useRutaValidation()
const router = useRouter();
const toast = useToast();
// ========================= CONFIGURACIÓN DE ICONOS =========================
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


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
const props = defineProps({
  rutaPrecargada: {
    type: Object,
    default: null
  },
  soloLectura: {
    type: Boolean,
    default: false,
  }
})


const mapContainer = ref(null)
let map = null
const mapaCargando = ref(true)
const esModoEdicion = ref(false)

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
  route_id: '',
  route_short_name: '',
  route_long_name: '',
  agency_id: '',
  route_type: '',
  duracion_ruta: null,
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
//========================== FUncion edicion de ruta =========================
const cargarDatosParaEdicion = async (idRuta) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/maps/rutas-gtfs/${idRuta}/detalle/`) 
    const data = response.data.data 
    
    
    form.value.route_id = data.route_id || ''
    form.value.route_short_name = data.route_short_name || ''
    form.value.route_long_name = data.route_long_name || ''
    form.value.agency_id = data.agency || '' 
    form.value.route_type = data.route_type || 3
    
    
    if (data.paradas_asociadas) {
      form.value.paradas = data.paradas_asociadas.map((p, index) => ({
        folio_parada: p.stop_id,
        nombre_parada: p.stop_name,
        latitud: p.latitud, 
        longitud: p.longitud,
        orden_parada: index + 1,
        _colapsado: true 
      }))
    }

    

    if (data.trazados && data.trazados.length > 0) {
      const trazadoPrincipal = data.trazados[0]
      form.value.duracion_ruta = trazadoPrincipal.duracion_estimada_min || 30

      const coordenadas = trazadoPrincipal.geometria.coordinates 
      
      
      puntosRuta.value = coordenadas.map(c => ({
        lat: c[1].toFixed(6),
        lng: c[0].toFixed(6)
      }))
    }

   
    if (data.calendarios) {
      form.value.calendarios = data.calendarios
    }

   
    if (data.viaje_regreso) {
      form.value.viaje_regreso.tiene_viaje_regreso = Boolean(data.viaje_regreso.tiene_viaje_regreso);
      form.value.viaje_regreso.mismas_paradas = Boolean(data.viaje_regreso.mismas_paradas);
    }


    if (puntosRuta.value.length > 0) {
      redibujarRuta()
      const primerPunto = puntosRuta.value[0]
      const latitud = parseFloat(primerPunto.lat)
      const longitud = parseFloat(primerPunto.lng)
      if (map && Number.isFinite(latitud) && Number.isFinite(longitud)) {
        // Sólo mueve el centro: conserva exactamente el nivel de zoom inicial.
        map.panTo([latitud, longitud], { animate: false })
      }
    }

    toast.success('¡Datos cargados correctamente!')
  } catch (error) {
    console.error('Error:', error)
    toast.error('Error al cargar los detalles.')
  }
}

// ========================= WATCHERS =========================
watch(
  puntosRuta,
  () => {
    redibujarRuta()
  },
  { deep: true }
)

watch(
  () => form.value.paradas,
  () => {
    redibujarTodosLosMarcadoresParadas()
  },
  { deep: true }
)
// ========================= toogle Modo =========================

const toggleModo = (modo) => {
  if (modoActivo.value === modo) {
    modoActivo.value = null 
  } else {
    modoActivo.value = modo 
  }

  
  if (map) {
    const container = map.getContainer()
    if (modoActivo.value) {
      container.style.cursor = 'crosshair' 
    } else {
      container.style.cursor = 'grab'
    }
  }
}

// ========================= FLUJO DEL ASISTENTE =========================
const siguientePaso = () => {
  if (props.soloLectura) {
    if (pasoActual.value < pasos.length - 1) pasoActual.value++
    return
  }

  if (pasoActual.value === 0) {
    if (!validarPaso0(form.value)) return
  }

  if (pasoActual.value === 1) {
    if (!validarPasoHorarios(form.value)) return
  }

  if (pasoActual.value === 2) {
    // AQUÍ ESTÁ EL TRUCO: Le pasamos el form Y los puntos del trazado del mapa
    if (!validarPasoParadas(form.value, puntosRuta.value)) return 
  }

  if (pasoActual.value < pasos.length - 1) {
    limpiarErrores()
    pasoActual.value++
  }
}

const anteriorPaso = () => {
  if (pasoActual.value > 0) {
    limpiarErrores()
    pasoActual.value--
  }
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
    if (props.soloLectura) return
    const { lat, lng } = e.latlng
    if (modoActivo.value === 'trazar') {
      puntosRuta.value.push({ lat: lat.toFixed(6), lng: lng.toFixed(6) })
    } else if (modoActivo.value === 'parada') {
      agregarParadaDesdeMapa(lat.toFixed(6), lng.toFixed(6))
      pasoActual.value = 2 // Forzar el foco al paso de paradas
    }
  })

  setTimeout(() => { mapaCargando.value = false }, 800)

  if (props.rutaPrecargada && props.rutaPrecargada.id) {
    esModoEdicion.value = true
    cargarDatosParaEdicion(props.rutaPrecargada.id)
  }

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
  
  
  // Validar Paso 1: Información General
  if (!validarPaso0(form.value)) {
    pasoActual.value = 0 
    alert('Por favor corrige los campos obligatorios del Paso 1 antes de guardar.')
    return
  }

  // Validar Paso 2: Calendarios y Horarios
  if (!validarPasoHorarios(form.value)) {
    pasoActual.value = 1 
    alert('Por favor completa la configuración de horarios en el Paso 2.')
    return
  }

  // Validar Paso 3: Trazado y Paradas
  if (!validarPasoParadas(form.value, puntosRuta.value)) {
    pasoActual.value = 2 
    alert('Asegúrate de trazar la ruta y colocar al menos 2 paradas en el Paso 3.')
    return
  }

  const validacionVelocidad = validarVelocidadFinal(form.value, puntosRuta.value)
  if (!validacionVelocidad.esValida) {
    const detalleTramo = validacionVelocidad.excedeTramo
      ? `\nTramo más rápido: ${validacionVelocidad.tramoMasRapido.origen} → ${validacionVelocidad.tramoMasRapido.destino} (${validacionVelocidad.tramoMasRapido.velocidadKmh.toFixed(1)} km/h).`
      : ''
    const detalleCalculo = validacionVelocidad.distanciaShapeKm != null
      ? `\nDistancia del shape: ${validacionVelocidad.distanciaShapeKm.toFixed(2)} km.\nDuración capturada: ${validacionVelocidad.duracionMinutos} min.\nVelocidad promedio: ${validacionVelocidad.velocidadPromedioKmh.toFixed(1)} km/h.\nUmbral GTFS: ${validacionVelocidad.limiteKmh} km/h.${detalleTramo}\n\nAumenta la duración al menos a ${validacionVelocidad.duracionMinimaRecomendada} minutos o corrige el shape y las paradas.`
      : `\n${validacionVelocidad.mensaje}`

    window.alert(
      `No se puede guardar la ruta porque la velocidad calculada es demasiado alta para la validación GTFS.${detalleCalculo}`
    )
    pasoActual.value = 0
    return
  }

  
  
  const tieneRegresoActivo = Boolean(form.value.tieneRegreso || form.value.viaje_regreso?.tiene_viaje_regreso)

  
  const paradasIdaFormatted = (form.value.paradas || []).map((p, idx) => ({
    folio_parada: String(p.folio_parada).trim(),
    nombre_parada: String(p.nombre_parada).trim(),
    latitud: parseFloat(p.latitud),
    longitud: parseFloat(p.longitud),
    orden_parada: idx + 1
  }))

  // Generar Paradas de Regreso si aplica (Invertir secuencia)
  const paradasRegresoFormatted = tieneRegresoActivo
    ? [...paradasIdaFormatted].reverse().map((p, idx) => ({
        ...p,
        orden_parada: idx + 1
      }))
    : []

  // Formatear Geometría del Trazado (LineString GeoJSON + Coordenadas numéricas)
  const coordsValidas = puntosRuta.value
    .filter((p) => p.lat && p.lng && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)))
    .map((p) => [parseFloat(p.lng), parseFloat(p.lat)]) 

  
  const { tieneRegreso, viaje_regreso, ...restoForm } = form.value

  const payload = {
    ...restoForm,
    
    route_type: parseInt(restoForm.route_type, 10),
    duracion_ruta: parseInt(restoForm.duracion_ruta, 10),
    
    agency: restoForm.agency_id,
    paradas: paradasIdaFormatted,

    
    geometria_linea: {
      type: 'LineString',
      coordinates: coordsValidas
    },

    viaje_regreso: {
      tiene_viaje_regreso: Boolean(tieneRegresoActivo),
      mismos_horarios: true,
      mismas_paradas: true,
      paradas: tieneRegresoActivo ? paradasRegresoFormatted : []
    }
  }

  console.log('Payload Estructura GTFS Limpio y Listo:', JSON.stringify(payload, null, 2))
  
  const guardarRutaGTFS = async (payloadJSON) => {
    try {

      let response 

      if (esModoEdicion.value) {
        // === MODO EDICIÓN (PUT) ===
        const idRuta = props.rutaPrecargada.id
        response = await axios.put(`http://localhost:8000/api/maps/rutas-gtfs/${idRuta}/`, payloadJSON, {
          headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${token}` // Descomenta si usas JWT
          }
        });
        
        toast.success('¡Ruta actualizada exitosamente!')
      } else {
        // === MODO CREACIÓN (POST) ===
        response = await axios.post('http://localhost:8000/api/maps/rutas-gtfs/', payloadJSON, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}` // Descomenta si usas JWT
            }
        });
        
        toast.success('¡Ruta creada exitosamente!')
      }
        
        
        
       
        toast.success(response.data?.data?.mensaje || '¡Ruta guardada exitosamente en el sistema GTFS!');
        
        console.log('¡Éxito! Ruta registrada en la base de datos:', response.data);
        
    
        emit('rutaGuardada', 'rutas');
        
    } catch (error) {
        
        if (error.response) {
            
            console.error('Error de validación en Django:', error.response.data);
            alert('Django rechazó los datos. Revisa la consola para ver qué campo falló.');
            
        } else if (error.request) {
          
            console.error('El servidor no responde:', error.request);
            alert('Error de red. No se pudo contactar al servidor de Django.');
            
        } else {
           
            console.error('Error al armar la petición:', error.message);
        }
    }
  }
  
  guardarRutaGTFS(payload);
}
</script>
