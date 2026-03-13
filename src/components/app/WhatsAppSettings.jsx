import { useState } from 'react'
import { Smartphone, Wifi, WifiOff, Send, HelpCircle } from 'lucide-react'

const COMMANDS = [
  { cmd: 'resumen', desc: 'Resumen del mes actual' },
  { cmd: 'cuanto gaste', desc: 'Total de gastos este mes' },
  { cmd: 'ultimo gasto', desc: 'Tu último gasto registrado' },
  { cmd: 'ayuda', desc: 'Lista de comandos disponibles' },
]

const MOCK_MESSAGES = [
  { from: 'user', text: 'resumen' },
  { from: 'bot', text: '📊 Resumen de marzo 2026:\n\nIngresos: $850.000\nGastos: $423.500\nBalance: $426.500\n\nTop categorías:\n🍔 Alimentación: $156.000\n🏠 Vivienda: $120.000\n🚗 Transporte: $67.500' },
  { from: 'user', text: 'ultimo gasto' },
  { from: 'bot', text: '📝 Último gasto:\n\nSupermercado Coto\n$15.430 - Alimentación\n12/03/2026' },
]

export default function WhatsAppSettings() {
  const [status, setStatus] = useState('disconnected')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSendCode = () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) {
      setError('Ingresá un número válido')
      return
    }
    setError('')
    setStatus('verifying')
  }

  const handleVerify = () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos')
      return
    }
    setError('')
    setStatus('connected')
  }

  const handleDisconnect = () => {
    setStatus('disconnected')
    setPhone('')
    setCode('')
  }

  const statusDot = status === 'connected' ? 'bg-accent' : status === 'verifying' ? 'bg-yellow-400' : 'bg-red-400'
  const statusLabel = status === 'connected' ? 'Conectado' : status === 'verifying' ? 'Verificando' : 'Desconectado'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Smartphone className="text-green-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-text">WhatsApp Bot</h2>
            <p className="text-sm text-dark-muted">Consultá tus finanzas desde WhatsApp</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className="text-xs text-dark-muted">{statusLabel}</span>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
        {status === 'disconnected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <WifiOff size={16} className="text-dark-muted" />
              <h3 className="text-sm font-semibold">Conectar WhatsApp</h3>
            </div>
            <p className="text-sm text-dark-muted">
              Ingresá tu número de teléfono para vincular tu cuenta con nuestro bot de WhatsApp.
            </p>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 1234-5678"
                maxLength={20}
                className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleSendCode}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center gap-1"
              >
                <Send size={14} /> Enviar código
              </button>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>
        )}

        {status === 'verifying' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Verificar código</h3>
            <p className="text-sm text-dark-muted">
              Te enviamos un código de 6 dígitos al {phone}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm font-mono text-center tracking-widest focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleVerify}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600"
              >
                Verificar
              </button>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button onClick={() => setStatus('disconnected')} className="text-xs text-dark-muted hover:text-dark-text">
              Cambiar número
            </button>
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi size={16} className="text-accent" />
                <h3 className="text-sm font-semibold">Conectado</h3>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 rounded"
              >
                Desconectar
              </button>
            </div>
            <p className="text-sm text-dark-muted">
              Enviá mensajes a nuestro bot de WhatsApp para consultar tus finanzas.
            </p>
          </div>
        )}
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={16} className="text-dark-muted" />
          <h3 className="text-sm font-semibold">Comandos disponibles</h3>
        </div>
        <div className="space-y-2">
          {COMMANDS.map((c) => (
            <div key={c.cmd} className="flex items-center justify-between bg-dark-bg rounded-lg px-3 py-2">
              <span className="text-sm font-mono text-accent">{c.cmd}</span>
              <span className="text-xs text-dark-muted">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Ejemplo de conversación</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {MOCK_MESSAGES.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                  msg.from === 'user'
                    ? 'bg-green-500/20 text-green-300 rounded-tr-sm'
                    : 'bg-dark-bg text-dark-text rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
