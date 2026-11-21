import { useState } from 'react'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import type { ProductoRead } from '../types/producto.types'

function ProductoCard({ producto }: { producto: ProductoRead }) {
  const agregar = useCartStore((state) => state.agregar)
  const enCarrito = useCartStore((state) => state.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock === 0
  const vendible = producto.disponible && !sinStock
  const alcanzoElStock = enCarrito >= producto.stock

  function handleAgregar() {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock: producto.stock,
      imagen_url: producto.imagen_url,
    })
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl" aria-hidden="true">
            🍽️
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-orange-700">{producto.categoria.nombre}</p>
          <h2 className="font-semibold text-slate-900">{producto.nombre}</h2>
          {producto.descripcion && <p className="mt-1 text-sm text-slate-500">{producto.descripcion}</p>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-lg font-bold text-slate-900">{formatearPrecio(producto.precio_base)}</p>
            <p className={`text-xs ${vendible ? 'text-slate-500' : 'text-red-600'}`}>
              {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `${producto.stock} disponibles`}
            </p>
          </div>
          <Button tamanio="sm" onClick={handleAgregar} disabled={!vendible || alcanzoElStock}>
            {enCarrito > 0 ? `Agregar (${enCarrito})` : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ProductoCard
