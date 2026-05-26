// components/resumo/ResumoCategoriasTable.tsx

'use client'

import { Card } from '@/components/ui/Card'
import type { ResumoCategoria } from '@/lib/tipos/resumo'
import { formatarMoeda } from '@/lib/utils/formatacao'

interface ResumoCategoriasTableProps {
  categorias: ResumoCategoria[]
}

function nomeCategoria(categoria: string): string {
  const nomes: Record<string, string> = {
    reboco: 'Reboco',
    pisos: 'Pisos',
    revestimentos: 'Revestimentos',
    pintura: 'Pintura',
    muros: 'Muros',
    acabamentos: 'Acabamentos',
    instalacoes: 'Instalações',
    complementacao: 'Complementação',
    outros: 'Outros',
  }

  return nomes[categoria] ?? categoria
}

export function ResumoCategoriasTable({ categorias }: ResumoCategoriasTableProps) {
  if (categorias.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Resumo por categoria</h2>
        <p className="mt-2 text-sm text-slate-600">Nenhum item válido para resumir.</p>
      </Card>
    )
  }

  const categoriasOrdenadas = [...categorias].sort((a, b) => b.total - a.total)

  return (
    <Card>
      <h2 className="text-xl font-semibold text-slate-900">Resumo por categoria</h2>
      <p className="mt-1 text-sm text-slate-600">Totais agrupados pela categoria do serviço.</p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Itens</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-right">BDI</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categoriasOrdenadas.map((categoria) => (
              <tr key={categoria.categoria}>
                <td className="px-4 py-3 font-medium text-slate-900">{nomeCategoria(categoria.categoria)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{categoria.quantidadeItens}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(categoria.subtotal)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(categoria.valorBdi)}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-950">{formatarMoeda(categoria.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}