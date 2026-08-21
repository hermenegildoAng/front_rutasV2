const valorConfigurado = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const API_BASE_URL = valorConfigurado.replace(/\/+$/, '')

export const apiUrl = (ruta) => {
  const rutaNormalizada = ruta.startsWith('/') ? ruta : `/${ruta}`
  return `${API_BASE_URL}${rutaNormalizada}`
}
