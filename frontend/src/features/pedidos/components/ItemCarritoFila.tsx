import Button from '@/shared/ui/Button'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore, type ItemCarrito } from '@/store/cartStore'

function ItemCarritoFila({ item }: { item: ItemCarrito }) {
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad)
  const quitar = useCartStore((state) => state.quitar)

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
        {item.imagen_url ? <img src={item.imagen_url} alt="" className="h-full w-full object-cover" /> : <span aria-hidden="true">🍽️</span>}
      </div>
      <div className="min-w-40 flex-1">
        <p className="font-medium text-slate-900">{item.nombre}</p>
        <p className="text-sm text-slate-500">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>
      <div className="flex items-center gap-2" role="group" aria-label={`Cantidad de ${item.nombre}`}>
        <Button variante="secundario" tamanio="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)} disabled={item.cantidad <= 1} aria-label="Restar uno">
          −
        </Button>
        <span className="w-8 text-center tabular-nums">{item.cantidad}</span>
        <Button variante="secundario" tamanio="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)} disabled={item.cantidad >= item.stock} aria-label="Sumar uno">
          +
        </Button>
      </div>
      <p className="w-28 text-right font-semibold tabular-nums text-slate-900">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>
      <Button variante="fantasma" tamanio="sm" className="text-red-600" onClick={() => quitar(item.producto_id)}>
        Quitar
      </Button>
    </li>
  )
}

export default ItemCarritoFila
