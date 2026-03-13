import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { CATEGORIES } from '../../store/mockData'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function TicketConfirmModal({ result, onConfirm, onCancel }) {
  const [data, setData] = useState({
    description: result.store || '',
    amount: result.total || 0,
    date: result.date || new Date().toISOString().split('T')[0],
    category: result.category || 'Otros',
  })

  const confidence = result.confidence || 0
  const confidenceLabel = confidence >= 0.8 ? 'Alta' : confidence >= 0.5 ? 'Media' : 'Baja'
  const confidenceColor = confidence >= 0.8 ? 'text-accent bg-accent/20' : confidence >= 0.5 ? 'text-yellow-400 bg-yellow-400/20' : 'text-red-400 bg-red-400/20'

  const handleConfirm = () => {
    if (!data.description || !data.amount) return
    onConfirm({
      date: data.date,
      category: data.category,
      description: String(data.description).slice(0, 200),
      amount: Number(data.amount),
      type: 'expense',
      tags: ['scanner'],
      recurring: false,
      split_with: null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-semibold text-sm">Confirmar gasto escaneado</h3>
          <span className={`text-xs px-2 py-0.5 rounded ${confidenceColor}`}>
            {confidenceLabel} ({Math.round(confidence * 100)}%)
          </span>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs text-dark-muted block mb-1">Comercio / Descripción</label>
            <input
              type="text"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              maxLength={200}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-dark-muted block mb-1">Monto</label>
              <input
                type="number"
                value={data.amount}
                onChange={(e) => setData({ ...data, amount: Number(e.target.value) })}
                min="0"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-dark-muted block mb-1">Fecha</label>
              <input
                type="date"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-dark-muted block mb-1">Categoría</label>
            <select
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-dark-muted bg-dark-bg rounded-lg px-3 py-2">
            Detectado: <span className="font-mono text-accent">{formatARS(result.total)}</span> en <span className="font-medium text-dark-text">{result.store}</span>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-dark-border flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-dark-muted hover:text-dark-text text-sm px-3 py-1.5"
          >
            <X size={14} /> Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1 bg-accent text-dark-bg text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-accent/90"
          >
            <Check size={14} /> Agregar gasto
          </button>
        </div>
      </div>
    </div>
  )
}
