// components/resumo/ResumoGeralCard.tsx

'use client'

import { Card } from '@/components/ui/Card'
import type { ResumoObra } from '@/lib/tipos/resumo'
import { formatarMoeda } from '@/lib/utils/formatacao'

interface ResumoGeralCardProps {
  resumo: ResumoObra
}

export function ResumoGeralCard({ resumo }: ResumoGeralCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">Subtotal</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{formatarMoeda(resumo.subtotal)}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">BDI total</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{formatarMoeda(resumo.valorBdi)}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">Total geral</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{formatarMoeda(resumo.total)}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">Itens válidos</p>
        <p className="mt-2 text-2xl font-bold text-emerald-700">{resumo.quantidadeItens}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-500">Itens com erro</p>
        <p className={`mt-2 text-2xl font-bold ${resumo.quantidadeItensComErro > 0 ? 'text-red-700' : 'text-slate-950'}`}>
          {resumo.quantidadeItensComErro}
        </p>
      </Card>
    </div>
  )
}

