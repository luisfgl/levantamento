// src/app/obras/[obraId]/page.tsx

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { STORAGE_KEYS } from '@/lib/storage/storageKeys'
import { carregarLista } from '@/lib/storage/projetoStorage'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'
import type { Servico } from '@/lib/tipos/servico'
import { formatarPercentual } from '@/lib/utils/formatacao'

const abas = ['Dados da obra', 'Ambientes', 'Serviços', 'Levantamento', 'Resumo', 'Exportar']

export default function ObraDetalhePage() {
    const params = useParams<{ obraId: string }>()
    const obraId = params.obraId

    const [obra, setObra] = useState<Obra | null>(null)
    const [ambientes, setAmbientes] = useState<Ambiente[]>([])
    const [servicos, setServicos] = useState<Servico[]>([])
    const [levantamentos, setLevantamentos] = useState<LevantamentoServico[]>([])
    const [abaAtiva, setAbaAtiva] = useState('Dados da obra')
    const [carregado, setCarregado] = useState(false)

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const obras = carregarLista<Obra>(STORAGE_KEYS.OBRAS)
            const obraEncontrada = obras.find((item) => item.id === obraId) ?? null

            setObra(obraEncontrada)
            setAmbientes(carregarLista<Ambiente>(STORAGE_KEYS.AMBIENTES).filter((item) => item.obraId === obraId))
            setServicos(carregarLista<Servico>(STORAGE_KEYS.SERVICOS))
            setLevantamentos(
                carregarLista<LevantamentoServico>(STORAGE_KEYS.LEVANTAMENTOS).filter((item) => item.obraId === obraId),
            )
            setCarregado(true)
        }, 0)

        return () => window.clearTimeout(timeoutId)
    }, [obraId])

    if (!carregado) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-10">
                <p className="text-slate-600">Carregando...</p>
            </main>
        )
    }

    if (!obra) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-10">
                <div className="mx-auto max-w-4xl space-y-4">
                    <h1 className="text-2xl font-bold text-slate-950">Obra não encontrada</h1>
                    <Link href="/obras" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                        Voltar para obras
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <Link href="/obras" className="text-sm font-medium text-slate-600 hover:text-slate-950">
                            ← Voltar para obras
                        </Link>
                        <h1 className="mt-3 text-3xl font-bold text-slate-950">{obra.nome}</h1>
                        <p className="text-slate-600">Cliente: {obra.cliente}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-500">BDI padrão</p>
                        <p className="text-xl font-semibold text-slate-950">{formatarPercentual(obra.bdiPadraoPercentual)}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {abas.map((aba) => (
                        <button
                            key={aba}
                            type="button"
                            onClick={() => setAbaAtiva(aba)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${abaAtiva === aba ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {aba}
                        </button>
                    ))}
                </div>

                {abaAtiva === 'Dados da obra' ? (
                    <Card>
                        <h2 className="text-xl font-semibold text-slate-900">Dados da obra</h2>
                        <dl className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Nome</dt>
                                <dd className="text-slate-900">{obra.nome}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Cliente</dt>
                                <dd className="text-slate-900">{obra.cliente}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Endereço</dt>
                                <dd className="text-slate-900">{obra.endereco ?? 'Não informado'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Data</dt>
                                <dd className="text-slate-900">{obra.dataOrcamento}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Responsável técnico</dt>
                                <dd className="text-slate-900">{obra.responsavelTecnico ?? 'Não informado'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Registro</dt>
                                <dd className="text-slate-900">{obra.registroProfissional ?? 'Não informado'}</dd>
                            </div>
                        </dl>
                    </Card>
                ) : null}

                {abaAtiva === 'Ambientes' ? (
                    <Card>
                        <h2 className="text-xl font-semibold text-slate-900">Ambientes</h2>
                        <p className="mt-2 text-sm text-slate-600">Quantidade cadastrada: {ambientes.length}</p>
                        <p className="mt-4 text-sm text-slate-500">CRUD de ambientes entra na próxima etapa.</p>
                    </Card>
                ) : null}

                {abaAtiva === 'Serviços' ? (
                    <Card>
                        <h2 className="text-xl font-semibold text-slate-900">Serviços</h2>
                        <p className="mt-2 text-sm text-slate-600">Serviços carregados: {servicos.length}</p>
                        <p className="mt-4 text-sm text-slate-500">Edição de serviços entra na próxima etapa.</p>
                    </Card>
                ) : null}

                {abaAtiva === 'Levantamento' ? (
                    <Card>
                        <h2 className="text-xl font-semibold text-slate-900">Levantamento</h2>
                        <p className="mt-2 text-sm text-slate-600">Itens lançados: {levantamentos.length}</p>
                        <p className="mt-4 text-sm text-slate-500">Formulário de levantamento entra depois do CRUD de ambientes e serviços.</p>
                    </Card>
                ) : null}

                {abaAtiva === 'Resumo' ? (
                    <Card>
                        <h2 className="text-xl font-semibold text-slate-900">Resumo</h2>
                        <p className="mt-2 text-sm text-slate-500">Resumo visual entra após os lançamentos de levantamento.</p>
                    </Card>
                ) : null}

                {abaAtiva === 'Exportar' ? (
                    <Card>
                        <h2 className="text-xl font-semibold text-slate-900">Exportar</h2>
                        <p className="mt-2 text-sm text-slate-500">Botão de exportação JSON entra em etapa própria.</p>
                    </Card>
                ) : null}
            </div>
        </main>
    )
}