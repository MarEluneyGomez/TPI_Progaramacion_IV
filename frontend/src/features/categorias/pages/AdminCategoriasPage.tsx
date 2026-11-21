import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '@/shared/api/handleApiError'
import EncabezadoPagina from '@/shared/components/EncabezadoPagina'
import TablaDatos from '@/shared/components/TablaDatos'
import Button from '@/shared/ui/Button'
import Modal from '@/shared/ui/Modal'
import CategoriaForm from '../components/CategoriaForm'
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks/useCategorias'
import type { CategoriaCreate, CategoriaRead } from '../types/categoria.types'

type ModalAbierto = { categoria: CategoriaRead | null } | null

const SIN_CATEGORIAS: CategoriaRead[] = []
const columnHelper = createColumnHelper<CategoriaRead>()

function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()
  const [modal, setModal] = useState<ModalAbierto>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  const columnas = [
    columnHelper.accessor('id', { header: 'Id' }),
    columnHelper.accessor('nombre', { header: 'Nombre', cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span> }),
    columnHelper.accessor('descripcion', {
      header: 'Descripción',
      enableSorting: false,
      cell: (info) => info.getValue() || <span className="italic text-slate-400">Sin descripción</span>,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variante="fantasma" tamanio="sm" onClick={() => abrir(row.original)}>
            Editar
          </Button>
          <Button variante="fantasma" tamanio="sm" className="text-red-600" onClick={() => handleEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: categorias.data ?? SIN_CATEGORIAS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  })

  function abrir(categoria: CategoriaRead | null) {
    crear.reset()
    actualizar.reset()
    setModal({ categoria })
  }

  async function guardar(datos: CategoriaCreate) {
    try {
      if (modal?.categoria) await actualizar.mutateAsync({ id: modal.categoria.id, datos })
      else await crear.mutateAsync(datos)
      setModal(null)
    } catch {
      return
    }
  }

  function handleEliminar(categoria: CategoriaRead) {
    const aviso = 'La baja no oculta sus productos: para retirarlos del catálogo, dalos de baja también.'
    if (!window.confirm(`¿Dar de baja la categoría "${categoria.nombre}"? ${aviso}`)) return
    setErrorEliminar(null)
    eliminar.mutate(categoria.id, { onError: (e) => setErrorEliminar(handleApiError(e)) })
  }

  const errorFormulario = crear.isError ? handleApiError(crear.error) : actualizar.isError ? handleApiError(actualizar.error) : null

  return (
    <div>
      <EncabezadoPagina
        titulo="Categorías"
        descripcion="Categorías activas del catálogo. La baja es lógica y no libera el nombre."
        acciones={<Button onClick={() => abrir(null)}>+ Nueva categoría</Button>}
      />
      {errorEliminar && <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorEliminar}</p>}
      <TablaDatos
        table={table}
        cargando={categorias.isPending}
        error={categorias.error}
        onReintentar={() => void categorias.refetch()}
        mensajeVacio="Todavía no hay categorías."
      />
      <Modal abierto={modal !== null} titulo={modal?.categoria ? 'Editar categoría' : 'Nueva categoría'} onCerrar={() => setModal(null)}>
        {modal && (
          <CategoriaForm
            key={modal.categoria?.id ?? 'nueva'}
            categoria={modal.categoria}
            error={errorFormulario}
            onGuardar={guardar}
            onCancelar={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}

export default AdminCategoriasPage
