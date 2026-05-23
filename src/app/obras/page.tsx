// src/app/obras/page.tsx

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ObraForm } from '@/components/obras/ObraForm'
import { ObrasList } from '@/components/obras/ObrasList'
import { Card } from '@/components/ui/Card'
import { servicosPadrao } from '@/lib/dados/servicosPadrao'
import { STORAGE_KEYS } from '@/lib/storage/storageKeys'
import { carregarLista, removerItem, salvarLista } from '@/lib/storage/projetoStorage'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'
import type { Servico } from '@/lib/tipos/servico'

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    const obrasSalvas = carregarLista<Obra>(STORAGE_KEYS.OBRAS)
    const servicosSalvos = carregarLista<Servico>(STORAGE_KEYS.SERVICOS)

    if (servicosSalvos.length === 0) {
      salvarLista(STORAGE_KEYS.SERVICOS, servicosPadrao)
    }

    setObras(obrasSalvas)
    setCarregado(true)
  }, 0)

  return () => window.clearTimeout(timeoutId)
}, [])

  function handleSalvarObra(obra: Obra) {
    const novaLista = [...obras, obra]
    salvarLista(STORAGE_KEYS.OBRAS, novaLista)
    setObras(novaLista)
  }

  function handleExcluirObra(obraId: string) {
    const confirmar = window.confirm('Excluir esta obra e seus dados relacionados?')
    if (!confirmar) return

    const novasObras = removerItem<Obra>(STORAGE_KEYS.OBRAS, obraId)

    const ambientes = carregarLista<Ambiente>(STORAGE_KEYS.AMBIENTES)
    salvarLista(
      STORAGE_KEYS.AMBIENTES,
      ambientes.filter((ambiente) => ambiente.obraId !== obraId),
    )

    const levantamentos = carregarLista<LevantamentoServico>(STORAGE_KEYS.LEVANTAMENTOS)
    salvarLista(
      STORAGE_KEYS.LEVANTAMENTOS,
      levantamentos.filter((levantamento) => levantamento.obraId !== obraId),
    )

    setObras(novasObras)
  }

  if (!carregado) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <p className="text-slate-600">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Obras</p>
            <h1 className="text-3xl font-bold text-slate-950">Levantamento de Serviços e Valores</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            Voltar
          </Link>
        </div>

        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Nova obra</h2>
            <p className="text-sm text-slate-600">Cadastre a base do orçamento técnico.</p>
          </div>
          <ObraForm onSalvar={handleSalvarObra} />
        </Card>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Obras cadastradas</h2>
            <p className="text-sm text-slate-600">Total: {obras.length}</p>
          </div>
          <ObrasList obras={obras} onExcluir={handleExcluirObra} />
        </section>
      </div>
    </main>
  )
}