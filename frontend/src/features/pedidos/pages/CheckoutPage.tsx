import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import EncabezadoPagina from '@/shared/components/EncabezadoPagina'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import CheckoutForm, { type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total())
  const vaciar = useCartStore((state) => state.vaciar)
  const esAdmin = useAuthStore((state) => state.usuario?.role === 'admin')
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  async function confirmar(datos: DatosCheckout) {
    try {
      const pedido = await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega,
        notas: datos.notas || null,
      })
      vaciar()
      navigate(esAdmin ? '/admin/pedidos' : '/mis-pedidos', { replace: true, state: { creado: pedido.id } })
    } catch {
      return
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <EncabezadoPagina titulo="Confirmar pedido" />
        <EstadoVacio
          titulo="No hay productos para confirmar"
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
      <EncabezadoPagina titulo="Confirmar pedido" descripcion="Indicá dónde entregarlo y cómo vas a pagar. El pago es al recibir o por transferencia." />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="p-5">
          <CheckoutForm error={crearPedido.isError ? handleApiError(crearPedido.error) : null} onConfirmar={confirmar} />
        </Card>
        <Card className="h-fit p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Tu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-2">
                <span className="text-slate-700">
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="tabular-nums">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatearPrecio(total)}</span>
          </div>
          <Link to="/carrito" className="mt-3 block text-center text-sm text-orange-700 hover:text-orange-800">
            Modificar carrito
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default CheckoutPage
