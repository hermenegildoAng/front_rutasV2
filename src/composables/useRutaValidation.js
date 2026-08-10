import { ref } from 'vue'
import * as turf from '@turf/turf'


export function useRutaValidation() {
  const errores = ref({
    paradas: []
  })
  const UMBRAL_MAXIMO_DESVIACION_METROS = 20
  const UMBRALES_VELOCIDAD_GTFS_KMH = {
    0: 100,
    1: 150,
    2: 500,
    3: 150,
    4: 80,
    5: 30,
    6: 50,
    7: 50,
    11: 150,
    12: 150,
  }
  const limpiarErrores = () => {
    errores.value = {}
  }

  //paso general
  const validarPaso0 = (form) => {
    limpiarErrores()
    let esValido = true

    if (!form.route_id || !String(form.route_id).trim()) {
      errores.value.route_id = 'El folio interno es obligatorio.'
      esValido = false
    }

    if (!form.route_short_name || !String(form.route_short_name).trim()) {
      errores.value.route_short_name = 'El nombre corto es obligatorio.'
      esValido = false
    }

    if (!form.route_long_name || !String(form.route_long_name).trim()) {
      errores.value.route_long_name = 'El nombre largo es obligatorio.'
      esValido = false
    }

    if (!form.agency_id) {
      errores.value.agency_id = 'Debes seleccionar una agencia concesionaria.'
      esValido = false
    }

    if (!form.route_type) {
      errores.value.route_type = 'Debes seleccionar el tipo de servicio.'
      esValido = false
    }

    if (!form.duracion_ruta || Number(form.duracion_ruta) <= 0) {
      errores.value.duracion_ruta = 'Ingresa una duración estimada válida.'
      esValido = false
    }

    return esValido
  }

  // paso calendarios
  const validarPasoHorarios = (form) => {
    limpiarErrores()
    let esValido = true

   
    if (!form.calendarios || form.calendarios.length === 0) {
      errores.value.calendarios = 'Debes agregar al menos un calendario de operación.'
      return false
    }

    
    const erroresCalendarios = []

    form.calendarios.forEach((cal, index) => {
      const errCal = {}

     
      if (!cal.nombre || !cal.nombre.trim()) {
        errCal.nombre = 'El nombre o descripción es obligatorio.'
        esValido = false
      }

      
      if (!cal.fecha_inicial) {
        errCal.fecha_inicial = 'Ingresa la fecha de inicio.'
        esValido = false
      }

      if (!cal.fecha_final) {
        errCal.fecha_final = 'Ingresa la fecha de término.'
        esValido = false
      }

      if (cal.fecha_inicial && cal.fecha_final && cal.fecha_inicial > cal.fecha_final) {
        errCal.fecha_final = 'La fecha final no puede ser previa a la inicial.'
        esValido = false
      }

      
      const tieneDiaActivo = [
        cal.lunes, cal.martes, cal.miercoles, 
        cal.jueves, cal.viernes, cal.sabado, cal.domingo
      ].some(Boolean)

      if (!tieneDiaActivo) {
        errCal.dias = 'Selecciona al menos un día de operación.'
        esValido = false
      }

      
      if (cal.bloques && cal.bloques.length > 0) {
        const erroresBloques = []

        cal.bloques.forEach((bloque, bIdx) => {
          const errBloque = {}

          if (!bloque.desde) {
            errBloque.desde = 'Hora de inicio requerida.'
            esValido = false
          }

          if (!bloque.hasta) {
            errBloque.hasta = 'Hora de término requerida.'
            esValido = false
          }

          if (bloque.desde && bloque.hasta && bloque.desde >= bloque.hasta) {
            errBloque.hasta = 'La hora hasta debe ser posterior a la de inicio.'
            esValido = false
          }

          if (!bloque.intervalo || Number(bloque.intervalo) <= 0) {
            errBloque.intervalo = 'Intervalo inválido.'
            esValido = false
          }

          erroresBloques[bIdx] = errBloque
        })

        if (erroresBloques.some((b) => Object.keys(b).length > 0)) {
          errCal.bloques = erroresBloques
        }
      }

      erroresCalendarios[index] = errCal
    })

    if (!esValido) {
      errores.value.calendariosList = erroresCalendarios
    }

    return esValido
  }


  //distancia entre paradas
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const radianes = (grados) => grados * Math.PI / 180;
    const dLat = radianes(lat2 - lat1);
    const dLon = radianes(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(radianes(lat1)) * Math.cos(radianes(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  }

 
 //paso paradas
  const validarPasoParadas = (form, puntosTrazado) => {
    let esValido = true
    errores.value.paradas = []
    errores.value.general_paradas = null

    // 1. Mínimo de 2 paradas requeridas por GTFS (Origen y Destino)
    if (!form.paradas || form.paradas.length < 2) {
      errores.value.general_paradas = "La ruta debe tener un mínimo de 2 paradas georreferenciadas (Origen y Destino)."
      return false
    }

    // 2. Preparación de la polilínea con Turf.js
    let lineaRutaTurf = null

    const coordenadasValidas = (puntosTrazado || []).filter(p => p.lat && p.lng && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)))

    if (coordenadasValidas.length > 1) {
      // Formato GeoJSON que exige Turf: [Longitud, Latitud]
      const coordsTurf = coordenadasValidas.map(p => [parseFloat(p.lng), parseFloat(p.lat)])
      lineaRutaTurf = turf.lineString(coordsTurf)
    }

    let distanciaAnteriorAcumulada = -1

    form.paradas.forEach((parada, index) => {
      let errorParada = {}

      // A) Campos obligatorios vacíos
      if (!parada.folio_parada?.trim()) errorParada.folio_parada = true
      if (!parada.nombre_parada?.trim()) errorParada.nombre_parada = true
      if (!parada.latitud || isNaN(parseFloat(parada.latitud))) errorParada.latitud = true
      if (!parada.longitud || isNaN(parseFloat(parada.longitud))) errorParada.longitud = true

      // B) Validaciones Geográficas
      if (lineaRutaTurf && parada.latitud && parada.longitud) {
        const lat = parseFloat(parada.latitud)
        const lng = parseFloat(parada.longitud)

        if (!isNaN(lat) && !isNaN(lng)) {
          const puntoParada = turf.point([lng, lat])

          try {
            // Forzamos explícitamente a kilómetros
            const puntoProyectado = turf.nearestPointOnLine(lineaRutaTurf, puntoParada, { units: 'kilometers' })

            // AHORA SÍ: usamos 'dist' que es la propiedad correcta en Turf.js
            const desviacionMetros = puntoProyectado.properties.dist * 1000

            if (desviacionMetros > UMBRAL_MAXIMO_DESVIACION_METROS) {
              errorParada.distancia_trazado = true
              errorParada.metros_desviacion = Math.round(desviacionMetros)
              esValido = false
            }

            // OPTIMIZACIÓN: Turf ya calcula la distancia desde el inicio de la línea (location)
            const distanciaRecorrida = puntoProyectado.properties.location

            if (distanciaRecorrida < distanciaAnteriorAcumulada) {
              errorParada.secuencia = true
              esValido = false
            }

            distanciaAnteriorAcumulada = distanciaRecorrida
          } catch (e) {
            console.warn("Error calculando distancia espacial con Turf.js:", e)
          }
        }
      }

      if (Object.keys(errorParada).length > 0) esValido = false
      errores.value.paradas[index] = errorParada
    })

    return esValido
  }

  // Validación final bajo los umbrales del validador canónico GTFS.
  // Se invoca únicamente cuando el usuario pulsa Guardar o Actualizar.
  const validarVelocidadFinal = (form, puntosTrazado) => {
    const coordenadas = (puntosTrazado || [])
      .filter((p) => p.lat !== '' && p.lng !== '' && !isNaN(Number(p.lat)) && !isNaN(Number(p.lng)))
      .map((p) => [Number(p.lng), Number(p.lat)])
    const duracionMinutos = Number(form.duracion_ruta)
    const routeType = Number(form.route_type)
    const limiteKmh = UMBRALES_VELOCIDAD_GTFS_KMH[routeType] || 200

    if (coordenadas.length < 2 || !duracionMinutos || duracionMinutos <= 0) {
      return {
        esValida: false,
        mensaje: 'No fue posible calcular la velocidad: revisa el shape y la duración de la ruta.',
      }
    }

    const distanciaShapeKm = turf.length(turf.lineString(coordenadas), { units: 'kilometers' })
    const velocidadPromedioKmh = distanciaShapeKm / (duracionMinutos / 60)
    const duracionMinimaShape = distanciaShapeKm / limiteKmh * 60

    let tramoMasRapido = null
    let duracionMinimaTramos = 0
    const paradas = [...(form.paradas || [])].sort(
      (a, b) => Number(a.orden_parada) - Number(b.orden_parada)
    )

    if (paradas.length > 1) {
      const minutosPorTramo = duracionMinutos / (paradas.length - 1)
      for (let index = 0; index < paradas.length - 1; index += 1) {
        const origen = paradas[index]
        const destino = paradas[index + 1]
        const distanciaKm = turf.distance(
          turf.point([Number(origen.longitud), Number(origen.latitud)]),
          turf.point([Number(destino.longitud), Number(destino.latitud)]),
          { units: 'kilometers' }
        )
        const velocidadKmh = distanciaKm / (minutosPorTramo / 60)
        const duracionTotalRequerida = distanciaKm / limiteKmh * 60 * (paradas.length - 1)
        duracionMinimaTramos = Math.max(duracionMinimaTramos, duracionTotalRequerida)

        if (!tramoMasRapido || velocidadKmh > tramoMasRapido.velocidadKmh) {
          tramoMasRapido = {
            origen: origen.nombre_parada,
            destino: destino.nombre_parada,
            distanciaKm,
            velocidadKmh,
          }
        }
      }
    }

    const excedePromedio = velocidadPromedioKmh > limiteKmh
    const excedeTramo = tramoMasRapido?.velocidadKmh > limiteKmh

    return {
      esValida: !excedePromedio && !excedeTramo,
      distanciaShapeKm,
      duracionMinutos,
      velocidadPromedioKmh,
      limiteKmh,
      excedePromedio,
      excedeTramo,
      tramoMasRapido,
      duracionMinimaRecomendada: Math.ceil(
        Math.max(duracionMinimaShape, duracionMinimaTramos)
      ),
    }
  }

  // RETORNO ÚNICO CORREGIDO
  return {
    errores,
    validarPaso0,
    validarPasoHorarios,
    validarPasoParadas,
    validarVelocidadFinal,
    limpiarErrores
  }
}
