import axios from 'axios'
import { clearSession, getToken } from './auth'

export const configurarHttp = (router) => {
  axios.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Token ${token}`
    return config
  })

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearSession()
        if (router.currentRoute.value.name !== 'login') router.push({ name: 'login' })
      }
      return Promise.reject(error)
    }
  )
}
