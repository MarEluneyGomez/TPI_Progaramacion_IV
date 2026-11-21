import { formatearPrecio } from '@/shared/utils/formato'
import { ETIQUETA_FORMA_PAGO, type Pedido } from '../types/pedido.types'

function DetallePedidoLista({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-3 text-sm">
      <dl className="grid gap-x-6 gap-y-1 text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-slate-700">Entrega: </dt>
          <dd className="inline">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-700">Pago: </dt>
          <dd className="inline">{ETIQUETA_FORMA_PAGO[pedido.forma_pago]}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="inline font-medium text-slate-700">Notas: </dt>
            <dd className="inline">{pedido.notas}</dd>
          </div>
        )}
      </dl>
      <table className="w-full">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="py-1 font-semibold">Producto</th>
            <th className="py-1 text-right font-semibold">Precio</th>
            <th className="py-1 text-right font-semibold">Cant.</th>
            <th className="py-1 text-right font-semibold">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-1.5 text-slate-800">{item.nombre_producto}</td>
              <td className="py-1.5 text-right tabular-nums">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-1.5 text-right tabular-nums">{item.cantidad}</td>
              <td className="py-1.5 text-right tabular-nums">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 font-semibold text-slate-900">
            <td className="pt-2" colSpan={3}>
              Total
            </td>
            <td className="pt-2 text-right tabular-nums">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default DetallePedidoLista
