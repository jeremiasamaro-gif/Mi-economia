import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterForm({ onRegister, error, loading }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fullName || !email || !password) return
    if (password.length < 6) return
    onRegister(email, password, fullName)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            mi Econom<span className="text-accent">IA</span>
          </h1>
          <p className="text-dark-muted text-sm">Creá tu cuenta gratis</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-surface border border-dark-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Registrarse</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-dark-muted block mb-1">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
              placeholder="Tu nombre"
              required
            />
          </div>

          <div>
            <label className="text-sm text-dark-muted block mb-1">Email</label>
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

          <div>
            <label className="text-sm text-dark-muted block mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                maxLength={100}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent pr-10"
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-dark-bg font-semibold py-2.5 rounded-lg hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Crear cuenta
          </button>

          <p className="text-center text-sm text-dark-muted">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Ingresá
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
