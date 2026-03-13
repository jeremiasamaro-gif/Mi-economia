import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO SUPABASE: replace with supabase.auth.resetPasswordForEmail(email)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            mi Econom<span className="text-accent">IA</span>
          </h1>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-accent text-xl">✉</span>
              </div>
              <h2 className="text-lg font-semibold">Email enviado</h2>
              <p className="text-sm text-dark-muted">
                Si existe una cuenta con {email}, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link to="/login" className="text-accent text-sm hover:underline block mt-4">
                Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Link to="/login" className="flex items-center gap-1 text-sm text-dark-muted hover:text-accent">
                <ArrowLeft size={14} /> Volver
              </Link>
              <h2 className="text-lg font-semibold">Recuperar contraseña</h2>
              <p className="text-sm text-dark-muted">
                Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={100}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent text-dark-bg font-semibold py-2.5 rounded-lg hover:bg-accent/90"
              >
                Enviar enlace
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
