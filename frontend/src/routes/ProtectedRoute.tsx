import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/features/auth/types/auth.types'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { useAuthStore } from '@/store/authStore'

type ProtectedRouteProps = {
  allowedRoles?: Rol[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario)
  const cargando = useAuthStore((state) => state.cargando)
  const location = useLocation()

  if (cargando) return <SkeletonFilas filas={4} />

  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />

  if (allowedRoles && !allowedRoles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}

export default ProtectedRoute
