
// components/resumo/ItensComErroTable.tsx

'use client'

import { Card } from '@/components/ui/Card'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'

interface ItensComErroTableProps {
  levantamentos: LevantamentoServico[]
  ambientes: Ambiente[]
  servicos: Servico[]
}

function nomeAmbiente(ambientes: Ambiente[], ambienteId: string): string {
  const ambiente = ambientes.find((item) => item.id === ambienteId)
  if (!ambiente) return 'Ambiente não encontrado'
  return ambiente.pavimento ? `${ambiente.pavimento} / ${ambiente.nome}` : ambiente.nome
}

export function ItensComErroTable({ levantamentos, ambientes, servicos }: ItensComErroTableProps) {
  const itensComErro = levantamentos
    .map((levantamento) => {
      const servico = servicos.find((item) => item.id === levantamento.servicoId)

      if (!servico) {
        return {
          levantamento,
          servicoNome: 'Serviço não encontrado',
          erros: ['Serviço não encontrado.'],
        }
      }

      const resultado = calcularLevantamento(levantamento, servico)

      return {
        levantamento,
        servicoNome: servico.nome,
        erros: resultado.erros,
      }
    })
    .filter((item) => item.erros.length > 0)

  if (itensComErro.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Itens com erro</h2>
        <p className="mt-2 text-sm text-emerald-700">Nenhum item com erro no momento.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-slate-900">Itens com erro</h2>
      <p className="mt-1 text-sm text-slate-600">Estes itens não entram no total da obra enquanto tiverem erro.</p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-red-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-red-50 text-red-800">
            <tr>
              <th className="px-4 py-3">Ambiente</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Erros</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {itensComErro.map((item) => (
              <tr key={item.levantamento.id}>
                <td className="px-4 py-3 text-slate-700">{nomeAmbiente(ambientes, item.levantamento.ambienteId)}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{item.servicoNome}</td>
                <td className="px-4 py-3 text-slate-600">{item.levantamento.descricao ?? '-'}</td>
                <td className="px-4 py-3 text-red-700">
                  <ul className="list-inside list-disc">
                    {item.erros.map((erro) => (
                      <li key={erro}>{erro}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}