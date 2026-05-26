// components/levantamento/LevantamentosTable.tsx

'use client'

import { Button } from '@/components/ui/Button'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import { formatarMoeda, formatarNumero } from '@/lib/utils/formatacao'

interface LevantamentosTableProps {
  levantamentos: LevantamentoServico[]
  ambientes: Ambiente[]
  servicos: Servico[]
  onEditar: (levantamento: LevantamentoServico) => void
  onDuplicar: (levantamento: LevantamentoServico) => void
  onExcluir: (levantamentoId: string) => void
  onAbrirVaos: (levantamento: LevantamentoServico) => void
}

function buscarNomeAmbiente(ambientes: Ambiente[], ambienteId: string): string {
  const ambiente = ambientes.find((item) => item.id === ambienteId)
  if (!ambiente) return 'Ambiente não encontrado'

  return ambiente.pavimento ? `${ambiente.pavimento} / ${ambiente.nome}` : ambiente.nome
}

function buscarServico(servicos: Servico[], servicoId: string): Servico | null {
  return servicos.find((item) => item.id === servicoId) ?? null
}

function descreverMedidas(levantamento: LevantamentoServico, servico: Servico | null): string {
  if (!servico) return '-'

  switch (servico.tipoCalculo) {
    case 'parede':
      return `C ${formatarNumero(levantamento.comprimento ?? 0)} × H ${formatarNumero(levantamento.altura ?? 0)}`
    case 'piso':
      return `C ${formatarNumero(levantamento.comprimento ?? 0)} × L ${formatarNumero(levantamento.largura ?? 0)}`
    case 'item_unitario':
      return `Qtd ${formatarNumero(levantamento.quantidade ?? 0)}`
    case 'valor_manual':
      return 'Valor manual'
    case 'comprimento_linear':
      return `C ${formatarNumero(levantamento.comprimento ?? 0)}`
    default:
      return '-'
  }
}

export function LevantamentosTable({
  levantamentos,
  ambientes,
  servicos,
  onEditar,
  onDuplicar,
  onExcluir,
  onAbrirVaos,
}: LevantamentosTableProps) {
  if (levantamentos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        Nenhum levantamento lançado para esta obra.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1200px] text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Ambiente</th>
            <th className="px-4 py-3">Serviço</th>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3">Medidas</th>
            <th className="px-4 py-3 text-right">Saldo</th>
            <th className="px-4 py-3 text-right">Vãos</th>
            <th className="px-4 py-3 text-right">Valor unit.</th>
            <th className="px-4 py-3 text-right">Subtotal</th>
            <th className="px-4 py-3 text-right">BDI</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {levantamentos.map((levantamento) => {
            const servico = buscarServico(servicos, levantamento.servicoId)

            const resultado = servico
              ? calcularLevantamento(levantamento, servico)
              : {
                areaBruta: 0,
                areaDescontada: 0,
                saldo: 0,
                subtotal: 0,
                valorBdi: 0,
                total: 0,
                erros: ['Serviço não encontrado.'],
              }

            const temErro = resultado.erros.length > 0

            return (
              <tr key={levantamento.id} className={temErro ? 'bg-red-50' : ''}>
                <td className="px-4 py-3 text-slate-700">
                  {buscarNomeAmbiente(ambientes, levantamento.ambienteId)}
                </td>

                <td className="px-4 py-3 font-medium text-slate-900">
                  {servico?.nome ?? 'Serviço não encontrado'}
                </td>

                <td className="px-4 py-3 text-slate-600">{levantamento.descricao ?? '-'}</td>

                <td className="px-4 py-3 text-slate-600">{descreverMedidas(levantamento, servico)}</td>

                <td className="px-4 py-3 text-right text-slate-700">
                  {formatarNumero(resultado.saldo)} {servico?.unidade ?? levantamento.unidade}
                </td>

                <td className="px-4 py-3 text-right text-slate-700">
                  <div className="flex flex-col items-end gap-2">
                    <span>{formatarNumero(resultado.areaDescontada)} m²</span>

                    {servico?.tipoCalculo === 'parede' ? (
                      <Button type="button" variant="secondary" onClick={() => onAbrirVaos(levantamento)}>
                        Vãos
                      </Button>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-3 text-right text-slate-700">
                  {formatarMoeda(levantamento.valorUnitario)}
                </td>

                <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(resultado.subtotal)}</td>

                <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(resultado.valorBdi)}</td>

                <td className="px-4 py-3 text-right font-semibold text-slate-950">
                  {formatarMoeda(resultado.total)}
                </td>

                <td className="px-4 py-3">
                  {temErro ? (
                    <span
                      className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                      title={resultado.erros.join(' | ')}
                    >
                      Erro
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      Válido
                    </span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {servico?.tipoCalculo === 'parede' ? (
                      <Button type="button" variant="ghost" onClick={() => onAbrirVaos(levantamento)}>
                        Vãos
                      </Button>
                    ) : null}

                    <Button type="button" variant="secondary" onClick={() => onEditar(levantamento)}>
                      Editar
                    </Button>

                    <Button type="button" variant="ghost" onClick={() => onDuplicar(levantamento)}>
                      Duplicar
                    </Button>

                    <Button type="button" variant="danger" onClick={() => onExcluir(levantamento.id)}>
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}