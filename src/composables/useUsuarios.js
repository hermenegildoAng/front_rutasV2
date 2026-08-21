import { ref, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { apiUrl } from '../services/api'

const API_URL = apiUrl('/api/auth/usuarios/')

export function useUsuarios() {
  const toast = useToast()

  const listaUsuarios = ref([])
  const cargando = ref(true)
  const guardando = ref(false)
  const passwordTemporal = ref('')
  const usuarioEliminar = ref(null)
  const mostrandoModalEliminar = ref(false)
  const cargandoEliminar = ref(false)

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
    const baseConAnio = `${baseUsername}${anioActual}`
    let usernameFinal = baseConAnio
    let consecutivo = 2
    while (listaUsuarios.value.some(
      (u) => u.username && u.username.toLowerCase() === usernameFinal.toLowerCase()
    )) {
      usernameFinal = `${baseConAnio}${consecutivo}`
      consecutivo += 1
    }

    return usernameFinal
  }

  watch(
    () => nuevoUsuario.value.nombre_completo,
    (nuevoNombre) => {
      nuevoUsuario.value.username = generarUsername(nuevoNombre)
    }
  )

  // Generador de clave temporal robusta
  const generarPasswordAleatorio = (longitud = 12) => {
    const grupos = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      '!@#',
    ]
    const todos = grupos.join('')
    const numeroSeguro = (maximo) => {
      const valor = new Uint32Array(1)
      window.crypto.getRandomValues(valor)
      return valor[0] % maximo
    }

    const caracteres = grupos.map((grupo) => grupo[numeroSeguro(grupo.length)])
    while (caracteres.length < longitud) {
      caracteres.push(todos[numeroSeguro(todos.length)])
    }
    for (let i = caracteres.length - 1; i > 0; i -= 1) {
      const j = numeroSeguro(i + 1)
      ;[caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]]
    }
    return caracteres.join('')
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
    nuevoUsuario.value.password = generarPasswordAleatorio(12)
    passwordTemporal.value = ''

    try {
      const res = await axios.post(API_URL, nuevoUsuario.value)
      const usuarioCreado = { ...res.data }
      delete usuarioCreado.correo_enviado
      delete usuarioCreado.modo_correo
      listaUsuarios.value.unshift(usuarioCreado)
      if (res.data.modo_correo === 'console') {
        toast.info('Usuario registrado; el correo de prueba se imprimió en la terminal de Django.')
      } else if (res.data.correo_enviado) {
        toast.success('Usuario registrado y credenciales enviadas por correo.')
      } else {
        toast.warning('Usuario registrado, pero no se pudo enviar el correo de credenciales.')
      }
      passwordTemporal.value = nuevoUsuario.value.password

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

  const actualizarRol = async (usuario, tipoUsuarioAnterior) => {
    try {
      const res = await axios.patch(`${API_URL}${usuario.id}/`, {
        tipo_usuario: usuario.tipo_usuario,
      })
      Object.assign(usuario, res.data)
      toast.success('Rol actualizado correctamente.')
    } catch (error) {
      usuario.tipo_usuario = tipoUsuarioAnterior
      const detalle = error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail
      toast.error(detalle || 'No se pudo actualizar el rol.')
    }
  }

  const abrirModalEliminar = (usuario) => {
    usuarioEliminar.value = usuario
    mostrandoModalEliminar.value = true
  }

  const cerrarModalEliminar = () => {
    if (cargandoEliminar.value) return
    usuarioEliminar.value = null
    mostrandoModalEliminar.value = false
  }

  const confirmarEliminar = async () => {
    if (!usuarioEliminar.value || cargandoEliminar.value) return
    cargandoEliminar.value = true
    try {
      await axios.delete(`${API_URL}${usuarioEliminar.value.id}/`)
      listaUsuarios.value = listaUsuarios.value.filter(
        (usuario) => usuario.id !== usuarioEliminar.value.id
      )
      toast.success('Usuario eliminado correctamente.')
      usuarioEliminar.value = null
      mostrandoModalEliminar.value = false
    } catch (error) {
      const detalle = error.response?.data?.error || error.response?.data?.detail
      toast.error(detalle || 'No se pudo eliminar el usuario.')
    } finally {
      cargandoEliminar.value = false
    }
  }

  return {
    listaUsuarios,
    cargando,
    guardando,
    passwordTemporal,
    nuevoUsuario,
    errores,
    obtenerUsuarios,
    agregarUsuario,
    toggleEstado,
    actualizarRol,
    usuarioEliminar,
    mostrandoModalEliminar,
    cargandoEliminar,
    abrirModalEliminar,
    cerrarModalEliminar,
    confirmarEliminar,
  }
}
