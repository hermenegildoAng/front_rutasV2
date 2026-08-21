import { ref } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { apiUrl } from '../services/api'

const API_URL = apiUrl('/api/transit/agencias/')

export function useAgencias() {
  const toast = useToast()

  const agencias = ref([])
  const cargando = ref(true)
  const guardando = ref(false)

  // Datos del form de creación
  const nuevaAgencia = ref({
    agency_id: '',
    agency_name: '',
    agency_url: '',
  })

  // Estado del Modal de Edición
  const modalAbierto = ref(false)
  const idOriginalEdicion = ref(null)
  const agenciaEdicion = ref({
    agency_id: '',
    agency_name: '',
    agency_url: '',
  })

  // Estado del Modal de Eliminación
  const agenciaEliminar = ref(null)
  const mostrandoModalEliminar = ref(false)
  const cargandoEliminar = ref(false)

  // Separación de errores
  const erroresCreacion = ref({
    agency_id: '',
    agency_name: '',
    agency_url: '',
  })

  const erroresEdicion = ref({
    agency_id: '',
    agency_name: '',
    agency_url: '',
  })

  const limpiarErrores = () => {
    erroresCreacion.value = { agency_id: '', agency_name: '', agency_url: '' }
    erroresEdicion.value = { agency_id: '', agency_name: '', agency_url: '' }
  }

  const validarFormulario = (datos, esEdicion = false) => {
    limpiarErrores()
    const erroresObj = esEdicion ? erroresEdicion.value : erroresCreacion.value
    let esValido = true

    // 1. Validar ID (SOLO en Creación)
    if (!esEdicion) {
      const id = datos.agency_id ? datos.agency_id.trim() : ''
      if (!id) {
        erroresObj.agency_id = 'El ID es obligatorio.'
        esValido = false
      } else {
        const existeId = agencias.value.some(
          (a) => String(a.agency_id).toLowerCase() === id.toLowerCase()
        )
        if (existeId) {
          erroresObj.agency_id = 'Este ID de Agencia ya está registrado.'
          esValido = false
        }
      }
    }

    // 2. Validar Nombre
    if (!datos.agency_name || !datos.agency_name.trim()) {
      erroresObj.agency_name = 'El nombre público es obligatorio.'
      esValido = false
    }

    // 3. Validar URL
    const url = datos.agency_url ? datos.agency_url.trim() : ''
    if (!url) {
      erroresObj.agency_url = 'El sitio web es obligatorio.'
      esValido = false
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      erroresObj.agency_url = 'Debe iniciar con http:// o https://'
      esValido = false
    } else {
      const existeUrl = agencias.value.some((a) => {
        if (esEdicion && String(a.agency_id) === String(idOriginalEdicion.value)) {
          return false
        }
        return a.agency_url.toLowerCase() === url.toLowerCase()
      })

      if (existeUrl) {
        erroresObj.agency_url = 'Esta URL ya está registrada en otra agencia.'
        esValido = false
      }
    }

    if (!esValido) {
      toast.warning('Revisa los campos marcados en rojo.')
    }

    return esValido
  }

  // --- CONTROL DE MODALES ---
  const abrirModalEdicion = (agencia) => {
    idOriginalEdicion.value = agencia.agency_id
    agenciaEdicion.value = { ...agencia }
    limpiarErrores()
    modalAbierto.value = true
  }

  const cerrarModalEdicion = () => {
    modalAbierto.value = false
    idOriginalEdicion.value = null
    agenciaEdicion.value = { agency_id: '', agency_name: '', agency_url: '' }
    limpiarErrores()
  }

  const abrirModalEliminar = (agencia) => {
    agenciaEliminar.value = agencia
    mostrandoModalEliminar.value = true
  }

  const cerrarModalEliminar = () => {
    agenciaEliminar.value = null
    mostrandoModalEliminar.value = false
  }

  // --- PETICIONES API ---
  const obtenerAgencias = async () => {
    cargando.value = true
    try {
      const res = await axios.get(API_URL)
      agencias.value = res.data
    } catch (error) {
      console.error('Error al obtener agencias:', error)
      toast.error('No se pudieron cargar las agencias desde el servidor.')
    } finally {
      cargando.value = false
    }
  }

  const agregarAgencia = async () => {
    if (!validarFormulario(nuevaAgencia.value, false)) return

    guardando.value = true
    try {
      const res = await axios.post(API_URL, nuevaAgencia.value)
      agencias.value.unshift(res.data)
      toast.success('¡Agencia registrada con éxito!')

      nuevaAgencia.value = { agency_id: '', agency_name: '', agency_url: '' }
      limpiarErrores()
    } catch (error) {
      console.error('Error al guardar agencia:', error)
      manejarErroresServer(error, false)
    } finally {
      guardando.value = false
    }
  }

  const actualizarAgencia = async () => {
    if (!validarFormulario(agenciaEdicion.value, true)) return

    guardando.value = true
    try {
      const res = await axios.put(`${API_URL}${idOriginalEdicion.value}/`, agenciaEdicion.value)

      const idx = agencias.value.findIndex((a) => String(a.agency_id) === String(idOriginalEdicion.value))
      if (idx !== -1) {
        agencias.value[idx] = res.data
      }

      toast.success('¡Agencia actualizada correctamente!')
      cerrarModalEdicion()
    } catch (error) {
      console.error('Error al actualizar agencia:', error)
      manejarErroresServer(error, true)
    } finally {
      guardando.value = false
    }
  }

  const confirmarEliminar = async () => {
    if (!agenciaEliminar.value) return

    cargandoEliminar.value = true
    try {
      // Uso de API_URL para consistencia y evitar error 404
      const res = await axios.delete(`${API_URL}${agenciaEliminar.value.agency_id}/`)

      toast.success(res.data?.mensaje || 'Agencia eliminada con éxito.')

      agencias.value = agencias.value.filter(
        (a) => a.agency_id !== agenciaEliminar.value.agency_id
      )

      cerrarModalEliminar()
    } catch (error) {
      console.error('Respuesta de error completa del backend:', error.response)

      if (error.response) {
        const serverError = error.response.data?.error || error.response.data?.detail
        
        const firstKey = error.response.data ? Object.keys(error.response.data)[0] : null
        const fieldError = firstKey && Array.isArray(error.response.data[firstKey]) 
          ? `${firstKey}: ${error.response.data[firstKey][0]}` 
          : null

        const mensajeFinal = serverError || fieldError || `Error ${error.response.status}: No se pudo eliminar.`

        toast.error(mensajeFinal)
      } else {
        toast.error('Error de conexión con el servidor Django.')
      }
    } finally {
      cargandoEliminar.value = false
    }
  }

  const manejarErroresServer = (error, esEdicion = false) => {
    const erroresTarget = esEdicion ? erroresEdicion.value : erroresCreacion.value

    if (error.response && error.response.data) {
      const data = error.response.data
      if (typeof data === 'object') {
        if (data.agency_id) erroresTarget.agency_id = Array.isArray(data.agency_id) ? data.agency_id[0] : data.agency_id
        if (data.agency_name) erroresTarget.agency_name = Array.isArray(data.agency_name) ? data.agency_name[0] : data.agency_name
        if (data.agency_url) erroresTarget.agency_url = Array.isArray(data.agency_url) ? data.agency_url[0] : data.agency_url
        toast.error('Ocurrió un error con los datos ingresados.')
      }
    } else {
      toast.error('Error de conexión con el servidor Django.')
    }
  }

  return {
    agencias,
    cargando,
    guardando,
    nuevaAgencia,
    agenciaEdicion,
    modalAbierto,
    erroresCreacion,
    erroresEdicion,
    obtenerAgencias,
    agregarAgencia,
    actualizarAgencia,
    abrirModalEdicion,
    cerrarModalEdicion,
    agenciaEliminar,
    mostrandoModalEliminar,
    cargandoEliminar,
    abrirModalEliminar,
    cerrarModalEliminar,
    confirmarEliminar
  }
}
