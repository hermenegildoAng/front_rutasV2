<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen">
    <div class="p-6">
      <div
        class="w-full h-12 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-brand font-black text-sm px-2 text-center mb-8 uppercase tracking-wider"
      >
        <MapIcon class="w-5 h-5 text-brand mr-2" />
        <span>Movilidad GTFS</span>
      </div>

      <div class="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Usuario actual</p>
        <p class="text-sm font-bold text-gray-900">{{ nombreUsuario }}</p>
        <span
          :class="claseRol"
          class="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wide"
        >
          {{ rol }}
        </span>
      </div>

      <nav class="space-y-1">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Navegación
        </p>

        <button
          @click="$emit('cambiarVista', 'rutas')"
          :class="[
            modelValue === 'rutas'
              ? 'bg-brand/10 text-brand font-semibold'
              : 'text-gray-600 hover:bg-gray-50',
          ]"
          class="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium"
        >
          <MapIcon class="w-5 h-5" />
          <span>Ver Rutas</span>
        </button>

        <button
          v-if="rol === 'capturista'"
          @click="$emit('cambiarVista', 'captura')"
          :class="[
            modelValue === 'captura'
              ? 'bg-brand/10 text-brand font-semibold'
              : 'text-gray-600 hover:bg-gray-50',
          ]"
          class="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium"
        >
          <PlusCircleIcon class="w-5 h-5" />
          <span>Capturar Ruta</span>
        </button>

        <button
          v-if="rol === 'super' || rol === 'capturista'"
          @click="$emit('cambiarVista', 'agencias')"
          :class="[
            modelValue === 'agencias'
              ? 'bg-brand/10 text-brand font-semibold'
              : 'text-gray-600 hover:bg-gray-50',
          ]"
          class="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium"
        >
          <BuildingIcon class="w-5 h-5" />
          <span>Registrar Agencia</span>
        </button>

        <div v-if="rol === 'super'" class="pt-4 space-y-1">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Administración
          </p>

          <button
            @click="$emit('cambiarVista', 'usuarios')"
            :class="[
              modelValue === 'usuarios'
                ? 'bg-brand/10 text-brand font-semibold'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
            class="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium"
          >
            <UsersIcon class="w-5 h-5" />
            <span>Control de Usuarios</span>
          </button>

          <button
            @click="$emit('cambiarVista', 'bitacora')"
            :class="[
              modelValue === 'bitacora'
                ? 'bg-brand/10 text-brand font-semibold'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
            class="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium"
          >
            <ClipboardListIcon class="w-5 h-5" />
            <span>Bitácora de Acciones</span>
          </button>
        </div>
      </nav>
    </div>

    <div class="p-4 border-t border-gray-100 space-y-1">
      <button
        @click="$emit('cambiarVista', 'perfil')"
        :class="[
          modelValue === 'perfil'
            ? 'bg-brand/10 text-brand font-semibold'
            : 'text-gray-600 hover:bg-gray-50',
        ]"
        class="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium"
      >
        <UserIcon class="w-5 h-5" />
        <span>Mi Perfil</span>
      </button>

      <button
        @click="cerrarSesion"
        class="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold"
      >
        <LogOutIcon class="w-5 h-5" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import {
  Map as MapIcon,
  PlusCircle as PlusCircleIcon,
  Building2 as BuildingIcon,
  Users as UsersIcon,
  ClipboardList as ClipboardListIcon,
  User as UserIcon,
  LogOut as LogOutIcon
} from '@lucide/vue'

const props = defineProps({
  modelValue: String,
  rol: String,
})

const emit = defineEmits(['cambiarVista', 'logout'])

const nombreUsuario = computed(() => {
  if (props.rol === 'super') return 'Ing. Alejandro H.'
  if (props.rol === 'capturista') return 'Sria. Beatriz M.'
  return 'Usuario Sistema'
})

const claseRol = computed(() => {
  if (props.rol === 'super') return 'bg-purple-50 text-purple-600 border border-purple-100'
  return 'bg-blue-50 text-blue-600 border border-blue-100'
})

const cerrarSesion = () => {
  localStorage.removeItem('user-rol')
  emit('logout')
}
</script>