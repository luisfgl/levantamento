// components/levantamento/LevantamentosTable.tsx

'use client'

import { calcularLevantamento } from '@/lib/calculos/levantamento'
import { Button } from '@/components/ui/Button'
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
}

function obterNomeAmbiente(ambientes: Ambiente[], ambienteId: string): string {
  const ambiente = ambientes.find((item) => item.id === ambienteId)
  if (!ambiente) return 'Ambiente não encontrado'
  return `${ambiente.pavimento ? `${ambiente.pavimento} / ` : ''}${ambiente.nome}`
}

function descreverDimensoes(levantamento: LevantamentoServico, servico?: Servico): string {
  if (!servico) return '-'

  if (servico.tipoCalculo === 'parede') {
    return `C ${levantamento.comprimento ?? '-'} × H ${levantamento.altura ?? '-'}`
  }

  if (servico.tipoCalculo === 'piso') {
    return `C ${levantamento.comprimento ?? '-'} × L ${levantamento.largura ?? '-'}`
  }

  if (servico.tipoCalculo === 'item_unitario') {
    return `Qtd ${levantamento.quantidade ?? '-'}`
  }

  if (servico.tipoCalculo === 'valor_manual') {
    return `Manual ${formatarMoeda(levantamento.valorManual ?? 0)}`
  }

  if (servico.tipoCalculo === 'comprimento_linear') {
    return `C ${levantamento.comprimento ?? '-'}`
  }

  return '-'
}

export function LevantamentosTable({
  levantamentos,
  ambientes,
  servicos,
  onEditar,
  onDuplicar,
  onExcluir,
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
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Ambiente</th>
            <th className="px-4 py-3">Serviço</th>
            <th className="px-4 py-3">Dimensões</th>
            <th className="px-4 py-3 text-right">Saldo</th>
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
            const servico = servicos.find((item) => item.id === levantamento.servicoId)
            const resultado = servico ? calcularLevantamento(levantamento, servico) : null
            const temErro = !servico || Boolean(resultado?.erros.length)

            return (
              <tr key={levantamento.id} className={temErro ? 'bg-red-50' : ''}>
                <td className="px-4 py-3 text-slate-700">{obterNomeAmbiente(ambientes, levantamento.ambienteId)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{servico?.nome ?? 'Serviço não encontrado'}</p>
                  {levantamento.descricao ? <p className="text-xs text-slate-500">{levantamento.descricao}</p> : null}
                </td>
                <td className="px-4 py-3 text-slate-600">{descreverDimensoes(levantamento, servico)}</td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {resultado ? `${formatarNumero(resultado.saldo)} ${levantamento.unidade}` : '-'}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(levantamento.valorUnitario)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{resultado ? formatarMoeda(resultado.subtotal) : '-'}</td>
                <td className="px-4 py-3 text-right text-slate-700">{resultado ? formatarMoeda(resultado.valorBdi) : '-'}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-950">{resultado ? formatarMoeda(resultado.total) : '-'}</td>
                <td className="px-4 py-3">
                  {temErro ? (
                    <div className="text-xs text-red-700">
                      <p className="font-medium">Erro</p>
                      {resultado?.erros.map((erro) => <p key={erro}>{erro}</p>)}
                      {!servico ? <p>Serviço não encontrado.</p> : null}
                    </div>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">OK</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
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