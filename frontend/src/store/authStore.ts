import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '@/features/auth/api/authApi'
import type { UserPublic, UsuarioSesion } from '@/features/auth/types/auth.types'
import { statusDeError } from '@/shared/api/handleApiError'

interface AuthState {
  usuario: UsuarioSesion | null
  cargando: boolean
  login: (username: string, password: string) => Promise<UsuarioSesion>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

function aUsuarioSesion({ id, username, full_name, email, role }: UserPublic): UsuarioSesion {
  return { id, username, full_name, email, role }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await authApi.login(username, password)
        const usuario = aUsuarioSesion(await authApi.obtenerUsuarioActual())
        set({ usuario })
        return usuario
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          set({ usuario: aUsuarioSesion(await authApi.obtenerUsuarioActual()) })
        } catch (error) {
          if (statusDeError(error) !== undefined) set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'food-store-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
