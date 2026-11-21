import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserPublic } from '../types/usuario.types'
import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuariosApi'

const USUARIOS_KEY = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({ queryKey: USUARIOS_KEY, queryFn: listarUsuarios })
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (usuario: UserPublic) => (usuario.disabled ? activarUsuario(usuario.id) : desactivarUsuario(usuario.id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}
