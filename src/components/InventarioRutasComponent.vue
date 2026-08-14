<template>
  <div class="space-y-6">
    <!-- Cabecera y Buscador -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      
      <!-- Título -->
      <div>
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider text-brand">
          Rutas Registradas en el Sistema
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">Inventario general de mapeo</p>
      </div>

      <!-- Controles: Buscador y Botón -->
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        
        <!-- Buscador -->
        <div class="w-full sm:w-64">
          <input
            type="text"
            v-model="busqueda"
            placeholder="Buscar por nombre o código..."
            class="border border-gray-200 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
          />
        </div>

        <!-- Botón Descargar GTFS -->
        <button 
          v-if="rol === 'admin'"
          @click="descargarGTFS" 
          :disabled="descargandoGTFS"
          class="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"  
        >
          <!-- Spinner cargando -->
          <svg v-if="descargandoGTFS" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <!-- Icono de descarga -->
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          
          {{ descargandoGTFS ? 'Generando ZIP...' : 'Exportar GTFS' }}
        </button>
        
      </div>
    </div>

    <!-- Vista Exclusiva de Cards (Grid Responsivo) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="ruta in rutasPaginadas"
        :key="'ruta-card-' + ruta.id"
        class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            
            
            <span class="text-xs font-extrabold text-brand block uppercase tracking-wide">
              {{ ruta.codigo }}
            </span>
            
            <span class="font-bold text-gray-900 text-sm block mt-1">{{ ruta.nombre }}</span>

            <span class="font-mono font-bold text-brand bg-purple-100/70 px-2 py-0.5 rounded text-[10px] tracking-wide">
                {{ ruta.agency_id }}
              </span>
          </div>

          
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
            {{ ruta.numeroParadas }} {{ ruta.numeroParadas === 1 ? 'parada' : 'paradas' }}
          </span>
          <span
            v-for="shape in ruta.trazados"
            :key="shape.shape_id || shape.direccion"
            class="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700"
          >
            Shape {{ shape.direccion_label?.toLowerCase() || 'sin dirección' }}: {{ formatearDistancia(shape.distancia_km) }}
          </span>
          <span
            v-if="ruta.trazados.length === 0"
            class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500"
          >
            Shape sin distancia disponible
          </span>
        </div>

        <div class="flex items-center justify-end pt-3 border-t border-gray-50 gap-2">
          <button
            @click="$emit('editarRuta', ruta)"
            class="px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold rounded-lg transition-all"
          >
            {{ rol === 'admin' ? 'Ver detalles' : 'Editar' }}
          </button>
          <button
            v-if="rol === 'capturador'"
            @click="prepararEliminacion(ruta)"
            class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>

      <!-- Estado vacío si no hay rutas -->
      <div v-if="rutasFiltradas.length === 0" class="col-span-full text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
        <p class="text-gray-500 font-medium">No se encontraron rutas con ese criterio.</p>
      </div>
    </div>

    <PaginadorComponent
      v-model="paginaActual"
      :total="rutasFiltradas.length"
      :por-pagina="RUTAS_POR_PAGINA"
    />

    <ConfirmacionEliminarComponent
      :model-value="mostrarModalEliminar"
      titulo="¿Eliminar ruta?"
      texto-confirmar="Sí, eliminar ruta"
      titulo-id="titulo-eliminar-ruta"
      :cargando="eliminandoRuta"
      @cancelar="cerrarModalEliminar"
      @confirmar="eliminarRutaDefinitiva"
    >
      Estás a punto de borrar la ruta
      <span class="font-bold text-gray-900 font-mono">{{ rutaSeleccionada?.codigo }}</span>.
      También se eliminarán permanentemente su geometría, paradas y horarios asociados.
    </ConfirmacionEliminarComponent>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import ConfirmacionEliminarComponent from './ConfirmacionEliminarComponent.vue'
import PaginadorComponent from './PaginadorComponent.vue'

const toast = useToast()
defineProps({
  rol: {
    type: String,
    required: true,
  },
})

// Estado principal
const rutas = ref([])
const busqueda = ref('')
const paginaActual = ref(1)
const RUTAS_POR_PAGINA = 6

