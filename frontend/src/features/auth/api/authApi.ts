import { axiosInstance } from '@/shared/api/axiosInstance'
import type { MensajeResponse, UserCreate, UserPublic } from '../types/auth.types'

export async function login(username: string, password: string): Promise<MensajeResponse> {
  const { data } = await axiosInstance.post<MensajeResponse>('/auth/token', new URLSearchParams({ username, password }))
  return data
}

export async function logout(): Promise<MensajeResponse> {
  const { data } = await axiosInstance.post<MensajeResponse>('/auth/logout')
  return data
}

export async function obtenerUsuarioActual(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>('/auth/me')
  return data
}

export async function registrar(datos: UserCreate): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>('/auth/register', datos)
  return data
}
