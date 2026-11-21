import type { EstadoPedido } from '@/features/pedidos/types/pedido.types'

const ESTILOS: Record<EstadoPedido, { clase: string; etiqueta: string }> = {
  PENDIENTE: { clase: 'bg-amber-50 text-amber-700 ring-amber-200', etiqueta: 'Pendiente' },
  EN_PREPARACION: { clase: 'bg-blue-50 text-blue-700 ring-blue-200', etiqueta: 'En preparación' },
  ENTREGADO: { clase: 'bg-emerald-50 text-emerald-700 ring-emerald-200', etiqueta: 'Entregado' },
  CANCELADO: { clase: 'bg-slate-100 text-slate-600 ring-slate-200', etiqueta: 'Cancelado' },
}

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { clase, etiqueta } = ESTILOS[estado]
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${clase}`}>{etiqueta}</span>
}

export default BadgeEstado
