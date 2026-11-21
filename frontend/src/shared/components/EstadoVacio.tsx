import type { ReactNode } from 'react'

type EstadoVacioProps = {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-medium text-slate-700">{titulo}</p>
      {descripcion && <p className="text-sm text-slate-500">{descripcion}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  )
}

export default EstadoVacio
