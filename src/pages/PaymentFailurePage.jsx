import { useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'

export default function PaymentFailurePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 max-w-md w-full text-center">
        <XCircle size={64} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pago no completado</h1>
        <p className="text-dark-muted mb-6">
          Hubo un problema con el pago. Podés intentar nuevamente o contactarnos si el problema persiste.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/pricing')}
            className="bg-accent text-dark-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/90"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => navigate('/app')}
            className="border border-dark-border text-dark-muted px-6 py-2.5 rounded-lg hover:text-dark-text"
          >
            Volver al app
          </button>
        </div>
      </div>
    </div>
  )
}
