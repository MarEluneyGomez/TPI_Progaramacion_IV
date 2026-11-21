import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import UnauthorizedPage from '@/features/auth/pages/UnauthorizedPage'
import CarritoPage from '@/features/pedidos/pages/CarritoPage'
import CheckoutPage from '@/features/pedidos/pages/CheckoutPage'
import MisPedidosPage from '@/features/pedidos/pages/MisPedidosPage'
import CatalogoPage from '@/features/productos/pages/CatalogoPage'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import MainLayout from '@/shared/layout/MainLayout'
import ProtectedRoute from './ProtectedRoute'

const AdminResumenPage = lazy(() => import('@/features/pedidos/pages/AdminResumenPage'))
const AdminCategoriasPage = lazy(() => import('@/features/categorias/pages/AdminCategoriasPage'))
const AdminProductosPage = lazy(() => import('@/features/productos/pages/AdminProductosPage'))
const AdminPedidosPage = lazy(() => import('@/features/pedidos/pages/AdminPedidosPage'))
const AdminUsuariosPage = lazy(() => import('@/features/usuarios/pages/AdminUsuariosPage'))

function Diferida({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SkeletonFilas />}>{children}</Suspense>
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Navigate to="/admin/resumen" replace />} />
            <Route path="/admin/resumen" element={<Diferida><AdminResumenPage /></Diferida>} />
            <Route path="/admin/categorias" element={<Diferida><AdminCategoriasPage /></Diferida>} />
            <Route path="/admin/productos" element={<Diferida><AdminProductosPage /></Diferida>} />
            <Route path="/admin/pedidos" element={<Diferida><AdminPedidosPage /></Diferida>} />
            <Route path="/admin/usuarios" element={<Diferida><AdminUsuariosPage /></Diferida>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
