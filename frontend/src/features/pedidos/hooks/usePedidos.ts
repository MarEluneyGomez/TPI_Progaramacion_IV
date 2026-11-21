import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido, cancelarPedido, crearPedido, listarPedidos, obtenerResumen } from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from '../types/pedido.types'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: obtenerResumen })
}

function useInvalidarPedidosYStock() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    void queryClient.invalidateQueries({ queryKey: ['productos'] })
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidosYStock()
  return useMutation({ mutationFn: (datos: PedidoCreate) => crearPedido(datos), onSuccess: invalidar })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidosYStock()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidosYStock()
  return useMutation({ mutationFn: (id: number) => cancelarPedido(id), onSuccess: invalidar })
}
