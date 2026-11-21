import { useMutation } from '@tanstack/react-query'
import { registrar } from '../api/authApi'
import type { UserCreate } from '../types/auth.types'

export function useRegistro() {
  return useMutation({ mutationFn: (datos: UserCreate) => registrar(datos) })
}
