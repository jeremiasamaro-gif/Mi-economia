import { X, CreditCard, Calendar, Hash } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { yearMonthToLabel, addMonthsToYearMonth, getCurrentYearMonth } from '../../store/installmentStore'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const PAYMENT_LABELS = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  credito: 'Crédito',
  transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago',
}

export default function InstallmentConfirmModal({ isOpen, onClose, onConfirm, data, submitting }) {
  const { t } = useTranslation()
  if (!isOpen || !data) return null

  const installmentAmount = Math.round((data.amount / data.cuotas) * 100) / 100
  const startMonth = getCurrentYearMonth()
  const endMonth = addMonthsToYearMonth(startMonth, data.cuotas - 1)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h3 className="text-lg font-bold">{t('installments.confirmTitle')}</h3>
          <button onClick={onClose} className="text-dark-muted hover:text-dark-text">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Description */}
          <div className="bg-dark-bg rounded-xl p-4">
            <p className="text-sm text-dark-muted mb-1">{t('expenses.description')}</p>
            <p className="font-medium">{data.description}</p>
          </div>

          {/* Grid details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-bg rounded-xl p-3">
              <p className="text-xs text-dark-muted mb-1">Total</p>
              <p className="text-lg font-bold font-mono text-red-400">{formatARS(data.amount)}</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3">
              <p className="text-xs text-dark-muted mb-1">{t('installments.installments')}</p>
              <p className="text-lg font-bold font-mono text-accent">
                {data.cuotas} x {formatARS(installmentAmount)}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-dark-bg rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-accent" />
              <span className="text-dark-muted">{t('installments.firstInstallment')}:</span>
              <span className="font-medium capitalize">{yearMonthToLabel(startMonth)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-red-400" />
              <span className="text-dark-muted">{t('installments.lastInstallment')}:</span>
              <span className="font-medium capitalize">{yearMonthToLabel(endMonth)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard size={14} className="text-blue-400" />
              <span className="text-dark-muted">{t('installments.paymentMethod')}:</span>
              <span className="font-medium">{PAYMENT_LABELS[data.payment_method] || data.payment_method}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Hash size={14} className="text-dark-muted" />
              <span className="text-dark-muted">{t('expenses.category')}:</span>
              <span className="font-medium">{data.category}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-dark-border">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-dark-border text-dark-muted hover:bg-dark-hover"
          >
            {t('expenses.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            aria-busy={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-dark-bg hover:bg-accent/90 disabled:opacity-50"
          >
            {submitting ? '...' : t('installments.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
