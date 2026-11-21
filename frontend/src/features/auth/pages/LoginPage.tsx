import { useForm } from '@tanstack/react-form'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { erroresDe, validarLargo } from '@/shared/utils/formularios'
import { useAuthStore } from '@/store/authStore'
import AuthCard from '../components/AuthCard'
import MensajeError from '../components/MensajeError'
import type { LoginCredentials, Rol } from '../types/auth.types'

type EstadoNavegacion = { desde?: string; registrado?: string } | null

function destinoTrasLogin(rol: Rol, estado: EstadoNavegacion): string {
  return estado?.desde ?? (rol === 'admin' ? '/admin/resumen' : '/')
}

function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const estado = useLocation().state as EstadoNavegacion
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: estado?.registrado ?? '', password: '' } satisfies LoginCredentials,
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const sesion = await login(value.username.trim(), value.password)
        navigate(destinoTrasLogin(sesion.role, estado), { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario) return <Navigate to={destinoTrasLogin(usuario.role, estado)} replace />

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <AuthCard
      titulo="Iniciar sesión"
      subtitulo="Ingresá con tu usuario y tu contraseña."
      pie={
        <>
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-700 hover:text-orange-800">
            Registrate
          </Link>
        </>
      }
    >
      {estado?.registrado && !error && (
        <p role="status" className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Cuenta creada. Ya podés iniciar sesión.
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <form.Field name="username" validators={{ onChange: ({ value }) => validarLargo(value, 'El usuario', 1, 50) }}>
          {(field) => (
            <Input
              id="username"
              label="Usuario"
              autoComplete="username"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errores={erroresDe(field.state.meta)}
              autoFocus={!estado?.registrado}
            />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => (value ? undefined : 'La contraseña es obligatoria') }}>
          {(field) => (
            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errores={erroresDe(field.state.meta)}
              autoFocus={Boolean(estado?.registrado)}
            />
          )}
        </form.Field>
        <MensajeError mensaje={error} />
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeEnviar, enviando]) => (
            <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  )
}

export default LoginPage
