import { Link } from 'react-router-dom'

function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <p className="text-5xl font-bold text-slate-300">403</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Acceso denegado</h1>
      <p className="mt-2 text-sm text-slate-500">No tenés permisos para ver esta página.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
        Volver al inicio
      </Link>
    </div>
  )
}

export default UnauthorizedPage
