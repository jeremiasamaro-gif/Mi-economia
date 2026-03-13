import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()

  // TODO MP: implement webhook to auto-upgrade user on payment confirmed

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 max-w-md w-full text-center">
        <CheckCircle size={64} className="mx-auto text-accent mb-4" />
        <h1 className="text-2xl font-bold mb-2">¡Pago recibido!</h1>
        <p className="text-dark-muted mb-6">
          Tu cuenta será activada en minutos. Recibirás un email de confirmación cuando tu plan Pro esté activo.
        </p>
        <button
          onClick={() => navigate('/app')}
          className="bg-accent text-dark-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/90"
        >
          Volver al app
        </button>
      </div>
    </div>
  )
}
