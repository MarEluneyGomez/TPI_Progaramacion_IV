import { flexRender, type SortDirection, type Table } from '@tanstack/react-table'
import EstadoError from './EstadoError'
import EstadoVacio from './EstadoVacio'
import Paginacion from './Paginacion'
import { SkeletonFilas } from './Skeleton'

type TablaDatosProps<T> = {
  table: Table<T>
  cargando: boolean
  error: unknown
  onReintentar: () => void
  mensajeVacio: string
}

function simboloOrden(orden: false | SortDirection): string {
  if (orden === 'asc') return '▲'
  if (orden === 'desc') return '▼'
  return '↕'
}

function TablaDatos<T>({ table, cargando, error, onReintentar, mensajeVacio }: TablaDatosProps<T>) {
  if (cargando) return <SkeletonFilas />
  if (error) return <EstadoError error={error} onReintentar={onReintentar} />
  if (table.getCoreRowModel().rows.length === 0) return <EstadoVacio titulo={mensajeVacio} />

  const { pageIndex } = table.getState().pagination

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} scope="col" className={`px-4 py-3 ${header.column.id === 'acciones' ? 'text-right' : ''}`}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 uppercase hover:text-slate-800">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span aria-hidden="true">{simboloOrden(header.column.getIsSorted())}</span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="hover:bg-slate-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 align-middle text-slate-700">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={pageIndex}
        totalPaginas={table.getPageCount()}
        onCambiar={(p) => table.setPageIndex(p)}
        totalItems={table.getPrePaginationRowModel().rows.length}
      />
    </div>
  )
}

export default TablaDatos
