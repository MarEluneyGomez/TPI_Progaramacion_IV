import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`

const ENLACES_ADMIN = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

function Navbar() {
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  const cantidadEnCarrito = useCartStore((state) => state.items.reduce((suma, i) => suma + i.cantidad, 0))
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [cerrando, setCerrando] = useState(false)
  const esAdmin = usuario?.role === 'admin'

  async function handleLogout() {
    setCerrando(true)
    try {
      await logout()
    } finally {
      setCerrando(false)
      queryClient.removeQueries({ queryKey: ['pedidos'] })
      queryClient.removeQueries({ queryKey: ['usuarios'] })
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white" aria-hidden="true">
            FS
          </span>
          <span className="text-lg font-bold text-slate-900">Food Store</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Principal">
          <NavLink to="/" end className={claseEnlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseEnlace}>
            Carrito
            {cantidadEnCarrito > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs font-semibold text-white">{cantidadEnCarrito}</span>
            )}
          </NavLink>
          {usuario && !esAdmin && (
            <NavLink to="/mis-pedidos" className={claseEnlace}>
              Mis pedidos
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-medium text-slate-900">{usuario.full_name}</p>
                <p className={`text-xs font-medium ${esAdmin ? 'text-orange-700' : 'text-slate-500'}`}>{esAdmin ? 'Administrador' : 'Cliente'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={cerrando}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {cerrando ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseEnlace}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseEnlace}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>

      {esAdmin && (
        <div className="border-t border-slate-100 bg-slate-50">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-1.5 sm:px-6" aria-label="Panel de administración">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Panel</span>
            {ENLACES_ADMIN.map((e) => (
              <NavLink key={e.to} to={e.to} className={claseEnlace}>
                {e.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
