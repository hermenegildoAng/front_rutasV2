<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between sticky top-0 z-10 bg-white/95 py-2 border-b border-gray-100">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Vigencia y Horarios</h3>
      <button 
        @click="agregarCalendario" 
        class="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 shadow-sm transition-all active:scale-95"
      >
        + Agregar Calendario
      </button>
    </div>
    
    <div class="space-y-5 pt-2">
      <div 
        v-for="(cal, calIndex) in form.calendarios" 
        :key="calIndex" 
        class="relative border border-gray-200 rounded-2xl bg-gray-50/50 overflow-hidden shadow-sm"
      >
        <div class="flex items-center justify-between px-4 pt-4 pb-2 bg-gray-50">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-extrabold shadow-sm">
              {{ calIndex + 1 }}
            </span>
            <input 
              v-model="cal.nombre" 
              placeholder="Ej. Temporada Regular / Fines de Semana" 
              class="text-xs font-bold text-gray-700 bg-transparent border-b border-dashed border-gray-300 outline-none focus:border-brand px-1 py-0.5 w-60"
            />
          </div>
          <button 
            @click="eliminarCalendario(calIndex)" 
            class="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            ✕ Quitar
          </button>
        </div>

        <div class="px-4 py-3 grid grid-cols-2 gap-3 bg-white">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha Inicial (start_date)</label>
            <input 
              type="date" 
              v-model="cal.fecha_inicial" 
              class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 font-medium"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha Final (end_date)</label>
            <input 
              type="date" 
              v-model="cal.fecha_final" 
              class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 font-medium"
            />
          </div>
        </div>

        <div class="px-4 pb-4 bg-white">
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Días de Operación de la Ruta</label>
          <div class="flex gap-1">
            <button 
              v-for="dia in diasSemana" 
              :key="dia.key" 
              @click="cal[dia.key] = !cal[dia.key]"
              :class="cal[dia.key] ? 'bg-brand text-white border-brand shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-brand hover:text-brand'"
              class="w-9 h-8 flex items-center justify-center rounded-lg border text-xs font-bold transition-all select-none cursor-pointer"
            >
              {{ dia.short }}
            </button>
          </div>
        </div>

        <div class="border-t border-gray-100"></div>

        <div class="p-4 bg-white/50 space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bloques de Frecuencia de Despacho</label>
            <button 
              @click="agregarBloqueFrecuencia(calIndex)" 
              class="text-[10px] px-2.5 py-1 rounded-lg bg-purple-50 text-brand border border-purple-100 hover:bg-brand hover:text-white transition-all font-bold uppercase tracking-wider"
            >
              + Añadir Bloque
            </button>
          </div>

          <div 
            v-if="cal.bloques.length === 0" 
            class="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white"
          >
            No hay frecuencias configuradas para este calendario.
          </div>

          <div 
            v-for="(bloque, bloqueIndex) in cal.bloques" 
            :key="bloqueIndex" 
            class="bg-white border border-gray-200 rounded-xl p-3 space-y-2 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-brand uppercase tracking-wide">Bloque {{ letraBloque(bloqueIndex) }}</span>
              <button @click="eliminarBloqueFrecuencia(calIndex, bloqueIndex)" class="text-gray-300 hover:text-red-400 p-0.5 transition-colors">
                ✕
              </button>
            </div>
            
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Salida Inicial</label>
                <input type="time" v-model="bloque.desde" class="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 font-medium"/>
              </div>
              <div>
                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Última Salida</label>
                <input type="time" v-model="bloque.hasta" class="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 font-medium"/>
              </div>
              <div>
                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Intervalo (min)</label>
                <input type="number" v-model="bloque.intervalo" min="1" placeholder="Ej. 15" class="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs outline-none focus:ring-2 focus:ring-brand focus:bg-white text-gray-900 font-mono"/>
              </div>
            </div>
            
            <p v-if="bloque.desde && bloque.hasta && bloque.intervalo" class="text-[10px] text-gray-400 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
              📌 <span class="font-bold text-gray-600">Resumen:</span> Servicio continuo desde las {{ formatHora(bloque.desde) }} hasta las {{ formatHora(bloque.hasta) }}, despachando unidades cada {{ bloque.intervalo }} minutos.
            </p>
          </div>
        </div>

      </div>
    </div>
    
    <div 
      v-if="form.calendarios.length === 0" 
      class="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50"
    >
      No hay configuraciones de itinerarios asignadas. Presiona el botón superior para añadir una nueva.
    </div>
  </div>
</template>

<script setup>
// Enlace reactivo bidireccional limpio con el formulario del Dashboard
const form = defineModel({ type: Object, required: true })

const diasSemana = [
  { key: 'lunes', short: 'L' },
  { key: 'martes', short: 'M' },
  { key: 'miercoles', short: 'X' },
  { key: 'jueves', short: 'J' },
  { key: 'viernes', short: 'V' },
  { key: 'sabado', short: 'S' },
  { key: 'domingo', short: 'D' },
]

const letraBloque = (i) => String.fromCharCode(65 + i)

const formatHora = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hora = parseInt(h)
  return `${hora % 12 || 12}:${m} ${hora >= 12 ? 'PM' : 'AM'}`
}

const agregarCalendario = () => {
  form.value.calendarios.push({
    nombre: '', 
    lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false,
    fecha_inicial: '', fecha_final: '', 
    bloques: [],
  })
}

const eliminarCalendario = (i) => { form.value.calendarios.splice(i, 1) }
const agregarBloqueFrecuencia = (ci) => { form.value.calendarios[ci].bloques.push({ desde: '', hasta: '', intervalo: null }) }
const eliminarBloqueFrecuencia = (ci, bi) => { form.value.calendarios[ci].bloques.splice(bi, 1) }
</script>