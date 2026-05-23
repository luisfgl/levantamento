// src/app/page.tsx

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <section className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">MVP Local</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Levantamento de Serviços e Valores
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Sistema local para cadastrar obras, estruturar serviços, lançar medições e preparar a base de orçamento técnico.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/obras"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Acessar obras
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">1. Obras</h2>
            <p className="mt-2 text-sm text-slate-600">Cadastre obras e dados básicos do orçamento.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">2. Serviços</h2>
            <p className="mt-2 text-sm text-slate-600">Use serviços padrão e depois personalize valores unitários.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">3. Levantamento</h2>
            <p className="mt-2 text-sm text-slate-600">A etapa de lançamento será construída após o CRUD básico.</p>
          </div>
        </div>
      </section>
    </main>
  )
}