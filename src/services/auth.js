const TOKEN_KEY = 'auth-token'
const USER_KEY = 'auth-user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUser = () => {
  const value = localStorage.getItem(USER_KEY)
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    clearSession()
    return null
  }
}

export const setSession = (token, usuario) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))
}

export const updateStoredUser = (usuario) => {
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Limpia las claves usadas por la simulación anterior.
  localStorage.removeItem('user-rol')
}

export const isAuthenticated = () => Boolean(getToken() && getUser())
export const isAdmin = (usuario = getUser()) => usuario?.tipo_usuario === 'admin'
export const isCapturador = (usuario = getUser()) => usuario?.tipo_usuario === 'capturador'
