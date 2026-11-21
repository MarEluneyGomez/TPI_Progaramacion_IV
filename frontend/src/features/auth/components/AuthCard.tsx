import type { ReactNode } from 'react'
import Card from '@/shared/ui/Card'

type AuthCardProps = {
  titulo: string
  subtitulo: string
  children: ReactNode
  pie: ReactNode
}

function AuthCard({ titulo, subtitulo, children, pie }: AuthCardProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col py-6">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">{subtitulo}</p>
        {children}
      </Card>
      <p className="mt-4 text-center text-sm text-slate-600">{pie}</p>
    </div>
  )
}

export default AuthCard
