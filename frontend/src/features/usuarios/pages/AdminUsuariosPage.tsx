import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '@/shared/api/handleApiError'
import EncabezadoPagina from '@/shared/components/EncabezadoPagina'
import TablaDatos from '@/shared/components/TablaDatos'
import Button from '@/shared/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { BadgeEstadoUsuario, BadgeRol } from '../components/BadgesUsuario'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { UserPublic } from '../types/usuario.types'

const SIN_USUARIOS: UserPublic[] = []
const columnHelper = createColumnHelper<UserPublic>()

function AdminUsuariosPage() {
  const idSesion = useAuthStore((state) => state.usuario?.id)
  const usuarios = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleCambiarEstado(usuario: UserPublic) {
    const accion = usuario.disabled ? 'Activar' : 'Desactivar'
    if (!window.confirm(`¿${accion} a ${usuario.username}?`)) return
    setError(null)
    cambiarEstado.mutate(usuario, { onError: (e) => setError(handleApiError(e)) })
  }

  const columnas = [
    columnHelper.accessor('username', { header: 'Usuario', cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span> }),
    columnHelper.accessor('full_name', { header: 'Nombre' }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', { header: 'Rol', cell: (info) => <BadgeRol rol={info.getValue()} /> }),
    columnHelper.accessor('disabled', {
      header: 'Estado',
      enableGlobalFilter: false,
      cell: (info) => <BadgeEstadoUsuario desactivado={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const usuario = row.original
        const procesando = cambiarEstado.isPending && cambiarEstado.variables.id === usuario.id
        if (usuario.disabled) {
          return (
            <div className="flex justify-end">
              <Button variante="secundario" tamanio="sm" cargando={procesando} onClick={() => handleCambiarEstado(usuario)}>
                Activar
              </Button>
            </div>
          )
        }
        // El admin no puede desactivarse a sí mismo: el botón no se muestra en su fila
        if (usuario.id === idSesion) return <p className="text-right text-xs text-slate-400">Tu cuenta</p>
        return (
          <div className="flex justify-end">
            <Button variante="peligro" tamanio="sm" cargando={procesando} onClick={() => handleCambiarEstado(usuario)}>
              Desactivar
            </Button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: usuarios.data ?? SIN_USUARIOS,
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

  return (
    <div>
      <EncabezadoPagina titulo="Usuarios" descripcion="Activá o desactivá cuentas. Una cuenta desactivada no puede iniciar sesión." />
      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por usuario, nombre o email..."
        aria-label="Buscar usuarios"
        className="mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:max-w-xs"
      />
      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <TablaDatos
        table={table}
        cargando={usuarios.isPending}
        error={usuarios.error}
        onReintentar={() => void usuarios.refetch()}
        mensajeVacio="No hay usuarios."
      />
    </div>
  )
}

export default AdminUsuariosPage
