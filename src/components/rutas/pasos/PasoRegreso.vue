<template>
  <div class="space-y-4">
    <div class="sticky top-0 z-10 bg-white/95 py-2 border-b border-gray-100">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Variante de Retorno (Direction 1)</h3>
    </div>

    <div class="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm">
      <div class="flex flex-col">
        <span class="text-xs font-bold text-gray-700 uppercase tracking-wide">Habilitar sentido de regreso</span>
        <span class="text-[11px] text-gray-400 font-medium">Define si la ruta cuenta con un circuito o trazo de retorno inverso</span>
      </div>
      <button
        type="button"
        @click="form.viaje_regreso.tiene_viaje_regreso = !form.viaje_regreso.tiene_viaje_regreso"
        :class="form.viaje_regreso.tiene_viaje_regreso ? 'bg-brand' : 'bg-gray-300'"
        class="relative w-11 h-6 rounded-full transition-colors shrink-0 outline-none cursor-pointer"
      >
        <span 
          :class="form.viaje_regreso.tiene_viaje_regreso ? 'translate-x-5' : 'translate-x-0.5'" 
          class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform"
        />
      </button>
    </div>

    <template v-if="form.viaje_regreso.tiene_viaje_regreso">
      <div class="space-y-3 pt-1">
        
        <div class="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-gray-700 uppercase tracking-wide">Vincular mismos horarios de ida</span>
            <span class="text-[11px] text-gray-400 font-medium">Clona automáticamente la vigencia y bloques de frecuencia asignados</span>
          </div>
          <button 
            type="button" 
            @click="toggleMismosHorarios" 
            :class="form.viaje_regreso.mismos_horarios ? 'bg-brand' : 'bg-gray-300'" 
            class="relative w-11 h-6 rounded-full transition-colors shrink-0 outline-none cursor-pointer"
          >
            <span 
              :class="form.viaje_regreso.mismos_horarios ? 'translate-x-5' : 'translate-x-0.5'" 
              class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform"
            />
          </button>
        </div>

        <div class="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-gray-700 uppercase tracking-wide">Vincular mismas paradas de ida</span>
            <span class="text-[11px] text-gray-400 font-medium">Utiliza los mismos nodos geométricos de la ida en sentido inverso</span>
          </div>
          <button 
            type="button" 
            @click="toggleMismasParadas" 
            :class="form.viaje_regreso.mismas_paradas ? 'bg-brand' : 'bg-gray-300'" 
            class="relative w-11 h-6 rounded-full transition-colors shrink-0 outline-none cursor-pointer"
          >
            <span 
              :class="form.viaje_regreso.mismas_paradas ? 'translate-x-5' : 'translate-x-0.5'" 
              class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform"
            />
          </button>
        </div>

        <div class="p-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl text-[11px] text-gray-500 font-medium leading-relaxed">
          💡 <span class="font-bold text-brand uppercase tracking-wider">Nota técnica:</span> Si desvinculas las paradas u horarios, el módulo habilitará las pestañas cartográficas independientes en el mapa principal para trazar la geometría específica de retorno.
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
// Enlace reactivo bidireccional limpio con el objeto central del Dashboard
const form = defineModel({ type: Object, required: true })

const toggleMismosHorarios = () => {
  form.value.viaje_regreso.mismos_horarios = !form.value.viaje_regreso.mismos_horarios
  form.value.viaje_regreso.calendarios = form.value.viaje_regreso.mismos_horarios 
    ? [] 
    : JSON.parse(JSON.stringify(form.value.calendarios))
}

const toggleMismasParadas = () => {
  form.value.viaje_regreso.mismas_paradas = !form.value.viaje_regreso.mismas_paradas
  form.value.viaje_regreso.paradas = form.value.viaje_regreso.mismas_paradas 
    ? [] 
    : JSON.parse(JSON.stringify(form.value.paradas))
}
</script>