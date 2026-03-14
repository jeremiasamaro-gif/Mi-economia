import { Plug } from 'lucide-react'
import WhatsAppSettings from '../app/WhatsAppSettings'

export default function Integraciones() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Plug className="text-accent" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-text">Integraciones</h2>
          <p className="text-sm text-dark-muted">Conectá servicios externos a tu cuenta</p>
        </div>
      </div>

      {/* WhatsApp integration */}
      <WhatsAppSettings />
    </div>
  )
}
