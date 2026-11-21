import { useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import { Skeleton } from '@/shared/components/Skeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import Select from '@/shared/ui/Select'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMITE = 8

function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const busquedaDiferida = useDebouncedValue(busqueda.trim())

  const categorias = useCategorias()
  const productos = useProductos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: busquedaDiferida || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
  })

  const totalPaginas = productos.data ? Math.ceil(productos.data.total / LIMITE) : 0
  const hayFiltros = busqueda !== '' || categoriaId !== ''

  function limpiarFiltros() {
    setBusqueda('')
    setCategoriaId('')
    setPagina(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catálogo</h1>
        <p className="mt-1 text-sm text-slate-500">Elegí tus productos y agregalos al carrito.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
        <Input
          id="busqueda"
          label="Buscar"
          type="search"
          placeholder="Ej: pizza"
          value={busqueda}
          onChange={(valor) => {
            setBusqueda(valor)
            setPagina(0)
          }}
        />
        <Select
          id="categoria"
          label="Categoría"
          value={categoriaId}
          placeholder="Todas"
          opciones={(categorias.data ?? []).map((c) => ({ valor: String(c.id), etiqueta: c.nombre }))}
          onChange={(valor) => {
            setCategoriaId(valor)
            setPagina(0)
          }}
        />
      </div>

      {productos.isPending ? (
        <div role="status" aria-label="Cargando productos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMITE }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion={hayFiltros ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
          accion={
            hayFiltros && (
              <Button variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${productos.isPlaceholderData ? 'opacity-60' : ''}`}>
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} totalItems={productos.data.total} />
        </>
      )}
    </div>
  )
}

export default CatalogoPage
