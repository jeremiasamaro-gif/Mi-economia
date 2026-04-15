import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Edit3, Check, X, Tag, Users, PenLine, ScanLine, CreditCard, Banknote, ArrowRightLeft, CircleDollarSign } from 'lucide-react'
import { useExpenses } from '../../hooks/useExpenses'
import { usePlan } from '../../hooks/usePlan'
import { useTranslation } from '../../hooks/useTranslation'
import { useAuth } from '../../hooks/useAuth'
import { CATEGORIES } from '../../store/mockData'
import useInstallmentStore, { getCurrentYearMonth } from '../../store/installmentStore'
import UpgradeModal from '../shared/UpgradeModal'
import TicketScanner from './TicketScanner'
import InstallmentConfirmModal from './InstallmentConfirmModal'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

// Payment method icons (SVG via lucide — no emoji)
function PaymentMethodIcon({ method, size = 14 }) {
  const cls = 'shrink-0'
  switch (method) {
    case 'efectivo': return <Banknote size={size} className={`${cls} text-yellow-400`} />
    case 'debito': return <CreditCard size={size} className={`${cls} text-gray-400`} />
    case 'credito': return <CreditCard size={size} className={`${cls} text-green-400`} />
    case 'transferencia': return <ArrowRightLeft size={size} className={`${cls} text-blue-400`} />
    case 'mercadopago': return <CircleDollarSign size={size} className={`${cls} text-sky-400`} />
    default: return null
  }
}

export { PaymentMethodIcon }

