// components/levantamento/VaoForm.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { calcularAreaVao } from '@/lib/calculos/area'
import type { TipoVao, Vao } from '@/lib/tipos/vao'
import { formatarNumero } from '@/lib/utils/formatacao'
import { criarId } from '@/lib/utils/id'
import { normalizarNumeroEntrada } from '@/lib/utils/normalizacao'

const tipoVaoOptions: Array<{ label: string; value: TipoVao }> = [
  { label: 'Porta', value: 'porta' },
  { label: 'Janela', value: 'janela' },
  { label: 'Portão', value: 'portao' },
  { label: 'Vão livre', value: 'vao_livre' },
  { label: 'Outro', value: 'outro' },
]

interface VaoFormProps {
  levantamentoId: string
  vaoEmEdicao?: Vao | null
  onSalvar: (vao: Vao) => void
  onCancelarEdicao?: () => void
}

function numeroParaCampo(valor: number | undefined): string {
  if (valor === undefined || valor === null || Number.isNaN(valor)) return ''
  return String(valor)
}

export function VaoForm({ levantamentoId, vaoEmEdicao, onSalvar, onCancelarEdicao }: VaoFormProps) {
  const [tipo, setTipo] = useState<TipoVao>('porta')
  const [descricao, setDescricao] = useState('')
  const [largura, setLargura] = useState('')
  const [altura, setAltura] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [erro, setErro] = useState<string | null>(null)

  const editando = Boolean(vaoEmEdicao)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!vaoEmEdicao) {
        setTipo('porta')
        setDescricao('')
        setLargura('')
        setAltura('')
        setQuantidade('1')
        setErro(null)
        return
      }

      setTipo(vaoEmEdicao.tipo)
      setDescricao(vaoEmEdicao.descricao ?? '')
      setLargura(numeroParaCampo(vaoEmEdicao.largura))
      setAltura(numeroParaCampo(vaoEmEdicao.altura))
      setQuantidade(numeroParaCampo(vaoEmEdicao.quantidade))
      setErro(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [vaoEmEdicao])

  const areaCalculada = useMemo(() => {
    const larguraNumero = normalizarNumeroEntrada(largura)
    const alturaNumero = normalizarNumeroEntrada(altura)
    const quantidadeNumero = normalizarNumeroEntrada(quantidade)

    if (!Number.isFinite(larguraNumero) || !Number.isFinite(alturaNumero) || !Number.isFinite(quantidadeNumero)) {
      return 0
    }

    if (larguraNumero < 0 || alturaNumero < 0 || quantidadeNumero < 0) {
      return 0
    }

    return calcularAreaVao(larguraNumero, alturaNumero, quantidadeNumero)
  }, [altura, largura, quantidade])

  function limparFormulario() {
    setTipo('porta')
    setDescricao('')
    setLargura('')
    setAltura('')
    setQuantidade('1')
    setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const larguraNumero = normalizarNumeroEntrada(largura)
    const alturaNumero = normalizarNumeroEntrada(altura)
    const quantidadeNumero = normalizarNumeroEntrada(quantidade)

    if (!Number.isFinite(larguraNumero) || larguraNumero < 0) {
      setErro('Informe uma largura válida.')
      return
    }

    if (!Number.isFinite(alturaNumero) || alturaNumero < 0) {
      setErro('Informe uma altura válida.')
      return
    }

    if (!Number.isFinite(quantidadeNumero) || quantidadeNumero < 0) {
      setErro('Informe uma quantidade válida.')
      return
    }

    const agora = new Date().toISOString()

    const vao: Vao = {
      id: vaoEmEdicao?.id ?? criarId('vao'),
      levantamentoId,
      tipo,
      descricao: descricao.trim() || undefined,
      largura: larguraNumero,
      altura: alturaNumero,
      quantidade: quantidadeNumero,
      criadoEm: vaoEmEdicao?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    onSalvar(vao)

    if (!editando) {
      limparFormulario()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Select
          label="Tipo"
          value={tipo}
          onChange={(event) => setTipo(event.target.value as TipoVao)}
          options={tipoVaoOptions}
        />
        <Input label="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} />
        <Input label="Largura (m)" value={largura} onChange={(event) => setLargura(event.target.value)} />
        <Input label="Altura (m)" value={altura} onChange={(event) => setAltura(event.target.value)} />
        <Input label="Quantidade" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        Área calculada do vão: <strong>{formatarNumero(areaCalculada)} m²</strong>
      </div>

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="flex gap-2">
        <Button type="submit">{editando ? 'Salvar vão' : 'Adicionar vão'}</Button>
        {editando && onCancelarEdicao ? (
          <Button type="button" variant="secondary" onClick={onCancelarEdicao}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}