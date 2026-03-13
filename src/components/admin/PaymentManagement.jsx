import { CreditCard, CheckCircle, Clock, ArrowUpCircle } from 'lucide-react'
import useAdminStore from '../../store/adminStore'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function PaymentManagement() {
  const payments = useAdminStore((s) => s.payments)
  const updatePlan = useAdminStore((s) => s.updateUserPlan)

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Pagos</h2>
      <p className="text-sm text-dark-muted mb-6">
        Pagos recientes de MercadoPago. Activá Pro manualmente después de confirmar el pago.
      </p>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border text-dark-muted text-left">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">MP ID</th>
              <th className="px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-dark-border/50 hover:bg-dark-hover">
                <td className="px-4 py-3 font-mono text-dark-muted text-xs">
                  {new Date(p.date).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3">{p.user_email}</td>
                <td className="px-4 py-3 font-mono">{formatARS(p.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 text-xs ${
                    p.status === 'approved' ? 'text-accent' : 'text-yellow-400'
                  }`}>
                    {p.status === 'approved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {p.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-dark-muted">{p.mp_payment_id}</td>
                <td className="px-4 py-3">
                  {p.status === 'approved' && (
                    <button
                      onClick={() => updatePlan(p.user_id, 'pro')}
                      className="text-accent hover:text-accent/80 flex items-center gap-1 text-xs"
                    >
                      <ArrowUpCircle size={14} /> Activar Pro
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
