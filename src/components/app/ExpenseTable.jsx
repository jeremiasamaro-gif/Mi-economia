import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Edit3, Check, X, Tag, Users, PenLine, ScanLine } from 'lucide-react'
import { useExpenses } from '../../hooks/useExpenses'
import { usePlan } from '../../hooks/usePlan'
import { useTranslation } from '../../hooks/useTranslation'
import { CATEGORIES } from '../../store/mockData'
import UpgradeModal from '../shared/UpgradeModal'
import TicketScanner from './TicketScanner'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function ExpenseTable() {
  const { expenses, currentMonthCount, canAdd, addExpense, updateExpense, deleteExpense } = useExpenses()
  const { maxExpenses, isPro, canUseTags, canUseSplitting, canUseScanner } = usePlan()
  const { t } = useTranslation()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [showAdd, setShowAdd] = useState(false)
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
  })
  const [tagInput, setTagInput] = useState('')

  // Sort by date desc
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleAdd = () => {
    if (!canAdd) {
      setShowUpgrade(true)
      return
    }
    const amount = Number(newExpense.amount)
    if (!newExpense.description || !amount) return
    addExpense({ ...newExpense, amount })
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Otros',
      description: '',
      amount: '',
      type: 'expense',
      tags: [],
      recurring: false,
      split_with: null,
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

  // Cerrar menú al hacer clic fuera
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
              onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="expense">{t('expenses.expense')}</option>
              <option value="income">{t('expenses.income')}</option>
            </select>

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
                {newExpense.tags.map((t) => (
                  <span key={t} className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                    {t}
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
                        {exp.description}
                        {exp.recurring && <span className="ml-1 text-accent text-xs">↻</span>}
                        {exp.split_with && (
                          <span className="ml-1 text-xs text-dark-muted">÷{exp.split_with}</span>
                        )}
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
                            {exp.tags?.map((t) => (
                              <span key={t} className="text-[10px] bg-dark-bg px-1.5 py-0.5 rounded text-dark-muted">
                                {t}
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
    </div>
  )
}
