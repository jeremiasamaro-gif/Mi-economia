import { create } from 'zustand'
import useExpenseStore from './expenseStore'
import useAuthStore from './authStore'
import { CATEGORIES } from './mockData'

// TODO SUPABASE: replace with supabase.from('installment_plans').select/insert/update

const VALID_PAYMENT_METHODS = ['efectivo', 'debito', 'credito', 'transferencia', 'mercadopago']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentYearMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function addMonthsToYearMonth(yearMonth, months) {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m - 1 + months, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getFirstDayOfMonth(yearMonth) {
  return `${yearMonth}-01`
}

function yearMonthToLabel(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateInstallmentInput(data) {
  const errors = []

  if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
    errors.push('Descripción requerida')
  }
  if (!data.category || !CATEGORIES.includes(data.category)) {
    errors.push('Categoría inválida')
  }
  const amount = Number(data.total_amount)
  if (!amount || amount <= 0 || amount > 99_999_999) {
    errors.push('Monto inválido')
  }
  const installments = Number(data.total_installments)
  if (!Number.isInteger(installments) || installments < 2 || installments > 48) {
    errors.push('Cuotas debe ser entre 2 y 48')
  }
  if (!VALID_PAYMENT_METHODS.includes(data.payment_method)) {
    errors.push('Método de pago inválido')
  }

  return errors
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const useInstallmentStore = create((set, get) => ({
  plans: [],

  // ---- CRUD ----

  addInstallmentPlan: (formData) => {
    const errors = validateInstallmentInput(formData)
    if (errors.length > 0) {
      console.warn('Installment validation failed:', errors)
      return { error: errors.join(', '), plan: null }
    }

    const user = useAuthStore.getState().user
    if (!user) return { error: 'NOT_AUTHENTICATED', plan: null }

    const totalAmount = Math.abs(Number(formData.total_amount))
    const totalInstallments = Math.floor(Number(formData.total_installments))

    // Server-side calculation — never trust client
    const installmentAmount = Math.round((totalAmount / totalInstallments) * 100) / 100

    const plan = {
      id: crypto.randomUUID(),
      user_id: user.id,
      description: String(formData.description).replace(/<[^>]*>/g, '').trim().slice(0, 200),
      category: formData.category,
      total_amount: totalAmount,
      installment_amount: installmentAmount,
      total_installments: totalInstallments,
      paid_installments: 0,
      payment_method: formData.payment_method,
      start_date: getCurrentYearMonth(),
      next_due_date: getCurrentYearMonth(),
      status: 'active',
      tags: Array.isArray(formData.tags) ? formData.tags.map((t) => String(t).slice(0, 30)).slice(0, 10) : [],
      created_at: new Date().toISOString(),
    }

    set((state) => ({ plans: [...state.plans, plan] }))

    // Register first installment immediately
    get().registerNextInstallment(plan.id)

    return { error: null, plan }
  },

  updateInstallmentPlan: (id, updates) => {
    const user = useAuthStore.getState().user
    if (!user) return

    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id && p.user_id === user.id ? { ...p, ...updates } : p
      ),
    }))
  },

  cancelInstallmentPlan: (id) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const plan = get().plans.find((p) => p.id === id && p.user_id === user.id)
    if (!plan || plan.status !== 'active') return

    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id && p.user_id === user.id ? { ...p, status: 'cancelled' } : p
      ),
    }))
  },

  // ---- Register next installment expense ----

  registerNextInstallment: (planId) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const plan = get().plans.find((p) => p.id === planId && p.user_id === user.id)
    if (!plan || plan.status !== 'active') return
    if (plan.paid_installments >= plan.total_installments) {
      get().updateInstallmentPlan(planId, { status: 'completed' })
      return
    }

    const installmentNumber = plan.paid_installments + 1

    // Check idempotency — don't create duplicate installments
    const expenses = useExpenseStore.getState().expenses
    const alreadyExists = expenses.some(
      (e) => e.installment_id === plan.id && e.installment_number === installmentNumber
    )
    if (alreadyExists) return

    const expense = {
      date: getFirstDayOfMonth(plan.next_due_date),
      category: plan.category,
      description: `Cuota ${installmentNumber}/${plan.total_installments} — ${plan.description}`,
      amount: plan.installment_amount,
      type: 'expense',
      payment_method: plan.payment_method,
      installment_id: plan.id,
      installment_number: installmentNumber,
      tags: plan.tags,
      recurring: false,
    }

    // Use addExpense directly to bypass plan-based limit check for installments
    // (they were already approved when the plan was created)
    const expenseStore = useExpenseStore.getState()
    const sanitized = {
      ...expense,
      id: `e-${crypto.randomUUID()}`,
      user_id: user.id,
      description: String(expense.description).slice(0, 200),
      category: String(expense.category).slice(0, 50),
      amount: Math.max(0, Number(expense.amount) || 0),
      tags: Array.isArray(expense.tags) ? expense.tags.map((t) => String(t).slice(0, 30)).slice(0, 10) : [],
      created_at: new Date().toISOString(),
    }
    useExpenseStore.setState((state) => ({ expenses: [...state.expenses, sanitized] }))

    // Update plan
    const nextMonth = addMonthsToYearMonth(plan.next_due_date, 1)
    const isCompleted = installmentNumber >= plan.total_installments

    get().updateInstallmentPlan(planId, {
      paid_installments: installmentNumber,
      next_due_date: nextMonth,
      status: isCompleted ? 'completed' : 'active',
    })
  },

  // ---- Auto-populate on app load ----

  checkAndPopulate: () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const currentMonth = getCurrentYearMonth()
    const activePlans = get().plans.filter(
      (p) => p.user_id === user.id && p.status === 'active'
    )

    for (const plan of activePlans) {
      // Register all due installments up to current month
      if (plan.next_due_date <= currentMonth) {
        get().registerNextInstallment(plan.id)
      }
    }
  },

  // ---- Selectors ----

  getPlansForUser: (userId) => {
    return get().plans.filter((p) => p.user_id === userId)
  },

  getActivePlans: (userId) => {
    return get().plans.filter((p) => p.user_id === userId && p.status === 'active')
  },

  getThisMonthTotal: (userId) => {
    const currentMonth = getCurrentYearMonth()
    const expenses = useExpenseStore.getState().expenses
    return expenses
      .filter((e) =>
        e.user_id === userId &&
        e.installment_id &&
        e.date?.startsWith(currentMonth)
      )
      .reduce((sum, e) => sum + e.amount, 0)
  },

  getTotalRemaining: (userId) => {
    const activePlans = get().getActivePlans(userId)
    return activePlans.reduce((sum, p) => {
      const remaining = (p.total_installments - p.paid_installments) * p.installment_amount
      return sum + remaining
    }, 0)
  },
}))

export default useInstallmentStore
export { getCurrentYearMonth, addMonthsToYearMonth, yearMonthToLabel, VALID_PAYMENT_METHODS }
