// components/ambientes/AmbientesTable.tsx

'use client'

import { Button } from '@/components/ui/Button'
import type { Ambiente } from '@/lib/tipos/ambiente'

interface AmbientesTableProps {
  ambientes: Ambiente[]
  onEditar: (ambiente: Ambiente) => void
  onExcluir: (ambienteId: string) => void
}

export function AmbientesTable({ ambientes, onEditar, onExcluir }: AmbientesTableProps) {
  if (ambientes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        Nenhum ambiente cadastrado para esta obra.
      </div>
    )
  }

  const ambientesOrdenados = [...ambientes].sort((a, b) => a.ordem - b.ordem)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Ordem</th>
            <th className="px-4 py-3">Pavimento</th>
            <th className="px-4 py-3">Ambiente</th>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {ambientesOrdenados.map((ambiente) => (
            <tr key={ambiente.id}>
              <td className="px-4 py-3 text-slate-600">{ambiente.ordem}</td>
              <td className="px-4 py-3 text-slate-600">{ambiente.pavimento ?? '-'}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{ambiente.nome}</td>
              <td className="px-4 py-3 text-slate-600">{ambiente.descricao ?? '-'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => onEditar(ambiente)}>
                    Editar
                  </Button>
                  <Button type="button" variant="danger" onClick={() => onExcluir(ambiente.id)}>
                    Excluir
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