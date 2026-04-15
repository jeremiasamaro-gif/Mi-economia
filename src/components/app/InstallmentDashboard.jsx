import { useState } from 'react'
import { CreditCard, Calendar, XCircle, MoreVertical } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'
import useInstallmentStore, { yearMonthToLabel } from '../../store/installmentStore'
import { PaymentMethodIcon } from './ExpenseTable'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const PAYMENT_LABELS = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  credito: 'Crédito',
  transferencia: 'Transfer.',
  mercadopago: 'MP',
}

export default function InstallmentDashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const plans = useInstallmentStore((s) => s.getPlansForUser(user?.id))
  const activePlans = useInstallmentStore((s) => s.getActivePlans(user?.id))
  const thisMonthTotal = useInstallmentStore((s) => s.getThisMonthTotal(user?.id))
  const totalRemaining = useInstallmentStore((s) => s.getTotalRemaining(user?.id))
  const cancelPlan = useInstallmentStore((s) => s.cancelInstallmentPlan)

  const [cancelConfirm, setCancelConfirm] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)

  // Only show if there are any plans at all (active or completed)
  if (plans.length === 0) return null

  const handleCancel = (planId) => {
    cancelPlan(planId)
    setCancelConfirm(null)
    setMenuOpen(null)
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <CreditCard size={20} className="text-blue-400" />
        {t('installments.activeTitle')}
      </h3>

      {/* Summary cards */}
      {activePlans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <p className="text-xs text-dark-muted mb-1">{t('installments.totalInInstallments')}</p>
            <p className="text-xl font-bold font-mono text-red-400">{formatARS(totalRemaining)}</p>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <p className="text-xs text-dark-muted mb-1">{t('installments.thisMonth')}</p>
            <p className="text-xl font-bold font-mono text-blue-400">{formatARS(thisMonthTotal)}</p>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <p className="text-xs text-dark-muted mb-1">{t('installments.activePlans')}</p>
            <p className="text-xl font-bold font-mono text-accent">{activePlans.length}</p>
          </div>
        </div>
      )}

      {/* Plans table */}
      {activePlans.length > 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border text-dark-muted text-left">
                  <th className="px-4 py-3 font-medium">{t('expenses.description')}</th>
                  <th className="px-4 py-3 font-medium">{t('installments.paymentMethod')}</th>
                  <th className="px-4 py-3 font-medium">{t('installments.installments')}</th>
                  <th className="px-4 py-3 font-medium text-right">{t('installments.perMonth')}</th>
                  <th className="px-4 py-3 font-medium text-right">{t('installments.remaining')}</th>
                  <th className="px-4 py-3 font-medium">{t('installments.nextInstallment')}</th>
                  <th className="px-4 py-3 font-medium">{t('installments.progress')}</th>
                  <th className="px-4 py-3 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {activePlans.map((plan) => {
                  const progressPct = Math.round((plan.paid_installments / plan.total_installments) * 100)
                  const remaining = (plan.total_installments - plan.paid_installments) * plan.installment_amount

                  return (
                    <tr key={plan.id} className="border-b border-dark-border/50 hover:bg-dark-hover">
                      <td className="px-4 py-3">
                        <p className="font-medium">{plan.description}</p>
                        <p className="text-[10px] text-dark-muted">{plan.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <PaymentMethodIcon method={plan.payment_method} />
                          <span className="text-xs">{PAYMENT_LABELS[plan.payment_method] || plan.payment_method}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="text-accent">{plan.paid_installments}</span>
                        <span className="text-dark-muted">/{plan.total_installments}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatARS(plan.installment_amount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-400">{formatARS(remaining)}</td>
                      <td className="px-4 py-3 text-xs capitalize">{yearMonthToLabel(plan.next_due_date)}</td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progressPct > 50 ? 'bg-accent' : 'bg-amber-500'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-dark-muted mt-0.5 text-center">{progressPct}%</p>
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === plan.id ? null : plan.id)}
                          className="text-dark-muted hover:text-dark-text"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen === plan.id && (
                          <div className="absolute right-4 top-full mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-20 w-48">
                            <button
                              onClick={() => {
                                setCancelConfirm(plan.id)
                                setMenuOpen(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-dark-hover rounded-lg"
                            >
                              <XCircle size={14} />
                              {t('installments.cancelPlan')}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center text-dark-muted text-sm">
          {t('installments.noActive')}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-sm p-6">
            <h4 className="text-lg font-bold mb-2">{t('installments.cancelPlan')}</h4>
            <p className="text-sm text-dark-muted mb-4">
              {t('installments.cancelConfirmText')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm border border-dark-border text-dark-muted hover:bg-dark-hover"
              >
                {t('expenses.cancel')}
              </button>
              <button
                onClick={() => handleCancel(cancelConfirm)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600"
              >
                {t('installments.cancelPlan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
