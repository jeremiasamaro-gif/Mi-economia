import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginForm({ onLogin, error, loading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) return
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            mi Econom<span className="text-accent">IA</span>
          </h1>
          <p className="text-dark-muted text-sm">Tu asistente financiero inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-surface border border-dark-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

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
                maxLength={100}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent pr-10"
                placeholder="••••••••"
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
            Ingresar
          </button>

          <div className="text-center text-sm text-dark-muted space-y-2">
            <Link to="/forgot-password" className="block hover:text-accent">
              ¿Olvidaste tu contraseña?
            </Link>
            <p>
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-accent hover:underline">
                Registrate
              </Link>
            </p>
          </div>

          {/* Demo hint */}
          <div className="border-t border-dark-border pt-3 mt-3">
            <p className="text-xs text-dark-muted text-center mb-2">Demo: usá estas credenciales</p>
            <div className="text-xs font-mono bg-dark-bg rounded p-2 space-y-1">
              <p>Admin: maria@ejemplo.com</p>
              <p>User Pro: juan@ejemplo.com</p>
              <p>User Free: ana@ejemplo.com</p>
              <p className="text-dark-muted">(cualquier contraseña)</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
