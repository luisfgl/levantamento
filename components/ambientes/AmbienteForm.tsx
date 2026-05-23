// components/ambientes/AmbienteForm.tsx

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Ambiente } from '@/lib/tipos/ambiente'
import { criarId } from '@/lib/utils/id'

interface AmbienteFormProps {
  obraId: string
  ambienteEmEdicao?: Ambiente | null
  proximaOrdem: number
  onSalvar: (ambiente: Ambiente) => void
  onCancelarEdicao?: () => void
}

export function AmbienteForm({
  obraId,
  ambienteEmEdicao,
  proximaOrdem,
  onSalvar,
  onCancelarEdicao,
}: AmbienteFormProps) {
  const [pavimento, setPavimento] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const editando = Boolean(ambienteEmEdicao)

  useEffect(() => {
    if (!ambienteEmEdicao) {
      setPavimento('')
      setNome('')
      setDescricao('')
      setErro(null)
      return
    }

    setPavimento(ambienteEmEdicao.pavimento ?? '')
    setNome(ambienteEmEdicao.nome)
    setDescricao(ambienteEmEdicao.descricao ?? '')
    setErro(null)
  }, [ambienteEmEdicao])

  function limparFormulario() {
    setPavimento('')
    setNome('')
    setDescricao('')
    setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!nome.trim()) {
      setErro('Informe o nome do ambiente.')
      return
    }

    const agora = new Date().toISOString()

    const ambiente: Ambiente = {
      id: ambienteEmEdicao?.id ?? criarId('amb'),
      obraId,
      pavimento: pavimento.trim() || undefined,
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      ordem: ambienteEmEdicao?.ordem ?? proximaOrdem,
      criadoEm: ambienteEmEdicao?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    onSalvar(ambiente)

    if (!editando) {
      limparFormulario()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Pavimento" value={pavimento} onChange={(e) => setPavimento(e.target.value)} />
        <Input label="Nome do ambiente" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>

      <Textarea label="Descrição" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />

      {erro ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="flex gap-2">
        <Button type="submit">{editando ? 'Salvar ambiente' : 'Adicionar ambiente'}</Button>
        {editando && onCancelarEdicao ? (
          <Button type="button" variant="secondary" onClick={onCancelarEdicao}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}