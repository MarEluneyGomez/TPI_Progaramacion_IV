import { QueryClient } from '@tanstack/react-query'
import { statusDeError } from './handleApiError'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (intentos, error) => {
        const status = statusDeError(error)
        const esErrorDelCliente = status !== undefined && status < 500
        return !esErrorDelCliente && intentos < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})
