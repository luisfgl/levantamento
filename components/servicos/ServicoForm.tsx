// components/servicos/ServicoForm.tsx

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { CategoriaServico, TipoCalculoServico, UnidadeMedida } from '@/lib/tipos/comum'
import type { Servico } from '@/lib/tipos/servico'
import { criarId } from '@/lib/utils/id'
import { normalizarNumeroEntrada } from '@/lib/utils/normalizacao'

const categoriaOptions: Array<{ label: string; value: CategoriaServico }> = [
  { label: 'Reboco', value: 'reboco' },
  { label: 'Pisos', value: 'pisos' },
  { label: 'Revestimentos', value: 'revestimentos' },
  { label: 'Pintura', value: 'pintura' },
  { label: 'Muros', value: 'muros' },
  { label: 'Acabamentos', value: 'acabamentos' },
  { label: 'Instalações', value: 'instalacoes' },
  { label: 'Complementação', value: 'complementacao' },
  { label: 'Outros', value: 'outros' },
]

const unidadeOptions: Array<{ label: string; value: UnidadeMedida }> = [
  { label: 'm²', value: 'm2' },
  { label: 'm', value: 'm' },
  { label: 'un', value: 'un' },
  { label: 'verba', value: 'verba' },
  { label: 'ponto', value: 'ponto' },
  { label: 'conjunto', value: 'conjunto' },
]

const tipoCalculoOptions: Array<{ label: string; value: TipoCalculoServico }> = [
  { label: 'Parede', value: 'parede' },
  { label: 'Piso', value: 'piso' },
  { label: 'Item unitário', value: 'item_unitario' },
  { label: 'Valor manual', value: 'valor_manual' },
  { label: 'Comprimento linear', value: 'comprimento_linear' },
]

interface ServicoFormProps {
  servicoEmEdicao?: Servico | null
  onSalvar: (servico: Servico) => void
  onCancelarEdicao?: () => void
}

export function ServicoForm({ servicoEmEdicao, onSalvar, onCancelarEdicao }: ServicoFormProps) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<CategoriaServico>('outros')
  const [unidade, setUnidade] = useState<UnidadeMedida>('m2')
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculoServico>('parede')
  const [valorUnitarioPadrao, setValorUnitarioPadrao] = useState('0')
  const [usaBdi, setUsaBdi] = useState(true)
  const [ativo, setAtivo] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const editando = Boolean(servicoEmEdicao)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!servicoEmEdicao) {
        setNome('')
        setCategoria('outros')
        setUnidade('m2')
        setTipoCalculo('parede')
        setValorUnitarioPadrao('0')
        setUsaBdi(true)
        setAtivo(true)
        setErro(null)
        return
      }

      setNome(servicoEmEdicao.nome)
      setCategoria(servicoEmEdicao.categoria)
      setUnidade(servicoEmEdicao.unidade)
      setTipoCalculo(servicoEmEdicao.tipoCalculo)
      setValorUnitarioPadrao(String(servicoEmEdicao.valorUnitarioPadrao))
      setUsaBdi(servicoEmEdicao.usaBdi)
      setAtivo(servicoEmEdicao.ativo)
      setErro(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [servicoEmEdicao])

  function limparFormulario() {
    setNome('')
    setCategoria('outros')
    setUnidade('m2')
    setTipoCalculo('parede')
    setValorUnitarioPadrao('0')
    setUsaBdi(true)
    setAtivo(true)
    setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const valor = normalizarNumeroEntrada(valorUnitarioPadrao)

    if (!nome.trim()) {
      setErro('Informe o nome do serviço.')
      return
    }

    if (!Number.isFinite(valor) || valor < 0) {
      setErro('Informe um valor unitário válido.')
      return
    }

    const agora = new Date().toISOString()

    const servico: Servico = {
      id: servicoEmEdicao?.id ?? criarId('serv'),
      nome: nome.trim(),
      categoria,
      unidade,
      valorUnitarioPadrao: valor,
      tipoCalculo,
      usaBdi,
      ativo,
      criadoEm: servicoEmEdicao?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    onSalvar(servico)

    if (!editando) {
      limparFormulario()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Input label="Nome do serviço" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaServico)} options={categoriaOptions} />
        <Select label="Unidade" value={unidade} onChange={(e) => setUnidade(e.target.value as UnidadeMedida)} options={unidadeOptions} />
        <Select
          label="Tipo de cálculo"
          value={tipoCalculo}
          onChange={(e) => setTipoCalculo(e.target.value as TipoCalculoServico)}
          options={tipoCalculoOptions}
        />
        <Input
          label="Valor unitário padrão"
          value={valorUnitarioPadrao}
          onChange={(e) => setValorUnitarioPadrao(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={usaBdi} onChange={(e) => setUsaBdi(e.target.checked)} />
          Usa BDI
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Serviço ativo
        </label>
      </div>

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="flex gap-2">
        <Button type="submit">{editando ? 'Salvar serviço' : 'Adicionar serviço'}</Button>
        {editando && onCancelarEdicao ? (
          <Button type="button" variant="secondary" onClick={onCancelarEdicao}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}