import { ref } from 'vue'
import * as fflate from 'fflate'

export function useLectorRutas(onPuntosCargados) {
  const archivoSeleccionado = ref(null)
  const archivoValido = ref(false)
  const archivoCargando = ref(false)
  const archivoResultado = ref(null)

  const limpiarArchivo = () => {
    archivoSeleccionado.value = null
    archivoValido.value = false
  }

  // 📂 PARSER GTFS & KMZ (Extrae puntos desde el ZIP)
  const parsearZIP = (archivosDescomprimidos) => {
    let pts = []

    // 1️⃣ CASO A: Es un GTFS oficial con shapes.txt (Trazo geométrico)
    if (archivosDescomprimidos['shapes.txt']) {
      const decoder = new TextDecoder()
      const contenidoText = decoder.decode(archivosDescomprimidos['shapes.txt'])
      const lineas = contenidoText.split('\n')
      const cabeceras = lineas[0].split(',').map(c => c.trim())
      
      const idxLat = cabeceras.indexOf('shape_pt_lat')
      const idxLng = cabeceras.indexOf('shape_pt_lon')
      const idxOrden = cabeceras.indexOf('shape_pt_sequence')

      let puntosFiltrados = []
      for (let i = 1; i < lineas.length; i++) {
        if (!lineas[i].trim()) continue
        const columnas = lineas[i].split(',')
        if (columnas[idxLat] && columnas[idxLng]) {
          puntosFiltrados.push({
            lat: parseFloat(columnas[idxLat]),
            lng: parseFloat(columnas[idxLng]),
            orden: idxOrden !== -1 ? parseInt(columnas[idxOrden]) : i
          })
        }
      }
      puntosFiltrados.sort((a, b) => a.orden - b.orden)
      pts = puntosFiltrados.map(p => ({ lat: p.lat, lng: p.lng }))
    } 
    // 2️⃣ CASO B: Es un GTFS oficial pero solo con stops.txt (Paradas sueltas)
    else if (archivosDescomprimidos['stops.txt']) {
      const decoder = new TextDecoder()
      const contenidoText = decoder.decode(archivosDescomprimidos['stops.txt'])
      const lineas = contenidoText.split('\n')
      const cabeceras = lineas[0].split(',').map(c => c.trim())
      const idxLat = cabeceras.indexOf('stop_lat')
      const idxLng = cabeceras.indexOf('stop_lon')

      for (let i = 1; i < lineas.length; i++) {
        if (!lineas[i].trim()) continue
        const columnas = lineas[i].split(',')
        if (columnas[idxLat] && columnas[idxLng]) {
          pts.push({ lat: parseFloat(columnas[idxLat]), lng: parseFloat(columnas[idxLng]) })
        }
      }
    } 
    // 3️⃣ CASO C: ¡El problema que traías! Es un .zip/.kmz que esconde un .kml adentro
    else {
      // Buscamos cualquier archivo que termine con extensión .kml adentro del zip
      const nombreArchivoKml = Object.keys(archivosDescomprimidos).find(nombre => nombre.toLowerCase().endsWith('.kml'))
      
      if (nombreArchivoKml) {
        const decoder = new TextDecoder()
        const kmlTexto = decoder.decode(archivosDescomprimidos[nombreArchivoKml])
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(kmlTexto, 'text/xml')
        pts = parsearKML(xmlDoc)
      }
    }

    return pts
  }

  // Lógica para GeoJSON
  const parsearGeoJSON = (data) => {
    let pts = []
    if (data.type === 'FeatureCollection') {
      const feature = data.features.find(f => f.geometry && (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'))
      if (feature) {
        if (feature.geometry.type === 'LineString') {
          pts = feature.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }))
        } else if (feature.geometry.type === 'MultiLineString') {
          pts = feature.geometry.coordinates[0].map(c => ({ lat: c[1], lng: c[0] }))
        }
      }
    } else if (data.type === 'Feature' && data.geometry) {
      if (data.geometry.type === 'LineString') {
        pts = data.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }))
      }
    }
    return pts
  }

  // Lógica para GPX
  const parsearGPX = (doc) => {
    const pts = []
    const trkpts = doc.getElementsByTagName('trkpt')
    if (trkpts.length > 0) {
      for (let i = 0; i < trkpts.length; i++) {
        pts.push({
          lat: parseFloat(trkpts[i].getAttribute('lat')),
          lng: parseFloat(trkpts[i].getAttribute('lon'))
        })
      }
    } else {
      const wpt = doc.getElementsByTagName('wpt')
      for (let i = 0; i < wpt.length; i++) {
        pts.push({
          lat: parseFloat(wpt[i].getAttribute('lat')),
          lng: parseFloat(wpt[i].getAttribute('lon'))
        })
      }
    }
    return pts
  }

  // 🗺️ PARSER KML OPTIMIZADO (Barre todas las etiquetas de coordenadas posibles)
  const parsearKML = (doc) => {
    const pts = []
    const coordinatesNodes = doc.getElementsByTagName('coordinates')

    for (let i = 0; i < coordinatesNodes.length; i++) {
      const coordStr = coordinatesNodes[i].textContent.trim()
      if (!coordStr) continue

      // Los KML pueden separar los bloques por saltos de línea, espacios o tabs
      const pairs = coordStr.split(/[\s\n\r]+/)
      
      pairs.forEach(p => {
        const parts = p.split(',')
        // Un nodo válido en KML tiene: longitud, latitud y opcionalmente elevación
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0])
          const lat = parseFloat(parts[1])
          
          // Validamos que sean números reales para evitar meter basura de strings vacíos
          if (!isNaN(lat) && !isNaN(lng)) {
            pts.push({ lat, lng })
          }
        }
      })
    }
    return pts
  }

  // Orquestador de carga principal
  const procesarArchivo = async () => {
    if (!archivoSeleccionado.value || !archivoValido.value) return
    archivoCargando.value = true
    archivoResultado.value = null

    try {
      const extension = '.' + archivoSeleccionado.value.name.split('.').pop().toLowerCase()
      let puntos = []

      if (extension === '.zip') {
        const arrayBuffer = await archivoSeleccionado.value.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)
        const unzipped = fflate.unzipSync(buffer)
        puntos = parsearZIP(unzipped)
      } 
      else if (extension === '.geojson' || extension === '.json') {
        const text = await archivoSeleccionado.value.text()
        puntos = parsearGeoJSON(JSON.parse(text))
      } 
      else if (extension === '.gpx' || extension === '.kml') {
        const text = await archivoSeleccionado.value.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(text, 'text/xml')
        puntos = extension === '.gpx' ? parsearGPX(xmlDoc) : parsearKML(xmlDoc)
      }

      if (puntos.length === 0) {
        archivoResultado.value = { 
          ok: false, 
          mensaje: 'No se encontraron coordenadas válidas (shapes.txt, stops.txt o elementos <coordinates> de KML) en el archivo.' 
        }
        return
      }

      onPuntosCargados(puntos)
      archivoResultado.value = { ok: true, mensaje: `Éxito: ${puntos.length} puntos cargados al mapa.` }
      limpiarArchivo()

    } catch (err) {
      console.error('Error parseando paquete de datos:', err)
      archivoResultado.value = { ok: false, mensaje: 'Error crítico al procesar el archivo. Estructura inválida.' }
    } finally {
      archivoCargando.value = false
    }
  }

  return {
    archivoSeleccionado,
    archivoValido,
    archivoCargando,
    archivoResultado,
    limpiarArchivo,
    procesarArchivo
  }
}