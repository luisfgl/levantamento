// components/obras/ObraForm.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Obra } from '@/lib/tipos/obra'
import { criarId } from '@/lib/utils/id'
import { normalizarNumeroEntrada } from '@/lib/utils/normalizacao'

interface ObraFormProps {
  onSalvar: (obra: Obra) => void
}

export function ObraForm({ onSalvar }: ObraFormProps) {
  const [nome, setNome] = useState('')
  const [cliente, setCliente] = useState('')
  const [endereco, setEndereco] = useState('')
  const [responsavelTecnico, setResponsavelTecnico] = useState('')
  const [registroProfissional, setRegistroProfissional] = useState('')
  const [dataOrcamento, setDataOrcamento] = useState(new Date().toISOString().slice(0, 10))
  const [bdiPadrao, setBdiPadrao] = useState('35')
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function limparFormulario() {
    setNome('')
    setCliente('')
    setEndereco('')
    setResponsavelTecnico('')
    setRegistroProfissional('')
    setDataOrcamento(new Date().toISOString().slice(0, 10))
    setBdiPadrao('35')
    setObservacoes('')
    setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const bdi = normalizarNumeroEntrada(bdiPadrao)

    if (!nome.trim()) {
      setErro('Informe o nome da obra.')
      return
    }

    if (!cliente.trim()) {
      setErro('Informe o cliente.')
      return
    }

    if (!Number.isFinite(bdi) || bdi < 0) {
      setErro('Informe um BDI válido.')
      return
    }

    const agora = new Date().toISOString()

    const obra: Obra = {
      id: criarId('obra'),
      nome: nome.trim(),
      cliente: cliente.trim(),
      endereco: endereco.trim() || undefined,
      responsavelTecnico: responsavelTecnico.trim() || undefined,
      registroProfissional: registroProfissional.trim() || undefined,
      dataOrcamento,
      bdiPadraoPercentual: bdi,
      observacoes: observacoes.trim() || undefined,
      status: 'rascunho',
      criadoEm: agora,
      atualizadoEm: agora,
    }

    onSalvar(obra)
    limparFormulario()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nome da obra" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input label="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
        <Input label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        <Input label="Data do orçamento" type="date" value={dataOrcamento} onChange={(e) => setDataOrcamento(e.target.value)} />
        <Input label="Responsável técnico" value={responsavelTecnico} onChange={(e) => setResponsavelTecnico(e.target.value)} />
        <Input label="Registro profissional" value={registroProfissional} onChange={(e) => setRegistroProfissional(e.target.value)} />
        <Input label="BDI padrão (%)" value={bdiPadrao} onChange={(e) => setBdiPadrao(e.target.value)} />
      </div>

      <Textarea label="Observações" rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <Button type="submit">Criar obra</Button>
    </form>
  )
}