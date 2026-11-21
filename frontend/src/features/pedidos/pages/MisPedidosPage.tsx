import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import EncabezadoPagina from '@/shared/components/EncabezadoPagina'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { useAuthStore } from '@/store/authStore'
import DetallePedidoLista from '../components/DetallePedidoLista'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido.types'

const LIMITE = 5

function MisPedidosPage() {
  const usuario = useAuthStore((state) => state.usuario)
  const creado = (useLocation().state as { creado?: number } | null)?.creado
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<number | null>(creado ?? null)
  const [error, setError] = useState<string | null>(null)
  const pedidos = usePedidos({ skip: pagina * LIMITE, limit: LIMITE })
  const cancelar = useCancelarPedido()

  // RN-04: el cliente cancela solo sus pedidos y solo mientras están PENDIENTE
  const puedeCancelar = (pedido: Pedido) => pedido.estado === 'PENDIENTE' && pedido.usuario_id === usuario?.id

  function handleCancelar(pedido: Pedido) {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}? El stock se repone.`)) return
    setError(null)
    cancelar.mutate(pedido.id, { onError: (e) => setError(handleApiError(e)) })
  }

  const totalPaginas = pedidos.data ? Math.ceil(pedidos.data.total / LIMITE) : 0

  // El admin recibe todos los pedidos de la API: los gestiona desde el panel, no desde "Mis pedidos"
  if (usuario?.role === 'admin') return <Navigate to="/admin/pedidos" replace />

  return (
    <div>
      <EncabezadoPagina titulo="Mis pedidos" descripcion="Seguí el estado de tus pedidos." />
      {creado && (
        <p role="status" className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ¡Listo! Tu pedido #{creado} quedó registrado y está pendiente de confirmación.
        </p>
      )}
      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {pedidos.isPending ? (
        <SkeletonFilas filas={4} />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="inline-block rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
              Ver el catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {pedidos.data.items.map((pedido) => (
            <Card key={pedido.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-slate-900">Pedido #{pedido.id}</span>
                  <BadgeEstado estado={pedido.estado} />
                  <span className="text-sm text-slate-500">{formatearFecha(pedido.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{formatearPrecio(pedido.total)}</span>
                  <Button variante="secundario" tamanio="sm" onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)} aria-expanded={abierto === pedido.id}>
                    {abierto === pedido.id ? 'Ocultar' : 'Ver detalle'}
                  </Button>
                  {puedeCancelar(pedido) && (
                    <Button
                      variante="peligro"
                      tamanio="sm"
                      cargando={cancelar.isPending && cancelar.variables === pedido.id}
                      onClick={() => handleCancelar(pedido)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
              {abierto === pedido.id && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <DetallePedidoLista pedido={pedido} />
                </div>
              )}
            </Card>
          ))}
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} totalItems={pedidos.data.total} />
        </div>
      )}
    </div>
  )
}

export default MisPedidosPage
