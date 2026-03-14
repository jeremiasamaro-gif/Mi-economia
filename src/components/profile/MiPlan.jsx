import { useState } from 'react'
import { Crown, Check, X, CreditCard, Download, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useProfileStore from '../../store/profileStore'

export default function MiPlan() {
  const { user, isPro, isTrial, trialDaysLeft } = useAuth()
  const { paymentHistory } = useProfileStore()
  const [showCancel, setShowCancel] = useState(false)
  const [cancelText, setCancelText] = useState('')

  const plan = user?.plan || 'free'

  const freeFeatures = [
    { text: 'Hasta 50 gastos por mes', included: true },
    { text: 'Categorías básicas', included: true },
    { text: 'Resumen mensual', included: true },
    { text: 'Asistente EconomIA (IA)', included: false },
    { text: 'Gráficos y dashboard completo', included: false },
    { text: 'Gastos recurrentes', included: false },
    { text: 'Escáner de tickets', included: false },
    { text: 'WhatsApp Bot', included: false },
    { text: 'Modo grupo/familia', included: false },
    { text: 'Mis logros personalizados', included: false },
  ]

  const proFeatures = [
    { text: 'Todo lo del plan Free', included: true },
    { text: 'Gastos ilimitados', included: true },
    { text: 'Asistente EconomIA completo', included: true },
    { text: 'Dashboard con todos los gráficos', included: true },
    { text: 'Gastos recurrentes automáticos', included: true },
    { text: 'Escáner de tickets con IA', included: true },
    { text: 'WhatsApp Bot', included: true },
    { text: 'Modo grupo/familia (hasta 5 personas)', included: true },
    { text: 'Logros personalizados', included: true },
    { text: 'Soporte prioritario', included: true },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-dark-text">Mi Plan</h2>

      {/* Current plan card */}
      <div className={`bg-dark-surface border rounded-xl p-6 ${isPro ? 'border-accent/40' : 'border-dark-border'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPro ? 'bg-accent/20' : 'bg-dark-hover'}`}>
              <Crown size={24} className={isPro ? 'text-accent' : 'text-dark-muted'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-dark-text">Plan {isPro ? 'Pro' : 'Free'}</h3>
                {isPro && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                    {isTrial ? `Trial · ${trialDaysLeft} días` : 'Activo'}
                  </span>
                )}
                {!isPro && (
                  <span className="text-xs bg-dark-hover text-dark-muted px-2 py-0.5 rounded-full font-medium">
                    Gratis
                  </span>
                )}
              </div>
              {isPro && !isTrial && (
                <p className="text-sm text-dark-muted mt-0.5">Próximo cobro: 15 de abril 2026</p>
              )}
            </div>
          </div>
        </div>

        {!isPro && (
          <div className="mt-4">
            {/* Usage meter */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-dark-muted">Gastos este mes</span>
                <span className="text-dark-text font-medium">32/50</span>
              </div>
              <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: '64%' }} />
              </div>
            </div>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-dark-bg rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              <Crown size={18} />
              Mejorar a Pro
            </a>
          </div>
        )}

        {isPro && !isTrial && (
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors">
              Gestionar suscripción
            </button>
            <button
              onClick={() => setShowCancel(true)}
              className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
            >
              Cancelar plan
            </button>
          </div>
        )}
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free card */}
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-dark-text">Free</h3>
            <p className="text-sm text-dark-muted">Gratis para siempre</p>
          </div>
          <ul className="space-y-2.5">
            {freeFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {f.included ? (
                  <Check size={16} className="text-accent shrink-0" />
                ) : (
                  <X size={16} className="text-dark-muted/50 shrink-0" />
                )}
                <span className={f.included ? 'text-dark-text' : 'text-dark-muted/50'}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro card */}
        <div className="bg-dark-surface border-2 border-accent/40 rounded-xl p-6 relative">
          <div className="absolute -top-3 right-4">
            <span className="text-xs bg-accent text-dark-bg px-3 py-1 rounded-full font-bold">RECOMENDADO</span>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-dark-text">Pro</h3>
            <p className="text-sm text-dark-muted">$2.999 ARS / mes</p>
          </div>
          <ul className="space-y-2.5">
            {proFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-accent shrink-0" />
                <span className="text-dark-text">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Payment history (Pro only) */}
      {isPro && !isTrial && (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Historial de pagos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-2.5 text-dark-muted font-medium">Fecha</th>
                  <th className="text-left py-2.5 text-dark-muted font-medium">Monto</th>
                  <th className="text-left py-2.5 text-dark-muted font-medium">Estado</th>
                  <th className="text-right py-2.5 text-dark-muted font-medium">Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="border-b border-dark-border/50">
                    <td className="py-2.5 text-dark-text">
                      {new Date(p.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 text-dark-text font-mono">${p.amount.toLocaleString('es-AR')}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {p.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button className="text-accent hover:text-accent/80 transition-colors">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCancel(false)}>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-dark-text">Cancelar Plan Pro</h3>
            </div>
            <p className="text-sm text-dark-muted mb-4">
              Perderás acceso a todas las funcionalidades Pro al final del período de facturación actual.
            </p>
            <div className="mb-4">
              <label className="block text-sm text-dark-muted mb-1.5">
                Escribí <span className="text-red-400 font-bold">CANCELAR</span> para confirmar
              </label>
              <input
                type="text"
                value={cancelText}
                onChange={(e) => setCancelText(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-red-400 focus:outline-none"
                placeholder="CANCELAR"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancel(false); setCancelText('') }}
                className="flex-1 px-4 py-2.5 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
              >
                Volver
              </button>
              <button
                disabled={cancelText !== 'CANCELAR'}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  cancelText === 'CANCELAR'
                    ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                    : 'bg-dark-hover text-dark-muted cursor-not-allowed'
                }`}
              >
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
