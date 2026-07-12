<template>
  <div class="min-h-screen flex bg-gray-50 relative overflow-hidden">
    <button
      @click="menuAbierto = !menuAbierto"
      class="md:hidden fixed left-0 top-20 z-50 bg-brand text-white p-2 rounded-r-xl shadow-lg flex items-center justify-center transition-all duration-300 hover:opacity-90 focus:outline-none"
    >
      <ChevronRightIcon
        class="w-5 h-5 transform transition-transform duration-300"
        :class="{ 'rotate-180': menuAbierto }"
      />
    </button>

    <div
      v-if="menuAbierto"
      @click="menuAbierto = false"
      class="md:hidden fixed inset-0 bg-black/40 z-30 transition-opacity duration-300"
    ></div>

    <SidebarComponent
      :modelValue="vistaActual"
      :rol="rol"
      @cambiarVista="irAVista"
      class="fixed md:relative inset-y-0 left-0 z-40 transform md:transform-none transition-transform duration-300 ease-in-out"
      :class="[menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0']"
    />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header
        class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0"
      >
        <h1 class="text-sm font-extrabold text-gray-800 uppercase tracking-wider pl-6 md:pl-0">
          {{ titulosVistas[vistaActual] || 'Panel de Control' }}
        </h1>
      </header>

      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        <Transition name="fade-slide" mode="out-in">
          <div :key="vistaActual" class="h-full">
            
            <div v-if="vistaActual === 'rutas'">
              <InventarioRutasComponent @verDetalleRuta="cargarDetalleDeRuta" />
            </div>

            <div v-if="vistaActual === 'captura'" class="h-full">
              <CapturaRutaComponent :rutaPrecargada="rutaSeleccionadaParaEditar" />
            </div>

            <div v-if="vistaActual === 'usuarios'">
              <UsuariosComponent />
            </div>

            <div v-if="vistaActual === 'agencias'">
              <AgenciasComponent :rol="rol" />
            </div>

            <div v-if="vistaActual === 'bitacora'">
              <BitacoraComponent />
            </div>

            <div v-if="vistaActual === 'perfil'">
              <PerfilComponent />
            </div>

          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SidebarComponent from '../components/SidebarComponent.vue'
import InventarioRutasComponent from '../components/InventarioRutasComponent.vue'
import CapturaRutaComponent from '../components/CapturaRutaComponent.vue'
import UsuariosComponent from '../components/AdminUsuariosComponent.vue'
import AgenciasComponent from '../components/AdminAgenciasComponent.vue'
import BitacoraComponent from '../components/BitacoraComponent.vue'
import PerfilComponent from '../components/PerfilComponent.vue'
import { ChevronRight as ChevronRightIcon } from 'lucide-vue-next'

// Fallback seguro al rol estructural del capturista
const rol = ref(localStorage.getItem('user-rol') || 'capturista')
const vistaActual = ref('rutas')
const menuAbierto = ref(false)
const rutaSeleccionadaParaEditar = ref(null)

const irAVista = (nuevaVista) => {
  vistaActual.value = nuevaVista
  menuAbierto.value = false
}

const cargarDetalleDeRuta = (ruta) => {
  rutaSeleccionadaParaEditar.value = ruta
  vistaActual.value = 'captura'
}

// Diccionario ortográfico limpio para el encabezado de control institucional
const titulosVistas = {
  rutas: 'Inventario de Rutas SMyT',
  captura: 'Estructurar Trazado de Ruta GTFS',
  usuarios: 'Control de Personal y Accesos',
  agencias: 'Catálogo de Operadoras y Agencias',
  bitacora: 'Bitácora de Auditoría de Sistemas',
  perfil: 'Configuración del Perfil de Usuario',
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>