export default function ExpenseTable() {
  const { expenses, currentMonthCount, canAdd, addExpense, updateExpense, deleteExpense } = useExpenses()
  const { maxExpenses, isPro, canUseTags, canUseSplitting, canUseScanner } = usePlan()
  const { user } = useAuth()
  const { t } = useTranslation()
  const addInstallmentPlan = useInstallmentStore((s) => s.addInstallmentPlan)
  const thisMonthTotal = useInstallmentStore((s) => s.getThisMonthTotal(user?.id))
  const checkAndPopulate = useInstallmentStore((s) => s.checkAndPopulate)

  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [showInstallmentModal, setShowInstallmentModal] = useState(false)
  const [installmentSubmitting, setInstallmentSubmitting] = useState(false)
  const [installmentDismissed, setInstallmentDismissed] = useState(false)
  const addMenuRef = useRef(null)

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Otros',
    description: '',
    amount: '',
    type: 'expense',
    tags: [],
    recurring: false,
    split_with: null,
    payment_method: '',
    cuotas: 1,
  })
  const [tagInput, setTagInput] = useState('')

  // Check and populate installments on mount
  useEffect(() => {
    checkAndPopulate()
  }, [user?.id])

  // Check if installment banner was dismissed this month
  useEffect(() => {
    if (!user?.id) return
    const key = `mi-economia:installments-dismissed:${user.id}:${getCurrentYearMonth()}`
    setInstallmentDismissed(localStorage.getItem(key) === 'true')
  }, [user?.id])

  // Sort by date desc
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))

  // This month's installment expenses
  const currentMonth = getCurrentYearMonth()
  const thisMonthInstallments = expenses.filter(
    (e) => e.installment_id && e.date?.startsWith(currentMonth)
  )

  const handleAdd = () => {
    if (!canAdd) {
      setShowUpgrade(true)
      return
    }
    const amount = Number(newExpense.amount)
    if (!newExpense.description || !amount) return

    // If cuotas > 1, show confirmation modal
    const cuotas = Math.floor(Number(newExpense.cuotas) || 1)
    if (cuotas > 1 && (newExpense.payment_method === 'credito' || newExpense.payment_method === 'mercadopago')) {
      setShowInstallmentModal(true)
      return
    }

    // Normal single expense
    addExpense({
      ...newExpense,
      amount,
      payment_method: newExpense.payment_method || null,
    })
    resetForm()
  }

  const handleInstallmentConfirm = () => {
    if (installmentSubmitting) return
    setInstallmentSubmitting(true)

    try {
      const result = addInstallmentPlan({
        description: newExpense.description,
        category: newExpense.category,
        total_amount: Number(newExpense.amount),
        total_installments: Math.floor(Number(newExpense.cuotas)),
        payment_method: newExpense.payment_method,
        tags: newExpense.tags,
      })

      if (result.error) {
        console.warn('Installment creation failed:', result.error)
      }
    } finally {
      setInstallmentSubmitting(false)
      setShowInstallmentModal(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Otros',
      description: '',
      amount: '',
      type: 'expense',
      tags: [],
      recurring: false,
      split_with: null,
      payment_method: '',
      cuotas: 1,
    })
    setShowAdd(false)
  }

  const startEdit = (expense) => {
    setEditingId(expense.id)
    setEditData({ ...expense })
  }

  const saveEdit = () => {
    updateExpense(editingId, editData)
    setEditingId(null)
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    setNewExpense((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
    setTagInput('')
  }

  const dismissInstallmentBanner = () => {
    if (!user?.id) return
    const key = `mi-economia:installments-dismissed:${user.id}:${getCurrentYearMonth()}`
    localStorage.setItem(key, 'true')
    setInstallmentDismissed(true)
  }

  // Close menu on outside click
  useEffect(() => {
    if (!showAddMenu) return
    const handleClick = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showAddMenu])

  // Installment form helpers
  const showCuotas = newExpense.type === 'expense' && (newExpense.payment_method === 'credito' || newExpense.payment_method === 'mercadopago')
  const cuotasAmount = showCuotas && Number(newExpense.amount) > 0 && Number(newExpense.cuotas) > 1
    ? Math.round((Number(newExpense.amount) / Number(newExpense.cuotas)) * 100) / 100
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{t('expenses.title')}</h2>
          {!isPro && (
            <p className="text-sm text-dark-muted mt-1">
              <span className="font-mono text-accent">{currentMonthCount}</span>
              <span className="text-dark-muted">/{maxExpenses} {t('expenses.monthCount')}</span>
            </p>
          )}
        </div>
        <div className="relative" ref={addMenuRef}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 bg-accent text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90"
          >
            <Plus size={16} /> {t('expenses.add')}
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-dark-surface border border-dark-border rounded-xl shadow-lg z-30 overflow-hidden">
              <button
                onClick={() => {
                  setShowAddMenu(false)
                  if (canAdd) setShowAdd(true)
                  else setShowUpgrade(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-hover transition-colors text-left"
              >
                <PenLine size={18} className="text-accent" />
                <div>
                  <p className="text-sm font-medium">{t('expenses.addManual')}</p>
                  <p className="text-[11px] text-dark-muted">Completá los datos vos mismo</p>
                </div>
              </button>
              <div className="border-t border-dark-border" />
              <button
                onClick={() => {
                  setShowAddMenu(false)
                  if (canUseScanner) setShowScanner(true)
                  else setShowUpgrade(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-hover transition-colors text-left"
              >
                <ScanLine size={18} className="text-accent" />
                <div>
                  <p className="text-sm font-medium">{t('expenses.scanTicket')}</p>
                  <p className="text-[11px] text-dark-muted">Foto o cámara — lee el total automático</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar for free plan */}
      {!isPro && (
        <div className="mb-4">
          <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                currentMonthCount / maxExpenses > 0.8 ? 'bg-red-500' : currentMonthCount / maxExpenses > 0.6 ? 'bg-yellow-500' : 'bg-accent'
              }`}
              style={{ width: `${Math.min(100, (currentMonthCount / maxExpenses) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Installment notification banner */}
      {thisMonthInstallments.length > 0 && !installmentDismissed && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">{t('installments.thisMonth')}</h4>
              <div className="space-y-1">
                {thisMonthInstallments.map((e) => (
                  <p key={e.id} className="text-xs text-dark-muted">
                    {e.description} — <span className="font-mono text-dark-text">{formatARS(e.amount)}</span>
                  </p>
                ))}
              </div>
              <p className="text-xs font-semibold text-blue-400 mt-2">
                {t('installments.totalInInstallments')}: <span className="font-mono">{formatARS(thisMonthTotal)}</span>
              </p>
            </div>
            <button onClick={dismissInstallmentBanner} className="text-dark-muted hover:text-dark-text">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t('expenses.description')}
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              maxLength={200}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              placeholder={t('expenses.amount')}
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              min="0"
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent font-mono"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={newExpense.type}
              onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value, payment_method: e.target.value === 'income' ? '' : newExpense.payment_method, cuotas: 1 })}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="expense">{t('expenses.expense')}</option>
              <option value="income">{t('expenses.income')}</option>
            </select>

            {/* Payment method — only for expenses */}
            {newExpense.type === 'expense' && (
              <select
                value={newExpense.payment_method}
                onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value, cuotas: 1 })}
                className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent w-[160px]"
              >
                <option value="">{t('installments.paymentMethod')}</option>
                <option value="efectivo">{t('installments.cash')}</option>
                <option value="debito">{t('installments.debit')}</option>
                <option value="credito">{t('installments.credit')}</option>
                <option value="transferencia">{t('installments.transfer')}</option>
                <option value="mercadopago">Mercado Pago</option>
              </select>
            )}

            {/* Cuotas — only for crédito or mercadopago */}
            {showCuotas && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-dark-muted">{t('installments.installments')}:</label>
                <input
                  type="number"
                  value={newExpense.cuotas}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(48, Math.floor(Number(e.target.value) || 1)))
                    setNewExpense({ ...newExpense, cuotas: v })
                  }}
                  min="1"
                  max="48"
                  step="1"
                  className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 text-sm w-[80px] font-mono focus:outline-none focus:border-accent"
                />
              </div>
            )}

            {canUseTags && (
              <div className="flex items-center gap-1">
                <Tag size={14} className="text-dark-muted" />
                <input
                  type="text"
                  placeholder="Tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  maxLength={30}
                  className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 text-xs w-24 focus:outline-none focus:border-accent"
                />
                {newExpense.tags.map((tg) => (
                  <span key={tg} className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                    {tg}
                  </span>
                ))}
              </div>
            )}

            {canUseSplitting && (
              <div className="flex items-center gap-1">
                <Users size={14} className="text-dark-muted" />
                <input
                  type="number"
                  placeholder="Dividir"
                  value={newExpense.split_with || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, split_with: Number(e.target.value) || null })}
                  min="2"
                  max="20"
                  className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:border-accent"
                />
              </div>
            )}

            <div className="flex-1" />
            <button onClick={handleAdd} className="bg-accent text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90">
              {t('expenses.save')}
            </button>
            <button onClick={() => setShowAdd(false)} className="text-dark-muted hover:text-dark-text text-sm">
              {t('expenses.cancel')}
            </button>
          </div>

          {/* Cuotas live preview */}
          {cuotasAmount && (
            <p className="text-accent text-[11px] font-medium">
              = {formatARS(cuotasAmount)} / mes {t('installments.during')} {newExpense.cuotas} {t('installments.months')}
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-dark-muted text-left">
                <th className="px-4 py-3 font-medium">{t('expenses.date')}</th>
                <th className="px-4 py-3 font-medium">{t('expenses.category')}</th>
                <th className="px-4 py-3 font-medium">{t('expenses.description')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('expenses.amount')}</th>
                <th className="px-4 py-3 font-medium">{t('expenses.type')}</th>
                {isPro && <th className="px-4 py-3 font-medium">{t('expenses.tags')}</th>}
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((exp) => (
                <tr
                  key={exp.id}
                  className={`border-b border-dark-border/50 hover:bg-dark-hover ${
                    exp.type === 'income' ? 'bg-accent/5' : ''
                  }`}
                >
                  {editingId === exp.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                          className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-accent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          maxLength={200}
                          className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-accent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editData.amount}
                          onChange={(e) => setEditData({ ...editData, amount: Number(e.target.value) })}
                          className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm w-full text-right font-mono focus:outline-none focus:border-accent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={editData.type}
                          onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                          className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                        >
                          <option value="expense">{t('expenses.expense')}</option>
                          <option value="income">{t('expenses.income')}</option>
                        </select>
                      </td>
                      {isPro && <td className="px-4 py-2"></td>}
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <button onClick={saveEdit} className="text-accent hover:text-accent/80">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-dark-muted hover:text-dark-text">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-dark-muted">{exp.date}</td>
                      <td className="px-4 py-3">
                        <span className="bg-dark-bg px-2 py-0.5 rounded text-xs">{exp.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {exp.payment_method && <PaymentMethodIcon method={exp.payment_method} />}
                          <span>{exp.description}</span>
                          {exp.recurring && <span className="text-accent text-xs">↻</span>}
                          {exp.split_with && (
                            <span className="text-xs text-dark-muted">÷{exp.split_with}</span>
                          )}
                          {exp.installment_number && exp.installment_id && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-mono font-medium">
                              {exp.installment_number}/{
                                (() => {
                                  const plan = useInstallmentStore.getState().plans.find((p) => p.id === exp.installment_id)
                                  return plan?.total_installments || '?'
                                })()
                              }
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-medium ${
                        exp.type === 'income' ? 'text-accent' : 'text-dark-text'
                      }`}>
                        {exp.type === 'income' ? '+' : '-'}{formatARS(exp.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          exp.type === 'income'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {exp.type === 'income' ? t('expenses.income') : t('expenses.expense')}
                        </span>
                      </td>
                      {isPro && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {exp.tags?.map((tg) => (
                              <span key={tg} className="text-[10px] bg-dark-bg px-1.5 py-0.5 rounded text-dark-muted">
                                {tg}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(exp)} className="text-dark-muted hover:text-accent">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => deleteExpense(exp.id)} className="text-dark-muted hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-dark-muted">
            <p>{t('expenses.noExpenses')}</p>
            <p className="text-sm mt-1">Hacé clic en "Agregar" para empezar</p>
          </div>
        )}
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} feature="Gastos ilimitados" />
      <TicketScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onExpenseAdded={(expense) => addExpense(expense)}
      />
      <InstallmentConfirmModal
        isOpen={showInstallmentModal}
        onClose={() => setShowInstallmentModal(false)}
        onConfirm={handleInstallmentConfirm}
        data={showInstallmentModal ? {
          description: newExpense.description,
          amount: Number(newExpense.amount),
          cuotas: Math.floor(Number(newExpense.cuotas)),
          payment_method: newExpense.payment_method,
          category: newExpense.category,
        } : null}
        submitting={installmentSubmitting}
      />
    </div>
  )
}
