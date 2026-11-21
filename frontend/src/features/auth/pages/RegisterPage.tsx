import { useForm } from '@tanstack/react-form'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { erroresDe, validarLargo } from '@/shared/utils/formularios'
import { useAuthStore } from '@/store/authStore'
import AuthCard from '../components/AuthCard'
import MensajeError from '../components/MensajeError'
import { useRegistro } from '../hooks/useRegistro'
import type { UserCreate } from '../types/auth.types'

const VALORES_INICIALES: UserCreate = { username: '', full_name: '', email: '', password: '' }

function validarUsername(valor: string): string | undefined {
  const largo = validarLargo(valor, 'El usuario', 3, 50)
  if (largo) return largo
  return /^[A-Za-z0-9_.-]+$/.test(valor.trim()) ? undefined : 'Solo letras, números, punto, guion y guion bajo'
}

function validarEmail(valor: string): string | undefined {
  if (!valor.trim()) return 'El email es obligatorio'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()) ? undefined : 'Ingresá un email válido'
}

function validarPassword(valor: string): string | undefined {
  if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  return new TextEncoder().encode(valor).length > 72 ? 'La contraseña es demasiado larga' : undefined
}

function RegisterPage() {
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()
  const registro = useRegistro()

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      try {
        const creado = await registro.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { replace: true, state: { registrado: creado.username } })
      } catch {
        return
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <AuthCard
      titulo="Crear cuenta"
      subtitulo="Registrate para hacer pedidos."
      pie={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-700 hover:text-orange-800">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <form.Field name="username" validators={{ onChange: ({ value }) => validarUsername(value) }}>
          {(field) => (
            <Input
              id="username"
              label="Usuario"
              autoComplete="username"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errores={erroresDe(field.state.meta)}
              maxLength={50}
              autoFocus
            />
          )}
        </form.Field>
        <form.Field name="full_name" validators={{ onChange: ({ value }) => validarLargo(value, 'El nombre completo', 1, 120) }}>
          {(field) => (
            <Input
              id="full_name"
              label="Nombre completo"
              autoComplete="name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errores={erroresDe(field.state.meta)}
              maxLength={120}
            />
          )}
        </form.Field>
        <form.Field name="email" validators={{ onChange: ({ value }) => validarEmail(value) }}>
          {(field) => (
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errores={erroresDe(field.state.meta)}
              maxLength={254}
            />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => validarPassword(value) }}>
          {(field) => (
            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errores={erroresDe(field.state.meta)}
              ayuda="Al menos 8 caracteres."
            />
          )}
        </form.Field>
        <MensajeError mensaje={registro.isError ? handleApiError(registro.error) : null} />
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeEnviar, enviando]) => (
            <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
              Crear cuenta
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  )
}

export default RegisterPage
