import type { UserPublic } from '../types/usuario.types'
import { axiosInstance } from '@/shared/api/axiosInstance'

export async function listarUsuarios(): Promise<UserPublic[]> {
  const { data } = await axiosInstance.get<UserPublic[]>('/admin/usuarios')
  return data
}

export async function activarUsuario(id: number): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/activar`)
  return data
}

export async function desactivarUsuario(id: number): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/desactivar`)
  return data
}
