import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import EncabezadoPagina from '@/shared/components/EncabezadoPagina'
import TablaDatos from '@/shared/components/TablaDatos'
import Button from '@/shared/ui/Button'
import Modal from '@/shared/ui/Modal'
import { formatearPrecio } from '@/shared/utils/formato'
import ProductoForm from '../components/ProductoForm'
import StockForm from '../components/StockForm'
import { useActualizarProducto, useActualizarStock, useCrearProducto, useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { ProductoCreate, ProductoRead, ProductoStockUpdate } from '../types/producto.types'

type ModalAbierto = { tipo: 'crear' } | { tipo: 'editar'; producto: ProductoRead } | { tipo: 'stock'; producto: ProductoRead } | null

const SIN_PRODUCTOS: ProductoRead[] = []

const columnHelper = createColumnHelper<ProductoRead>()

function AdminProductosPage() {
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const cambiarStock = useActualizarStock()
  const eliminar = useEliminarProducto()
  const [modal, setModal] = useState<ModalAbierto>(null)
  const [busqueda, setBusqueda] = useState('')
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  const columnas = [
    columnHelper.accessor('nombre', {
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900">{row.original.nombre}</p>
          {row.original.descripcion && <p className="max-w-xs truncate text-xs text-slate-500">{row.original.descripcion}</p>}
        </div>
      ),
    }),
    columnHelper.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
    columnHelper.accessor('precio_base', { header: 'Precio', cell: (info) => <span className="tabular-nums">{formatearPrecio(info.getValue())}</span> }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      cell: (info) => <span className={`tabular-nums ${info.getValue() === 0 ? 'font-semibold text-red-600' : ''}`}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('disponible', {
      header: 'Disponible',
      enableGlobalFilter: false,
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Sí</span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">No</span>
        ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variante="fantasma" tamanio="sm" onClick={() => abrir({ tipo: 'editar', producto: row.original })}>
            Editar
          </Button>
          <Button variante="fantasma" tamanio="sm" onClick={() => abrir({ tipo: 'stock', producto: row.original })}>
            Stock
          </Button>
          <Button variante="fantasma" tamanio="sm" className="text-red-600" onClick={() => handleEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: productos.data?.items ?? SIN_PRODUCTOS,
    columns: columnas,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  })

  function abrir(nuevo: ModalAbierto) {
    crear.reset()
    actualizar.reset()
    cambiarStock.reset()
    setModal(nuevo)
  }

  async function guardarProducto(datos: ProductoCreate) {
    try {
      if (modal?.tipo === 'editar') await actualizar.mutateAsync({ id: modal.producto.id, datos })
      else await crear.mutateAsync(datos)
      setModal(null)
    } catch {
      return
    }
  }

  async function guardarStock(datos: ProductoStockUpdate) {
    if (modal?.tipo !== 'stock') return
    try {
      await cambiarStock.mutateAsync({ id: modal.producto.id, datos })
      setModal(null)
    } catch {
      return
    }
  }

  function handleEliminar(producto: ProductoRead) {
    if (!window.confirm(`¿Dar de baja "${producto.nombre}"? Deja de aparecer en el catálogo.`)) return
    setErrorEliminar(null)
    eliminar.mutate(producto.id, { onError: (e) => setErrorEliminar(handleApiError(e)) })
  }

  const errorFormulario = crear.isError ? handleApiError(crear.error) : actualizar.isError ? handleApiError(actualizar.error) : null

  return (
    <div>
      <EncabezadoPagina
        titulo="Productos"
        descripcion="Alta, edición, stock y baja lógica de los productos del catálogo."
        acciones={<Button onClick={() => abrir({ tipo: 'crear' })}>+ Nuevo producto</Button>}
      />
      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar en la tabla..."
        aria-label="Buscar en la tabla"
        className="mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:max-w-xs"
      />
      {errorEliminar && <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorEliminar}</p>}
      <TablaDatos
        table={table}
        cargando={productos.isPending}
        error={productos.error}
        onReintentar={() => void productos.refetch()}
        mensajeVacio="Todavía no hay productos."
      />

      <Modal
        abierto={modal?.tipo === 'crear' || modal?.tipo === 'editar'}
        titulo={modal?.tipo === 'editar' ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={() => setModal(null)}
        ancho="lg"
      >
        {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
          <ProductoForm
            key={modal.tipo === 'editar' ? modal.producto.id : 'nuevo'}
            producto={modal.tipo === 'editar' ? modal.producto : null}
            categorias={categorias.data ?? []}
            error={errorFormulario}
            onGuardar={guardarProducto}
            onCancelar={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal abierto={modal?.tipo === 'stock'} titulo="Stock y disponibilidad" onCerrar={() => setModal(null)}>
        {modal?.tipo === 'stock' && (
          <StockForm
            producto={modal.producto}
            error={cambiarStock.isError ? handleApiError(cambiarStock.error) : null}
            onGuardar={guardarStock}
            onCancelar={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}

export default AdminProductosPage
