import { createColumnHelper, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '@/shared/api/handleApiError'
import EncabezadoPagina from '@/shared/components/EncabezadoPagina'
import TablaDatos from '@/shared/components/TablaDatos'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Modal from '@/shared/ui/Modal'
import Select from '@/shared/ui/Select'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import DetallePedidoLista from '../components/DetallePedidoLista'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ETIQUETA_FORMA_PAGO, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido.types'

const SIN_PEDIDOS: Pedido[] = []

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

const OPCIONES_ESTADO = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'EN_PREPARACION', etiqueta: 'En preparación' },
  { valor: 'ENTREGADO', etiqueta: 'Entregado' },
  { valor: 'CANCELADO', etiqueta: 'Cancelado' },
]

const columnHelper = createColumnHelper<Pedido>()

function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pedidos = usePedidos({ skip: 0, limit: 100, estado: estado || undefined })
  const cambiarEstado = useCambiarEstadoPedido()

  function handleCambiar(pedido: Pedido, nuevo: EstadoPedido) {
    if (nuevo === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${pedido.id}? El stock se repone.`)) return
    setError(null)
    cambiarEstado.mutate({ id: pedido.id, estado: nuevo }, { onError: (e) => setError(handleApiError(e)) })
  }

  const columnas = [
    columnHelper.accessor('id', { header: 'N.º', cell: (info) => <span className="font-medium text-slate-900">#{info.getValue()}</span> }),
    columnHelper.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
    columnHelper.accessor('usuario_id', { header: 'Cliente', cell: (info) => `Usuario ${info.getValue()}` }),
    columnHelper.accessor((p) => p.items.reduce((s, i) => s + i.cantidad, 0), { id: 'unidades', header: 'Unidades' }),
    columnHelper.accessor('forma_pago', { header: 'Pago', cell: (info) => ETIQUETA_FORMA_PAGO[info.getValue()] }),
    columnHelper.accessor('total', { header: 'Total', cell: (info) => <span className="tabular-nums">{formatearPrecio(info.getValue())}</span> }),
    columnHelper.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const pedido = row.original
        const procesando = cambiarEstado.isPending && cambiarEstado.variables.id === pedido.id
        return (
          <div className="flex justify-end gap-1">
            <Button variante="fantasma" tamanio="sm" onClick={() => setDetalle(pedido)}>
              Ver
            </Button>
            {TRANSICIONES[pedido.estado].map((siguiente) => (
              <Button
                key={siguiente}
                variante={siguiente === 'CANCELADO' ? 'peligro' : 'primario'}
                tamanio="sm"
                disabled={procesando}
                onClick={() => handleCambiar(pedido, siguiente)}
              >
                {ETIQUETA_ACCION[siguiente]}
              </Button>
            ))}
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: pedidos.data?.items ?? SIN_PEDIDOS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div>
      <EncabezadoPagina
        titulo="Pedidos"
        descripcion="Avanzá los pedidos según su estado. Cancelar repone el stock."
        acciones={
          <div className="w-56">
            <Select
              id="filtro-estado"
              label="Estado"
              value={estado}
              placeholder="Todos"
              opciones={OPCIONES_ESTADO}
              onChange={(valor) => {
                setEstado(valor as EstadoPedido | '')
                table.setPageIndex(0)
              }}
            />
          </div>
        }
      />
      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <TablaDatos
        table={table}
        cargando={pedidos.isPending}
        error={pedidos.error}
        onReintentar={() => void pedidos.refetch()}
        mensajeVacio={estado ? 'No hay pedidos en ese estado.' : 'Todavía no hay pedidos.'}
      />
      <Modal abierto={detalle !== null} titulo={detalle ? `Pedido #${detalle.id}` : ''} onCerrar={() => setDetalle(null)} ancho="lg">
        {detalle && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <BadgeEstado estado={detalle.estado} />
              <span>{formatearFecha(detalle.created_at)}</span>
              <span>Usuario {detalle.usuario_id}</span>
            </div>
            <DetallePedidoLista pedido={detalle} />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminPedidosPage
