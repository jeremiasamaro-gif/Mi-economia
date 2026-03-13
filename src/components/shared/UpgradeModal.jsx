import { X, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UpgradeModal({ isOpen, onClose, feature }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Sparkles className="text-accent" size={24} />
          </div>
          <button onClick={onClose} className="text-dark-muted hover:text-dark-text">
            <X size={20} />
          </button>
        </div>

        <h3 className="text-lg font-bold mb-2">Mejorá a Pro</h3>
        <p className="text-dark-muted text-sm mb-4">
          {feature
            ? `La función "${feature}" está disponible en el plan Pro.`
            : 'Desbloqueá todas las funciones de mi EconomIA.'}
        </p>

        <ul className="space-y-2 mb-6 text-sm">
          {[
            'Gastos ilimitados',
            'Asistente IA con análisis inteligente',
            'Dashboard completo con gráficos',
            'Presupuestos por categoría',
            'Gastos recurrentes automáticos',
            'Exportar/importar CSV',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-dark-text">
              <span className="text-accent">✓</span> {item}
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose()
              navigate('/pricing')
            }}
            className="flex-1 bg-accent text-dark-bg font-semibold py-2.5 rounded-lg hover:bg-accent/90"
          >
            Ver planes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-dark-border rounded-lg text-dark-muted hover:text-dark-text"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
