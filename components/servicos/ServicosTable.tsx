// components/servicos/ServicosTable.tsx

'use client'

import { Button } from '@/components/ui/Button'
import type { Servico } from '@/lib/tipos/servico'
import { formatarMoeda } from '@/lib/utils/formatacao'

interface ServicosTableProps {
  servicos: Servico[]
  onEditar: (servico: Servico) => void
  onAlternarAtivo: (servico: Servico) => void
}

export function ServicosTable({ servicos, onEditar, onAlternarAtivo }: ServicosTableProps) {
  if (servicos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        Nenhum serviço cadastrado.
      </div>
    )
  }

  const servicosOrdenados = [...servicos].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome))

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Serviço</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Unidade</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3 text-right">Valor padrão</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {servicosOrdenados.map((servico) => (
            <tr key={servico.id} className={servico.ativo ? '' : 'bg-slate-50 text-slate-500'}>
              <td className="px-4 py-3 font-medium text-slate-900">{servico.nome}</td>
              <td className="px-4 py-3 text-slate-600">{servico.categoria}</td>
              <td className="px-4 py-3 text-slate-600">{servico.unidade}</td>
              <td className="px-4 py-3 text-slate-600">{servico.tipoCalculo}</td>
              <td className="px-4 py-3 text-right text-slate-700">{formatarMoeda(servico.valorUnitarioPadrao)}</td>
              <td className="px-4 py-3 text-slate-600">{servico.ativo ? 'Ativo' : 'Inativo'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => onEditar(servico)}>
                    Editar
                  </Button>
                  <Button type="button" variant={servico.ativo ? 'ghost' : 'secondary'} onClick={() => onAlternarAtivo(servico)}>
                    {servico.ativo ? 'Inativar' : 'Ativar'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}