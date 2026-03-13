import { useNavigate } from 'react-router-dom'
import { Check, X, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const features = [
  { name: 'Gastos por mes', free: 'Hasta 50', pro: 'Ilimitados' },
  { name: 'Resumen financiero', free: true, pro: true },
  { name: 'Gráficos interactivos', free: false, pro: true },
  { name: 'Asistente IA EconomIA', free: false, pro: true },
  { name: 'Presupuestos por categoría', free: false, pro: true },
  { name: 'Gastos recurrentes', free: false, pro: true },
  { name: 'Tags y filtros', free: false, pro: true },
  { name: 'División de gastos', free: false, pro: true },
  { name: 'Exportar/importar CSV', free: false, pro: true },
  { name: 'Alertas proactivas de IA', free: false, pro: true },
]

export default function PricingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubscribe = () => {
    // TODO MP: replace with MercadoPago Checkout Pro API call
    // Creates a preference with:
    //   title: "mi EconomIA Pro — 1 mes"
    //   unit_price: PRICE_PLACEHOLDER (ARS)
    //   back_urls: { success: '/payment/success', failure: '/payment/failure' }
    // Then redirects to MP checkout URL
    alert('MercadoPago: Se generará un link de pago cuando se configure la integración.')
  }

  const FeatureValue = ({ value }) => {
    if (typeof value === 'string') return <span className="text-sm">{value}</span>
    if (value) return <Check size={18} className="text-accent" />
    return <X size={18} className="text-dark-muted/40" />
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-4xl mx-auto">
        {user && (
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-1 text-sm text-dark-muted hover:text-accent mb-6"
          >
            <ArrowLeft size={14} /> Volver al app
          </button>
        )}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">
            mi Econom<span className="text-accent">IA</span>
          </h1>
          <p className="text-dark-muted">Elegí el plan que mejor se adapte a vos</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className={`bg-dark-surface border rounded-2xl p-6 ${
            user?.plan === 'free' ? 'border-accent' : 'border-dark-border'
          }`}>
            {user?.plan === 'free' && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full mb-4 inline-block">
                Tu plan actual
              </span>
            )}
            <h3 className="text-xl font-bold mb-1">Free</h3>
            <p className="text-3xl font-bold font-mono mb-1">
              $0 <span className="text-sm font-normal text-dark-muted">/mes</span>
            </p>
            <p className="text-sm text-dark-muted mb-6">Para empezar a organizar tus finanzas</p>

            {!user ? (
              <button
                onClick={() => navigate('/register')}
                className="w-full border border-accent text-accent font-semibold py-2.5 rounded-lg hover:bg-accent/10"
              >
                Empezar gratis
              </button>
            ) : user.plan === 'free' ? (
              <button disabled className="w-full border border-dark-border text-dark-muted py-2.5 rounded-lg cursor-default">
                Plan actual
              </button>
            ) : null}
          </div>

          {/* Pro */}
          <div className={`bg-dark-surface border rounded-2xl p-6 relative overflow-hidden ${
            user?.plan === 'pro' ? 'border-accent' : 'border-dark-border'
          }`}>
            <div className="absolute top-0 right-0 bg-accent text-dark-bg text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMENDADO
            </div>
            {user?.plan === 'pro' && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full mb-4 inline-block">
                Tu plan actual
              </span>
            )}
            <h3 className="text-xl font-bold mb-1">Pro</h3>
            <p className="text-3xl font-bold font-mono mb-1">
              <span className="text-accent">$2.999</span>{' '}
              <span className="text-sm font-normal text-dark-muted">/mes</span>
            </p>
            <p className="text-sm text-dark-muted mb-6">Todo lo que necesitás para tus finanzas</p>

            {user?.plan === 'pro' ? (
              <button disabled className="w-full border border-accent text-accent py-2.5 rounded-lg cursor-default">
                Plan actual
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                className="w-full bg-accent text-dark-bg font-semibold py-2.5 rounded-lg hover:bg-accent/90"
              >
                Suscribirse a Pro
              </button>
            )}
          </div>
        </div>

        {/* Feature comparison */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-6 py-4 text-left font-medium text-dark-muted">Funcionalidad</th>
                <th className="px-6 py-4 text-center font-medium">Free</th>
                <th className="px-6 py-4 text-center font-medium text-accent">Pro</th>
              </tr>
            </thead>
            <tbody>
              {features.map(({ name, free, pro }) => (
                <tr key={name} className="border-b border-dark-border/50">
                  <td className="px-6 py-3">{name}</td>
                  <td className="px-6 py-3 text-center"><FeatureValue value={free} /></td>
                  <td className="px-6 py-3 text-center"><FeatureValue value={pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
