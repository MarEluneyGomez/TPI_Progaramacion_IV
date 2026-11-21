import EncabezadoPagina from '@/shared/components/EncabezadoPagina'
import EstadoError from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatearPrecio } from '@/shared/utils/formato'
import TarjetaResumen from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <div>
      <EncabezadoPagina titulo="Resumen" descripcion="Indicadores del negocio." />
      {resumen.isPending ? (
        <div role="status" aria-label="Cargando resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError error={resumen.error} onReintentar={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} acento="naranja" />
          <TarjetaResumen
            titulo="Ingresos"
            valor={formatearPrecio(resumen.data.ingresos_entregados)}
            detalle="Suma de los pedidos entregados"
            acento="verde"
          />
          <TarjetaResumen titulo="Pendientes" valor={String(resumen.data.pendientes)} acento="ambar" />
          <TarjetaResumen titulo="En preparación" valor={String(resumen.data.en_preparacion)} acento="azul" />
          <TarjetaResumen titulo="Entregados" valor={String(resumen.data.entregados)} acento="verde" />
          <TarjetaResumen titulo="Cancelados" valor={String(resumen.data.cancelados)} acento="gris" />
        </div>
      )}
    </div>
  )
}

export default AdminResumenPage
