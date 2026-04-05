import { useState } from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'
import { CATEGORIES } from '../../store/mockData'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function TicketConfirmModal({ result, warnings = [], onConfirm, onCancel }) {
  const businessFound = result.businessFound !== false
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
          {/* Alerta si no se pudo leer el total */}
          {result.totalNotFound && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3 py-2.5 rounded-lg">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">No se pudo leer el total</p>
                <p className="text-red-300/70 mt-0.5">Ingresá el monto a mano en el campo Total.</p>
              </div>
            </div>
          )}

          {/* Alerta si el comercio no fue encontrado */}
          {!businessFound && (
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs px-3 py-2.5 rounded-lg">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Comercio no encontrado</p>
                <p className="text-yellow-300/70 mt-0.5">
                  No reconocimos "{result.razonSocial}". Revisá la descripción y elegí la categoría a mano.
                </p>
              </div>
            </div>
          )}

          {/* Validation warnings from ticketValidation layer */}
          {warnings.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs px-3 py-2.5 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertTriangle size={13} className="shrink-0" />
                Revisá antes de guardar:
              </div>
              <ul className="list-disc list-inside text-yellow-300/80 space-y-0.5 pl-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="text-xs text-dark-muted block mb-1">Comercio / Descripción</label>
            <input
              type="text"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              maxLength={200}
              className={`w-full bg-dark-bg border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent ${
                !businessFound ? 'border-yellow-500/50' : 'border-dark-border'
              }`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-dark-muted block mb-1">
                Total {result.totalNotFound && <span className="text-red-400">— ingresá a mano</span>}
              </label>
              <input
                type="number"
                value={data.amount}
                onChange={(e) => setData({ ...data, amount: Number(e.target.value) })}
                min="0"
                className={`w-full bg-dark-bg border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent ${
                  result.totalNotFound ? 'border-red-500/50' : 'border-dark-border'
                }`}
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
            <label className="text-xs text-dark-muted block mb-1">
              Categoría {!businessFound && <span className="text-yellow-400 ml-1">— elegí a mano</span>}
            </label>
            <select
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className={`w-full bg-dark-bg border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent ${
                !businessFound ? 'border-yellow-500/50' : 'border-dark-border'
              }`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-dark-muted bg-dark-bg rounded-lg px-3 py-2 space-y-1">
            <p>Razón social: <span className="font-mono text-dark-text">{result.razonSocial || result.store}</span></p>
            <p>Total leído: <span className="font-mono text-accent">{formatARS(result.total)}</span></p>
            {result.ocrText && (
              <details className="mt-1">
                <summary className="cursor-pointer text-dark-muted hover:text-dark-text">Ver texto leído del ticket</summary>
                <pre className="mt-1 text-[10px] text-dark-muted font-mono whitespace-pre-wrap max-h-32 overflow-y-auto bg-dark-surface rounded p-2">
                  {result.ocrText}
                </pre>
              </details>
            )}
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
