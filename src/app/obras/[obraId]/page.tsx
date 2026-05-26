// src/app/obras/[obraId]/page.tsx

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AmbienteForm } from '@/components/ambientes/AmbienteForm'
import { AmbientesTable } from '@/components/ambientes/AmbientesTable'
import { LevantamentoForm } from '@/components/levantamento/LevantamentoForm'
import { LevantamentosTable } from '@/components/levantamento/LevantamentosTable'
import { VaosModal } from '@/components/levantamento/VaosModal'
import { ServicoForm } from '@/components/servicos/ServicoForm'
import { ServicosTable } from '@/components/servicos/ServicosTable'
import { Card } from '@/components/ui/Card'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import { carregarLista, salvarLista } from '@/lib/storage/projetoStorage'
import { STORAGE_KEYS } from '@/lib/storage/storageKeys'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'
import type { Servico } from '@/lib/tipos/servico'
import { formatarPercentual } from '@/lib/utils/formatacao'
import { criarId } from '@/lib/utils/id'
import { ItensComErroTable } from '@/components/resumo/ItensComErroTable'
import { ResumoCategoriasTable } from '@/components/resumo/ResumoCategoriasTable'
import { ResumoGeralCard } from '@/components/resumo/ResumoGeralCard'
import { calcularResumoObra } from '@/lib/calculos/resumo'
import { ExportacaoJsonPanel } from '@/components/exportacao/ExportacaoJsonPanel'

const abas = ['Dados da obra', 'Ambientes', 'Serviços', 'Levantamento', 'Resumo', 'Exportar']

