// components/levantamento/VaosModal.tsx

'use client'

import { useMemo, useState } from 'react'
import { calcularAreaVao } from '@/lib/calculos/area'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { VaoForm } from '@/components/levantamento/VaoForm'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import type { Vao } from '@/lib/tipos/vao'
import { formatarMoeda, formatarNumero } from '@/lib/utils/formatacao'

interface VaosModalProps {
  levantamento: LevantamentoServico
  servico: Servico
  onFechar: () => void
  onSalvarLevantamento: (levantamento: LevantamentoServico) => void
}

function descreverTipoVao(tipo: string): string {
  const mapa: Record<string, string> = {
    porta: 'Porta',
    janela: 'Janela',
    portao: 'Portão',
    vao_livre: 'Vão livre',
    outro: 'Outro',
  }

  return mapa[tipo] ?? tipo
}

export function VaosModal({ levantamento, servico, onFechar, onSalvarLevantamento }: VaosModalProps) {
  const [vaoEmEdicao, setVaoEmEdicao] = useState<Vao | null>(null)

  const resultado = useMemo(() => {
    return calcularLevantamento(levantamento, servico)
  }, [levantamento, servico])

  function salvarVao(vao: Vao) {
    const existe = levantamento.vaos.some((item) => item.id === vao.id)
    const novosVaos = existe ? levantamento.vaos.map((item) => (item.id === vao.id ? vao : item)) : [...levantamento.vaos, vao]

    onSalvarLevantamento({
      ...levantamento,
      vaos: novosVaos,
      atualizadoEm: new Date().toISOString(),
    })

    setVaoEmEdicao(null)
  }

  function removerVao(vaoId: string) {
    const confirmar = window.confirm('Remover este vão?')
    if (!confirmar) return

    onSalvarLevantamento({
      ...levantamento,
      vaos: levantamento.vaos.filter((vao) => vao.id !== vaoId),
      atualizadoEm: new Date().toISOString(),
    })

    if (vaoEmEdicao?.id === vaoId) {
      setVaoEmEdicao(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Vãos e descontos</p>
            <h2 className="text-2xl font-bold text-slate-950">{servico.nome}</h2>
            <p className="text-sm text-slate-600">{levantamento.descricao ?? 'Item sem descrição'}</p>
          </div>
          <Button type="button" variant="secondary" onClick={onFechar}>
            Fechar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Área bruta</p>
            <p className="text-xl font-semibold text-slate-950">{formatarNumero(resultado.areaBruta)} m²</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Área descontada</p>
            <p className="text-xl font-semibold text-slate-950">{formatarNumero(resultado.areaDescontada)} m²</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Saldo</p>
            <p className="text-xl font-semibold text-slate-950">{formatarNumero(resultado.saldo)} m²</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-xl font-semibold text-slate-950">{formatarMoeda(resultado.total)}</p>
          </Card>
        </div>

        {resultado.erros.length > 0 ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Erro no cálculo:</p>
            <ul className="mt-2 list-inside list-disc">
              {resultado.erros.map((erro) => (
                <li key={erro}>{erro}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">{vaoEmEdicao ? 'Editar vão' : 'Novo vão'}</h3>
            <VaoForm
              levantamentoId={levantamento.id}
              vaoEmEdicao={vaoEmEdicao}
              onSalvar={salvarVao}
              onCancelarEdicao={() => setVaoEmEdicao(null)}
            />
          </Card>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3 text-right">Largura</th>
                  <th className="px-4 py-3 text-right">Altura</th>
                  <th className="px-4 py-3 text-right">Qtd</th>
                  <th className="px-4 py-3 text-right">Área</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {levantamento.vaos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                      Nenhum vão cadastrado para este item.
                    </td>
                  </tr>
                ) : (
                  levantamento.vaos.map((vao) => (
                    <tr key={vao.id}>
                      <td className="px-4 py-3 text-slate-700">{descreverTipoVao(vao.tipo)}</td>
                      <td className="px-4 py-3 text-slate-600">{vao.descricao ?? '-'}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatarNumero(vao.largura)} m</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatarNumero(vao.altura)} m</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatarNumero(vao.quantidade)}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatarNumero(calcularAreaVao(vao.largura, vao.altura, vao.quantidade))} m²
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="secondary" onClick={() => setVaoEmEdicao(vao)}>
                            Editar
                          </Button>
                          <Button type="button" variant="danger" onClick={() => removerVao(vao.id)}>
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}