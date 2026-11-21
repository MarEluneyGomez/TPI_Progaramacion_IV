import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { detalleDeError, statusDeError } from './handleApiError'
import { queryClient } from './queryClient'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']
const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = statusDeError(error)
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : ''
    const sesionInvalida = status === 401 || (status === 400 && detalleDeError(error) === CUENTA_DESACTIVADA)

    if (sesionInvalida && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.endsWith(ruta))) {
      useAuthStore.getState().limpiarSesion()
      queryClient.removeQueries({ queryKey: ['pedidos'] })
      queryClient.removeQueries({ queryKey: ['usuarios'] })
    }
    return Promise.reject(error)
  },
)
