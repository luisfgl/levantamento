// components/obras/ObrasList.tsx

'use client'

import { ObraCard } from './ObraCard'
import type { Obra } from '@/lib/tipos/obra'

interface ObrasListProps {
  obras: Obra[]
  onExcluir: (obraId: string) => void
}

export function ObrasList({ obras, onExcluir }: ObrasListProps) {
  if (obras.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
        Nenhuma obra cadastrada ainda.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {obras.map((obra) => (
        <ObraCard key={obra.id} obra={obra} onExcluir={onExcluir} />
      ))}
    </div>
  )
}