// Estado del Modal de Eliminación
const mostrarModalEliminar = ref(false)
const rutaSeleccionada = ref(null)
const eliminandoRuta = ref(false)

// Funciones CRUD
const cargarRutas = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/maps/rutas/')
    
    rutas.value = response.data.map((item) => ({
      id: item.id || item.route_id,
      codigo: item.route_id || 'S/C',
      nombre: item.route_long_name || item.route_short_name || 'Sin nombre',
      agency_id: item.agency_id || 'Agencia desconocida',
      trazados: item.trazados_resumen || [],
      numeroParadas: Number(item.numero_paradas) || 0,
        
    }))
  } catch (error) {
    console.error('Error al cargar las rutas:', error)
    toast.error('No se pudieron cargar las rutas del sistema.')
  }
}

const formatearDistancia = (distanciaKm) => {
  const valor = Number(distanciaKm)
  if (!Number.isFinite(valor)) return 'Sin datos'
  return valor < 1 ? `${Math.round(valor * 1000)} m` : `${valor.toFixed(2)} km`
}

// Lógica del Modal
const prepararEliminacion = (ruta) => {
  rutaSeleccionada.value = ruta
  mostrarModalEliminar.value = true
}

const cerrarModalEliminar = () => {
  mostrarModalEliminar.value = false
  rutaSeleccionada.value = null
}

const eliminarRutaDefinitiva = async () => {
  if (!rutaSeleccionada.value || eliminandoRuta.value) return
  eliminandoRuta.value = true
  try {
    // Asegúrate de que la URL termine en "/" y le pasemos el ID de la ruta seleccionada
    await axios.delete(`http://localhost:8000/api/maps/rutas/${rutaSeleccionada.value.id}/`)
    
    toast.success('Ruta y registros asociados eliminados con éxito.')
    
    // Filtramos localmente para no tener que hacer otra petición al servidor
    rutas.value = rutas.value.filter((r) => r.id !== rutaSeleccionada.value.id)
    
    cerrarModalEliminar()
  } catch (error) {
    console.error('Error al eliminar:', error)
    toast.error('Ocurrió un error al intentar eliminar la ruta.')
    cerrarModalEliminar()
  } finally {
    eliminandoRuta.value = false
  }
}

const rutasFiltradas = computed(() => {
  if (!busqueda.value) return rutas.value
  const termino = busqueda.value.toLowerCase()
  return rutas.value.filter(
    (r) => 
      r.codigo.toLowerCase().includes(termino) || 
      r.nombre.toLowerCase().includes(termino)
  )
})

const rutasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * RUTAS_POR_PAGINA
  return rutasFiltradas.value.slice(inicio, inicio + RUTAS_POR_PAGINA)
})

watch(busqueda, () => { paginaActual.value = 1 })


// Función para descargar GTFS
const descargandoGTFS = ref(false);

const descargarGTFS = async () => {
  descargandoGTFS.value = true;
  
  try {
    // IMPORTANTE: Asegúrate de poner la ruta correcta de tu backend en Django
    const urlEndpoint = 'http://localhost:8000/api/maps/generar-gtfs/'; 
    
    const response = await axios.get(urlEndpoint, {
      responseType: 'blob', // CLAVE: Necesario para que el archivo .zip no llegue corrupto
    });

    // 1. Crear una URL temporal en el navegador con los datos binarios (blob)
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // 2. Crear un elemento <a> invisible
    const link = document.createElement('a');
    link.href = url;
    
    // 3. Asignar el nombre con el que se va a descargar el archivo
    link.setAttribute('download', 'rutas_gtfs.zip'); 
    
    // 4. Agregar al DOM, hacer click y limpiar
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Error al descargar el archivo GTFS:", error);
    // Aquí puedes meter una alerta bonita si usas SweetAlert o Toast
    alert("Hubo un error al generar el GTFS. Revisa la consola.");
  } finally {
    // Regresar el botón a la normalidad
    descargandoGTFS.value = false;
  }
};
///


onMounted(() => {
  cargarRutas()
})
</script>