export default function ObraDetalhePage() {
  const params = useParams<{ obraId: string }>()
  const obraId = params.obraId

  const [obra, setObra] = useState<Obra | null>(null)
  const [ambientes, setAmbientes] = useState<Ambiente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [levantamentos, setLevantamentos] = useState<LevantamentoServico[]>([])
  const [ambienteEmEdicao, setAmbienteEmEdicao] = useState<Ambiente | null>(null)
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null)
  const [levantamentoEmEdicao, setLevantamentoEmEdicao] = useState<LevantamentoServico | null>(null)
  const [levantamentoComVaosAberto, setLevantamentoComVaosAberto] = useState<LevantamentoServico | null>(null)
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

  const proximaOrdemAmbiente = useMemo(() => {
    if (ambientes.length === 0) return 1
    return Math.max(...ambientes.map((ambiente) => ambiente.ordem)) + 1
  }, [ambientes])

  const levantamentosValidos = useMemo(() => {
    return levantamentos.filter((levantamento) => {
      const servico = servicos.find((item) => item.id === levantamento.servicoId)
      if (!servico) return false

      const resultado = calcularLevantamento(levantamento, servico)
      return resultado.erros.length === 0
    })
  }, [levantamentos, servicos])

  const servicoDoLevantamentoComVaos = useMemo(() => {
    if (!levantamentoComVaosAberto) return null
    return servicos.find((servico) => servico.id === levantamentoComVaosAberto.servicoId) ?? null
  }, [levantamentoComVaosAberto, servicos])

  const resumoObra = useMemo(() => {
    return calcularResumoObra(levantamentos, servicos)
  }, [levantamentos, servicos])

  function salvarAmbientesDaObra(novosAmbientesDaObra: Ambiente[]) {
    const todosAmbientes = carregarLista<Ambiente>(STORAGE_KEYS.AMBIENTES)
    const ambientesDeOutrasObras = todosAmbientes.filter((ambiente) => ambiente.obraId !== obraId)
    const novaListaGlobal = [...ambientesDeOutrasObras, ...novosAmbientesDaObra]

    salvarLista(STORAGE_KEYS.AMBIENTES, novaListaGlobal)
    setAmbientes(novosAmbientesDaObra)
  }

  function handleSalvarAmbiente(ambiente: Ambiente) {
    const existe = ambientes.some((item) => item.id === ambiente.id)
    const novaLista = existe ? ambientes.map((item) => (item.id === ambiente.id ? ambiente : item)) : [...ambientes, ambiente]

    salvarAmbientesDaObra(novaLista)
    setAmbienteEmEdicao(null)
  }

  function handleExcluirAmbiente(ambienteId: string) {
    const ambienteTemLevantamento = levantamentos.some((levantamento) => levantamento.ambienteId === ambienteId)

    if (ambienteTemLevantamento) {
      window.alert('Não é possível excluir ambiente com levantamento vinculado.')
      return
    }

    const confirmar = window.confirm('Excluir este ambiente?')
    if (!confirmar) return

    salvarAmbientesDaObra(ambientes.filter((ambiente) => ambiente.id !== ambienteId))

    if (ambienteEmEdicao?.id === ambienteId) {
      setAmbienteEmEdicao(null)
    }
  }

  function handleSalvarServico(servico: Servico) {
    const existe = servicos.some((item) => item.id === servico.id)
    const novaLista = existe ? servicos.map((item) => (item.id === servico.id ? servico : item)) : [...servicos, servico]

    salvarLista(STORAGE_KEYS.SERVICOS, novaLista)
    setServicos(novaLista)
    setServicoEmEdicao(null)
  }

  function handleAlternarServicoAtivo(servico: Servico) {
    const atualizado: Servico = {
      ...servico,
      ativo: !servico.ativo,
      atualizadoEm: new Date().toISOString(),
    }

    handleSalvarServico(atualizado)
  }

  function salvarLevantamentosDaObra(novosLevantamentosDaObra: LevantamentoServico[]) {
    const todosLevantamentos = carregarLista<LevantamentoServico>(STORAGE_KEYS.LEVANTAMENTOS)
    const levantamentosDeOutrasObras = todosLevantamentos.filter((levantamento) => levantamento.obraId !== obraId)
    const novaListaGlobal = [...levantamentosDeOutrasObras, ...novosLevantamentosDaObra]

    salvarLista(STORAGE_KEYS.LEVANTAMENTOS, novaListaGlobal)
    setLevantamentos(novosLevantamentosDaObra)
  }

  function handleSalvarLevantamento(levantamento: LevantamentoServico) {
    const existe = levantamentos.some((item) => item.id === levantamento.id)
    const novaLista = existe
      ? levantamentos.map((item) => (item.id === levantamento.id ? levantamento : item))
      : [...levantamentos, levantamento]

    salvarLevantamentosDaObra(novaLista)
    setLevantamentoEmEdicao(null)

    if (levantamentoComVaosAberto?.id === levantamento.id) {
      setLevantamentoComVaosAberto(levantamento)
    }
  }

  function handleDuplicarLevantamento(levantamento: LevantamentoServico) {
    const agora = new Date().toISOString()

    const copia: LevantamentoServico = {
      ...levantamento,
      id: criarId('lev'),
      descricao: levantamento.descricao ? `${levantamento.descricao} - cópia` : 'Cópia de levantamento',
      vaos: [],
      criadoEm: agora,
      atualizadoEm: agora,
    }

    salvarLevantamentosDaObra([...levantamentos, copia])
  }

  function handleExcluirLevantamento(levantamentoId: string) {
    const confirmar = window.confirm('Excluir este levantamento?')
    if (!confirmar) return

    salvarLevantamentosDaObra(levantamentos.filter((levantamento) => levantamento.id !== levantamentoId))

    if (levantamentoEmEdicao?.id === levantamentoId) {
      setLevantamentoEmEdicao(null)
    }

    if (levantamentoComVaosAberto?.id === levantamentoId) {
      setLevantamentoComVaosAberto(null)
    }
  }

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
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-slate-900">
                {ambienteEmEdicao ? 'Editar ambiente' : 'Novo ambiente'}
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-600">Cadastre os ambientes físicos da obra.</p>
              <AmbienteForm
                obraId={obra.id}
                ambienteEmEdicao={ambienteEmEdicao}
                proximaOrdem={proximaOrdemAmbiente}
                onSalvar={handleSalvarAmbiente}
                onCancelarEdicao={() => setAmbienteEmEdicao(null)}
              />
            </Card>

            <AmbientesTable ambientes={ambientes} onEditar={setAmbienteEmEdicao} onExcluir={handleExcluirAmbiente} />
          </div>
        ) : null}

        {abaAtiva === 'Serviços' ? (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-slate-900">
                {servicoEmEdicao ? 'Editar serviço' : 'Novo serviço'}
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-600">Configure os serviços e valores padrão do orçamento.</p>
              <ServicoForm
                servicoEmEdicao={servicoEmEdicao}
                onSalvar={handleSalvarServico}
                onCancelarEdicao={() => setServicoEmEdicao(null)}
              />
            </Card>

            <ServicosTable servicos={servicos} onEditar={setServicoEmEdicao} onAlternarAtivo={handleAlternarServicoAtivo} />
          </div>
        ) : null}

        {abaAtiva === 'Levantamento' ? (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-slate-900">
                {levantamentoEmEdicao ? 'Editar levantamento' : 'Novo levantamento'}
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-600">
                Lance serviços por ambiente. Para itens de parede, use o botão Vãos na tabela.
              </p>
              <LevantamentoForm
                obraId={obra.id}
                bdiPadraoPercentual={obra.bdiPadraoPercentual}
                ambientes={ambientes}
                servicos={servicos}
                levantamentoEmEdicao={levantamentoEmEdicao}
                onSalvar={handleSalvarLevantamento}
                onCancelarEdicao={() => setLevantamentoEmEdicao(null)}
              />
            </Card>

            <Card>
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Levantamentos lançados</h2>
                  <p className="text-sm text-slate-600">
                    Total: {levantamentos.length} | Válidos: {levantamentosValidos.length} | Com erro:{' '}
                    {levantamentos.length - levantamentosValidos.length}
                  </p>
                </div>
              </div>

              <LevantamentosTable
                levantamentos={levantamentos}
                ambientes={ambientes}
                servicos={servicos}
                onEditar={setLevantamentoEmEdicao}
                onDuplicar={handleDuplicarLevantamento}
                onExcluir={handleExcluirLevantamento}
                onAbrirVaos={setLevantamentoComVaosAberto}
              />
            </Card>
          </div>
        ) : null}

        {abaAtiva === 'Resumo' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Resumo da obra</h2>
              <p className="mt-1 text-sm text-slate-600">
                Totais calculados com base nos levantamentos válidos. Itens com erro não entram no total.
              </p>
            </div>

            <ResumoGeralCard resumo={resumoObra} />

            <ResumoCategoriasTable categorias={resumoObra.categorias} />

            <ItensComErroTable levantamentos={levantamentos} ambientes={ambientes} servicos={servicos} />
          </div>
        ) : null}

        {abaAtiva === 'Exportar' ? (
          <ExportacaoJsonPanel
            obra={obra}
            ambientes={ambientes}
            servicos={servicos}
            levantamentos={levantamentos}
          />
        ) : null}
      </div>

      {levantamentoComVaosAberto && servicoDoLevantamentoComVaos ? (
        <VaosModal
          levantamento={levantamentoComVaosAberto}
          servico={servicoDoLevantamentoComVaos}
          onFechar={() => setLevantamentoComVaosAberto(null)}
          onSalvarLevantamento={handleSalvarLevantamento}
        />
      ) : null}
    </main>
  )
}