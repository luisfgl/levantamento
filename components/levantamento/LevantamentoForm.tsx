// components/levantamento/LevantamentoForm.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import { criarId } from '@/lib/utils/id'
import { normalizarNumeroEntrada } from '@/lib/utils/normalizacao'

interface LevantamentoFormProps {
  obraId: string
  bdiPadraoPercentual: number
  ambientes: Ambiente[]
  servicos: Servico[]
  levantamentoEmEdicao?: LevantamentoServico | null
  onSalvar: (levantamento: LevantamentoServico) => void
  onCancelarEdicao?: () => void
}

function numeroOpcional(valor: string): number | undefined {
  if (!valor.trim()) return undefined
  return normalizarNumeroEntrada(valor)
}

function numeroObrigatorio(valor: string): number {
  return normalizarNumeroEntrada(valor)
}

export function LevantamentoForm({
  obraId,
  bdiPadraoPercentual,
  ambientes,
  servicos,
  levantamentoEmEdicao,
  onSalvar,
  onCancelarEdicao,
}: LevantamentoFormProps) {
  const [ambienteId, setAmbienteId] = useState('')
  const [servicoId, setServicoId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [comprimento, setComprimento] = useState('')
  const [largura, setLargura] = useState('')
  const [altura, setAltura] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valorManual, setValorManual] = useState('')
  const [valorUnitario, setValorUnitario] = useState('')
  const [bdiPercentual, setBdiPercentual] = useState(String(bdiPadraoPercentual))
  const [usaBdi, setUsaBdi] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const editando = Boolean(levantamentoEmEdicao)

  const servicoSelecionado = useMemo(() => {
    return servicos.find((servico) => servico.id === servicoId) ?? null
  }, [servicoId, servicos])

  const servicosDisponiveis = useMemo(() => {
    return servicos.filter((servico) => servico.ativo || servico.id === levantamentoEmEdicao?.servicoId)
  }, [levantamentoEmEdicao?.servicoId, servicos])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!levantamentoEmEdicao) {
        setAmbienteId('')
        setServicoId('')
        setDescricao('')
        setComprimento('')
        setLargura('')
        setAltura('')
        setQuantidade('')
        setValorManual('')
        setValorUnitario('')
        setBdiPercentual(String(bdiPadraoPercentual))
        setUsaBdi(true)
        setObservacoes('')
        setErro(null)
        return
      }

      setAmbienteId(levantamentoEmEdicao.ambienteId)
      setServicoId(levantamentoEmEdicao.servicoId)
      setDescricao(levantamentoEmEdicao.descricao ?? '')
      setComprimento(levantamentoEmEdicao.comprimento === undefined ? '' : String(levantamentoEmEdicao.comprimento))
      setLargura(levantamentoEmEdicao.largura === undefined ? '' : String(levantamentoEmEdicao.largura))
      setAltura(levantamentoEmEdicao.altura === undefined ? '' : String(levantamentoEmEdicao.altura))
      setQuantidade(levantamentoEmEdicao.quantidade === undefined ? '' : String(levantamentoEmEdicao.quantidade))
      setValorManual(levantamentoEmEdicao.valorManual === undefined ? '' : String(levantamentoEmEdicao.valorManual))
      setValorUnitario(String(levantamentoEmEdicao.valorUnitario))
      setBdiPercentual(String(levantamentoEmEdicao.bdiPercentual))
      setUsaBdi(levantamentoEmEdicao.usaBdi)
      setObservacoes(levantamentoEmEdicao.observacoes ?? '')
      setErro(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [bdiPadraoPercentual, levantamentoEmEdicao])

  function limparFormulario() {
    setAmbienteId('')
    setServicoId('')
    setDescricao('')
    setComprimento('')
    setLargura('')
    setAltura('')
    setQuantidade('')
    setValorManual('')
    setValorUnitario('')
    setBdiPercentual(String(bdiPadraoPercentual))
    setUsaBdi(true)
    setObservacoes('')
    setErro(null)
  }

  function handleSelecionarServico(novoServicoId: string) {
    setServicoId(novoServicoId)

    const servico = servicos.find((item) => item.id === novoServicoId)
    if (!servico) return

    setValorUnitario(String(servico.valorUnitarioPadrao))
    setUsaBdi(servico.usaBdi)
    setErro(null)

    if (servico.tipoCalculo === 'valor_manual') {
      setValorManual('')
    }
  }

  function validarCamposBase(): boolean {
    if (!ambienteId) {
      setErro('Selecione um ambiente.')
      return false
    }

    if (!servicoSelecionado) {
      setErro('Selecione um serviço ativo.')
      return false
    }

    const valorUnitarioNumero = numeroObrigatorio(valorUnitario)
    const bdiNumero = numeroObrigatorio(bdiPercentual)

    if (!Number.isFinite(valorUnitarioNumero) || valorUnitarioNumero < 0) {
      setErro('Informe um valor unitário válido.')
      return false
    }

    if (!Number.isFinite(bdiNumero) || bdiNumero < 0) {
      setErro('Informe um BDI válido.')
      return false
    }

    return true
  }

  function validarCamposPorTipo(): boolean {
    if (!servicoSelecionado) return false

    const tipo = servicoSelecionado.tipoCalculo

    if (tipo === 'parede') {
      const c = numeroObrigatorio(comprimento)
      const h = numeroObrigatorio(altura)

      if (!Number.isFinite(c) || c < 0 || !Number.isFinite(h) || h < 0) {
        setErro('Informe comprimento e altura válidos para serviço de parede.')
        return false
      }
    }

    if (tipo === 'piso') {
      const c = numeroObrigatorio(comprimento)
      const l = numeroObrigatorio(largura)

      if (!Number.isFinite(c) || c < 0 || !Number.isFinite(l) || l < 0) {
        setErro('Informe comprimento e largura válidos para serviço de piso.')
        return false
      }
    }

    if (tipo === 'item_unitario') {
      const qtd = numeroObrigatorio(quantidade)

      if (!Number.isFinite(qtd) || qtd < 0) {
        setErro('Informe uma quantidade válida.')
        return false
      }
    }

    if (tipo === 'valor_manual') {
      const valor = numeroObrigatorio(valorManual)

      if (!Number.isFinite(valor) || valor < 0) {
        setErro('Informe um valor manual válido.')
        return false
      }
    }

    if (tipo === 'comprimento_linear') {
      const c = numeroObrigatorio(comprimento)

      if (!Number.isFinite(c) || c < 0) {
        setErro('Informe um comprimento válido.')
        return false
      }
    }

    return true
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validarCamposBase()) return
    if (!validarCamposPorTipo()) return
    if (!servicoSelecionado) return

    const agora = new Date().toISOString()

    const levantamento: LevantamentoServico = {
      id: levantamentoEmEdicao?.id ?? criarId('lev'),
      obraId,
      ambienteId,
      servicoId,
      descricao: descricao.trim() || undefined,
      comprimento: numeroOpcional(comprimento),
      largura: numeroOpcional(largura),
      altura: numeroOpcional(altura),
      quantidade: numeroOpcional(quantidade),
      valorManual: numeroOpcional(valorManual),
      unidade: servicoSelecionado.unidade,
      valorUnitario: numeroObrigatorio(valorUnitario),
      bdiPercentual: numeroObrigatorio(bdiPercentual),
      usaBdi,
      vaos: levantamentoEmEdicao?.vaos ?? [],
      observacoes: observacoes.trim() || undefined,
      criadoEm: levantamentoEmEdicao?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    onSalvar(levantamento)

    if (!editando) {
      limparFormulario()
    }
  }

  if (ambientes.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Cadastre pelo menos um ambiente antes de lançar serviços.
      </div>
    )
  }

  if (servicosDisponiveis.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Cadastre ou ative pelo menos um serviço antes de lançar levantamentos.
      </div>
    )
  }

  const tipoCalculo = servicoSelecionado?.tipoCalculo

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Ambiente"
          value={ambienteId}
          onChange={(event) => setAmbienteId(event.target.value)}
          options={[
            { label: 'Selecione...', value: '' },
            ...ambientes.map((ambiente) => ({
              label: `${ambiente.pavimento ? `${ambiente.pavimento} / ` : ''}${ambiente.nome}`,
              value: ambiente.id,
            })),
          ]}
        />

        <Select
          label="Serviço"
          value={servicoId}
          onChange={(event) => handleSelecionarServico(event.target.value)}
          options={[
            { label: 'Selecione...', value: '' },
            ...servicosDisponiveis.map((servico) => ({
              label: `${servico.nome} (${servico.unidade})`,
              value: servico.id,
            })),
          ]}
        />

        <Input label="Valor unitário" value={valorUnitario} onChange={(event) => setValorUnitario(event.target.value)} />
        <Input label="BDI (%)" value={bdiPercentual} onChange={(event) => setBdiPercentual(event.target.value)} />
      </div>

      <Input label="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} />

      {tipoCalculo === 'parede' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Comprimento (m)" value={comprimento} onChange={(event) => setComprimento(event.target.value)} />
          <Input label="Altura (m)" value={altura} onChange={(event) => setAltura(event.target.value)} />
        </div>
      ) : null}

      {tipoCalculo === 'piso' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Comprimento (m)" value={comprimento} onChange={(event) => setComprimento(event.target.value)} />
          <Input label="Largura (m)" value={largura} onChange={(event) => setLargura(event.target.value)} />
        </div>
      ) : null}

      {tipoCalculo === 'item_unitario' ? (
        <Input label="Quantidade" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} />
      ) : null}

      {tipoCalculo === 'valor_manual' ? (
        <Input label="Valor manual" value={valorManual} onChange={(event) => setValorManual(event.target.value)} />
      ) : null}

      {tipoCalculo === 'comprimento_linear' ? (
        <Input label="Comprimento (m)" value={comprimento} onChange={(event) => setComprimento(event.target.value)} />
      ) : null}

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={usaBdi} onChange={(event) => setUsaBdi(event.target.checked)} />
        Aplicar BDI neste item
      </label>

      <Textarea label="Observações" rows={2} value={observacoes} onChange={(event) => setObservacoes(event.target.value)} />

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="flex gap-2">
        <Button type="submit">{editando ? 'Salvar levantamento' : 'Adicionar levantamento'}</Button>
        {editando && onCancelarEdicao ? (
          <Button type="button" variant="secondary" onClick={onCancelarEdicao}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}