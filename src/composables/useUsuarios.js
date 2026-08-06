import { ref, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const API_URL = 'http://127.0.0.1:8000/api/auth/usuarios/'

export function useUsuarios() {
  const toast = useToast()

  const listaUsuarios = ref([])
  const cargando = ref(true)
  const guardando = ref(false)

  const nuevoUsuario = ref({
    nombre_completo: '',
    username: '',
    email: '',
    tipo_usuario: 'capturador',
    password: '',
    activo: true,
  })

  const errores = ref({
    nombre_completo: '',
    email: '',
  })

  const limpiarErrores = () => {
    errores.value = {
      nombre_completo: '',
      email: '',
    }
  }

  // --- GENERAR USERNAME AUTOMÁTICO (ej: juanPerez26 / juanPerez2629) ---
  const generarUsername = (nombre) => {
    if (!nombre.trim()) return ''

    const palabras = nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/)

    let baseUsername = ''

    if (palabras.length === 1) {
      baseUsername = palabras[0].toLowerCase()
    } else {
      const primerNombre = palabras[0].toLowerCase()
      const primerApellido = palabras[1].charAt(0).toUpperCase() + palabras[1].slice(1).toLowerCase()
      baseUsername = `${primerNombre}${primerApellido}`
    }

    const anioActual = new Date().getFullYear().toString().slice(-2) // ej: '26'
    let usernameFinal = `${baseUsername}${anioActual}`

    // Si ya existe localmente, agregamos el día actual del mes
    const yaExiste = listaUsuarios.value.some(
      (u) => u.username && u.username.toLowerCase() === usernameFinal.toLowerCase()
    )
    if (yaExiste) {
      const diaActual = new Date().getDate().toString().padStart(2, '0')
      usernameFinal = `${usernameFinal}${diaActual}`
    }

    return usernameFinal
  }

  watch(
    () => nuevoUsuario.value.nombre_completo,
    (nuevoNombre) => {
      nuevoUsuario.value.username = generarUsername(nuevoNombre)
    }
  )

  // Generador de clave aleatoria de 8 caracteres
  const generarPasswordAleatorio = (longitud = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#'
    let res = ''
    for (let i = 0; i < longitud; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return res
  }

  // --- VALIDACIONES EN CLIENTE ---
  const validarFormulario = () => {
    limpiarErrores()
    let esValido = true

    if (!nuevoUsuario.value.nombre_completo.trim()) {
      errores.value.nombre_completo = 'El nombre completo es obligatorio.'
      esValido = false
    }

    const email = nuevoUsuario.value.email.trim()
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      errores.value.email = 'El correo electrónico es obligatorio.'
      esValido = false
    } else if (!regexEmail.test(email)) {
      errores.value.email = 'El formato de correo no es válido.'
      esValido = false
    } else if (listaUsuarios.value.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      errores.value.email = 'Este correo electrónico ya está registrado.'
      esValido = false
    }

    if (!esValido) {
      toast.warning('Revisa los campos marcados en rojo.')
    }

    return esValido
  }

  // --- ACCIONES PETICIONES API ---
  const obtenerUsuarios = async () => {
    cargando.value = true
    try {
      const res = await axios.get(API_URL)
      listaUsuarios.value = res.data
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      toast.error('No se pudo cargar la lista de usuarios.')
    } finally {
      cargando.value = false
    }
  }

  const agregarUsuario = async () => {
    if (!validarFormulario()) return

    guardando.value = true
    nuevoUsuario.value.password = generarPasswordAleatorio(8)

    try {
      const res = await axios.post(API_URL, nuevoUsuario.value)
      listaUsuarios.value.unshift(res.data)
      toast.success('¡Usuario registrado exitosamente!')

      nuevoUsuario.value = {
        nombre_completo: '',
        username: '',
        email: '',
        tipo_usuario: 'capturador',
        password: '',
        activo: true,
      }
      limpiarErrores()
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      if (error.response && error.response.data) {
        const data = error.response.data
        if (typeof data === 'object') {
          if (data.email) errores.value.email = Array.isArray(data.email) ? data.email[0] : data.email
          if (data.nombre_completo) errores.value.nombre_completo = Array.isArray(data.nombre_completo) ? data.nombre_completo[0] : data.nombre_completo
        }
      } else {
        toast.error('Error de conexión con el servidor Django.')
      }
    } finally {
      guardando.value = false
    }
  }

  const toggleEstado = async (usuario) => {
    const nuevoEstado = !usuario.activo
    try {
      await axios.patch(`${API_URL}${usuario.id}/`, { activo: nuevoEstado })
      usuario.activo = nuevoEstado
      toast.info(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('No se pudo actualizar el estado del usuario.')
    }
  }

  return {
    listaUsuarios,
    cargando,
    guardando,
    nuevoUsuario,
    errores,
    obtenerUsuarios,
    agregarUsuario,
    toggleEstado,
  }
}