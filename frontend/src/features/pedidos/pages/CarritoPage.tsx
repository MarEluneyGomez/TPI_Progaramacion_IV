import { Link, useNavigate } from 'react-router-dom'
import EncabezadoPagina from '@/shared/components/EncabezadoPagina'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import ItemCarritoFila from '../components/ItemCarritoFila'

function CarritoPage() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total())
  const vaciar = useCartStore((state) => state.vaciar)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div>
        <EncabezadoPagina titulo="Carrito" />
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo."
          accion={
            <Link to="/" className="inline-block rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
              Ir al catálogo
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <EncabezadoPagina
        titulo="Carrito"
        descripcion="Los precios se confirman al crear el pedido."
        acciones={
          <Button variante="secundario" onClick={() => window.confirm('¿Vaciar el carrito?') && vaciar()}>
            Vaciar carrito
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="px-5">
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <ItemCarritoFila key={item.producto_id} item={item} />
            ))}
          </ul>
        </Card>
        <Card className="h-fit space-y-4 p-5">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatearPrecio(total)}</span>
          </div>
          <Button className="w-full" onClick={() => navigate('/checkout')}>
            Continuar con el pedido
          </Button>
          <Link to="/" className="block text-center text-sm text-orange-700 hover:text-orange-800">
            Seguir comprando
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default CarritoPage
