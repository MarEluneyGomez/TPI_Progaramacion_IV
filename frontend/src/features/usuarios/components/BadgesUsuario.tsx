import type { Rol } from '../types/usuario.types'

export function BadgeRol({ rol }: { rol: Rol }) {
  const clase = rol === 'admin' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${clase}`}>{rol}</span>
}

export function BadgeEstadoUsuario({ desactivado }: { desactivado: boolean }) {
  return desactivado ? (
    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Desactivado</span>
  ) : (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Activo</span>
  )
}
