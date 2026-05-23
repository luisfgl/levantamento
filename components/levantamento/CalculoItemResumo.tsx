// components/levantamento/CalculoItemResumo.tsx

'use client'

import { calcularLevantamento } from '@/lib/calculos/levantamento'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import { formatarMoeda, formatarNumero } from '@/lib/utils/formatacao'

interface CalculoItemResumoProps {
  levantamento: LevantamentoServico
  servico?: Servico
}

export function CalculoItemResumo({ levantamento, servico }: CalculoItemResumoProps) {
  if (!servico) {
    return <p className="text-sm text-red-700">Serviço não encontrado.</p>
  }

  const resultado = calcularLevantamento(levantamento, servico)

  if (resultado.erros.length > 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <p className="font-medium">Item com erro:</p>
        <ul className="mt-1 list-inside list-disc">
          {resultado.erros.map((erro) => (
            <li key={erro}>{erro}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm md:grid-cols-3 lg:grid-cols-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Área bruta</p>
        <p className="font-medium text-slate-900">{formatarNumero(resultado.areaBruta)} {levantamento.unidade}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Desconto</p>
        <p className="font-medium text-slate-900">{formatarNumero(resultado.areaDescontada)} {levantamento.unidade}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Saldo</p>
        <p className="font-medium text-slate-900">{formatarNumero(resultado.saldo)} {levantamento.unidade}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Subtotal</p>
        <p className="font-medium text-slate-900">{formatarMoeda(resultado.subtotal)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">BDI</p>
        <p className="font-medium text-slate-900">{formatarMoeda(resultado.valorBdi)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
        <p className="font-semibold text-slate-950">{formatarMoeda(resultado.total)}</p>
      </div>
    </div>
  )
}