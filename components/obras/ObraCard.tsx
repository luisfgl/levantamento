// components/obras/ObraCard.tsx

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Obra } from '@/lib/tipos/obra'
import { formatarPercentual } from '@/lib/utils/formatacao'

interface ObraCardProps {
  obra: Obra
  onExcluir: (obraId: string) => void
}

export function ObraCard({ obra, onExcluir }: ObraCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{obra.nome}</h3>
          <p className="text-sm text-slate-600">Cliente: {obra.cliente}</p>
          {obra.endereco ? <p className="text-sm text-slate-600">Endereço: {obra.endereco}</p> : null}
          <p className="text-sm text-slate-600">BDI padrão: {formatarPercentual(obra.bdiPadraoPercentual)}</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">Status: {obra.status}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/obras/${obra.id}`}>
            <Button type="button" variant="secondary">Abrir</Button>
          </Link>
          <Button type="button" variant="danger" onClick={() => onExcluir(obra.id)}>
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  )
}