// components/ui/Select.tsx

import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{
    label: string
    value: string
  }>
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <select
        id={selectId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}