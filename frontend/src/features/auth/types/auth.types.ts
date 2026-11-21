import type { Rol, UserPublic } from '@/features/usuarios/types/usuario.types'

export type { Rol, UserPublic }

export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export type UsuarioSesion = Pick<UserPublic, 'id' | 'username' | 'full_name' | 'email' | 'role'>

export interface MensajeResponse {
  message: string
}
