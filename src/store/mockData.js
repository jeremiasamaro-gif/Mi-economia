// Mock data for development — all amounts in ARS
// TODO SUPABASE: replace all mock data with Supabase queries

const today = new Date()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()

function d(year, month, day) {
  return new Date(year, month, day).toISOString().split('T')[0]
}

export const mockUsers = [
  // Admin — credentials NOT shown on login screen
  {
    id: 'user-admin',
    email: 'jeremias@mieconomia.com',
    full_name: 'Jeremías',
    plan: 'pro',
    role: 'admin',
    mp_payment_id: null,
    subscription_status: 'active',
    created_at: '2025-11-15T10:00:00Z',
    password: 'Jere12345',
  },
  // Demo users — shown on login screen for testing
  {
    id: 'user-demo-pro',
    email: 'demo-pro@mieconomia.com',
    full_name: 'Usuario Demo Pro',
    plan: 'pro',
    role: 'user',
    mp_payment_id: 'MP-DEMO',
    subscription_status: 'active',
    created_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'user-demo-free',
    email: 'demo-free@mieconomia.com',
    full_name: 'Usuario Demo Free',
    plan: 'free',
    role: 'user',
    mp_payment_id: null,
    subscription_status: 'inactive',
    created_at: '2026-01-01T10:00:00Z',
  },
]

export const mockExpenses = [
  // Current month
  { id: 'e1', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 1), category: 'Vivienda', description: 'Alquiler departamento', amount: 150000, type: 'expense', tags: ['fijo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e2', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 1), category: 'Servicios', description: 'Luz (Edenor)', amount: 18500, type: 'expense', tags: ['fijo', 'servicios'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e3', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 2), category: 'Servicios', description: 'Gas (Metrogas)', amount: 12000, type: 'expense', tags: ['fijo', 'servicios'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e4', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 2), category: 'Servicios', description: 'Internet Fibertel', amount: 15000, type: 'expense', tags: ['fijo', 'servicios'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e5', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 3), category: 'Transporte', description: 'Carga SUBE', amount: 5000, type: 'expense', tags: ['transporte'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e6', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 4), category: 'Alimentación', description: 'Supermercado Coto', amount: 28500, type: 'expense', tags: ['super'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e7', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 5), category: 'Entretenimiento', description: 'Netflix', amount: 4500, type: 'expense', tags: ['streaming', 'fijo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e8', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 5), category: 'Entretenimiento', description: 'Spotify', amount: 2500, type: 'expense', tags: ['streaming', 'fijo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e9', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 6), category: 'Salud', description: 'Farmacia', amount: 8200, type: 'expense', tags: ['salud'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e10', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 7), category: 'Alimentación', description: 'Verdulería', amount: 6500, type: 'expense', tags: ['comida'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e11', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 7), category: 'Alimentación', description: 'Carnicería Don Pedro', amount: 15000, type: 'expense', tags: ['comida'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e12', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 8), category: 'Transporte', description: 'Uber al trabajo', amount: 3200, type: 'expense', tags: ['transporte'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e13', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 9), category: 'Entretenimiento', description: 'Cena con amigos', amount: 12000, type: 'expense', tags: ['social'], recurring: false, recurring_frequency: null, split_with: 4 },
  { id: 'e14', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 10), category: 'Educación', description: 'Curso Udemy', amount: 9500, type: 'expense', tags: ['estudio'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e15', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 1), category: 'Ingresos', description: 'Sueldo', amount: 450000, type: 'income', tags: ['sueldo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e16', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 10), category: 'Ingresos', description: 'Freelance diseño web', amount: 85000, type: 'income', tags: ['freelance'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e17', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 5), category: 'Ropa', description: 'Zapatillas Nike', amount: 45000, type: 'expense', tags: ['ropa'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e18', user_id: 'user-demo-pro', date: d(currentYear, currentMonth, 6), category: 'Alimentación', description: 'Café Martinez', amount: 3500, type: 'expense', tags: ['café'], recurring: false, recurring_frequency: null, split_with: null },

  // Last month
  { id: 'e19', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 1), category: 'Vivienda', description: 'Alquiler departamento', amount: 150000, type: 'expense', tags: ['fijo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e20', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 1), category: 'Ingresos', description: 'Sueldo', amount: 450000, type: 'income', tags: ['sueldo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e21', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 3), category: 'Alimentación', description: 'Supermercado Día', amount: 22000, type: 'expense', tags: ['super'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e22', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 5), category: 'Servicios', description: 'Luz (Edenor)', amount: 17800, type: 'expense', tags: ['fijo', 'servicios'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e23', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 7), category: 'Transporte', description: 'Carga SUBE', amount: 5000, type: 'expense', tags: ['transporte'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e24', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 10), category: 'Entretenimiento', description: 'Netflix', amount: 4500, type: 'expense', tags: ['streaming', 'fijo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e25', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 12), category: 'Alimentación', description: 'Carnicería', amount: 14000, type: 'expense', tags: ['comida'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e26', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 15), category: 'Ingresos', description: 'Freelance app móvil', amount: 120000, type: 'income', tags: ['freelance'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e27', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 1, 18), category: 'Salud', description: 'Consulta médica', amount: 15000, type: 'expense', tags: ['salud'], recurring: false, recurring_frequency: null, split_with: null },

  // Two months ago
  { id: 'e28', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 2, 1), category: 'Vivienda', description: 'Alquiler departamento', amount: 140000, type: 'expense', tags: ['fijo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e29', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 2, 1), category: 'Ingresos', description: 'Sueldo', amount: 430000, type: 'income', tags: ['sueldo'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e30', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 2, 4), category: 'Alimentación', description: 'Supermercado Jumbo', amount: 32000, type: 'expense', tags: ['super'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e31', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 2, 8), category: 'Servicios', description: 'Luz + Gas', amount: 28000, type: 'expense', tags: ['fijo', 'servicios'], recurring: true, recurring_frequency: 'monthly', split_with: null },
  { id: 'e32', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 2, 10), category: 'Entretenimiento', description: 'Cine con amigos', amount: 8000, type: 'expense', tags: ['social'], recurring: false, recurring_frequency: null, split_with: 3 },
  { id: 'e33', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 2, 15), category: 'Ropa', description: 'Campera de invierno', amount: 55000, type: 'expense', tags: ['ropa'], recurring: false, recurring_frequency: null, split_with: null },
  { id: 'e34', user_id: 'user-demo-pro', date: d(currentYear, currentMonth - 2, 20), category: 'Ingresos', description: 'Venta MercadoLibre', amount: 35000, type: 'income', tags: ['venta'], recurring: false, recurring_frequency: null, split_with: null },
]

export const mockBudgets = [
  { id: 'b1', user_id: 'user-demo-pro', category: 'Alimentación', limit_amount: 60000, month: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}` },
  { id: 'b2', user_id: 'user-demo-pro', category: 'Transporte', limit_amount: 15000, month: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}` },
  { id: 'b3', user_id: 'user-demo-pro', category: 'Entretenimiento', limit_amount: 25000, month: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}` },
  { id: 'b4', user_id: 'user-demo-pro', category: 'Servicios', limit_amount: 50000, month: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}` },
  { id: 'b5', user_id: 'user-demo-pro', category: 'Salud', limit_amount: 20000, month: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}` },
  { id: 'b6', user_id: 'user-demo-pro', category: 'Ropa', limit_amount: 30000, month: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}` },
]

export const mockRecurringExpenses = [
  { id: 'r1', user_id: 'user-demo-pro', description: 'Alquiler departamento', category: 'Vivienda', amount: 150000, type: 'expense', frequency: 'monthly', next_date: d(currentYear, currentMonth + 1, 1), active: true },
  { id: 'r2', user_id: 'user-demo-pro', description: 'Luz (Edenor)', category: 'Servicios', amount: 18500, type: 'expense', frequency: 'monthly', next_date: d(currentYear, currentMonth + 1, 1), active: true },
  { id: 'r3', user_id: 'user-demo-pro', description: 'Gas (Metrogas)', category: 'Servicios', amount: 12000, type: 'expense', frequency: 'monthly', next_date: d(currentYear, currentMonth + 1, 2), active: true },
  { id: 'r4', user_id: 'user-demo-pro', description: 'Internet Fibertel', category: 'Servicios', amount: 15000, type: 'expense', frequency: 'monthly', next_date: d(currentYear, currentMonth + 1, 2), active: true },
  { id: 'r5', user_id: 'user-demo-pro', description: 'Netflix', category: 'Entretenimiento', amount: 4500, type: 'expense', frequency: 'monthly', next_date: d(currentYear, currentMonth + 1, 5), active: true },
  { id: 'r6', user_id: 'user-demo-pro', description: 'Spotify', category: 'Entretenimiento', amount: 2500, type: 'expense', frequency: 'monthly', next_date: d(currentYear, currentMonth + 1, 5), active: true },
  { id: 'r7', user_id: 'user-demo-pro', description: 'Sueldo', category: 'Ingresos', amount: 450000, type: 'income', frequency: 'monthly', next_date: d(currentYear, currentMonth + 1, 1), active: true },
  { id: 'r8', user_id: 'user-demo-pro', description: 'Gimnasio', category: 'Salud', amount: 12000, type: 'expense', frequency: 'monthly', next_date: d(currentYear, currentMonth + 1, 1), active: false },
]

export const mockFeatureFlags = [
  { key: 'ai_assistant', enabled: true, description: 'Asistente IA EconomIA' },
  { key: 'csv_export', enabled: true, description: 'Exportar/importar CSV' },
  { key: 'recurring_expenses', enabled: true, description: 'Gastos recurrentes' },
  { key: 'budget_manager', enabled: true, description: 'Gestor de presupuestos' },
  { key: 'expense_splitting', enabled: true, description: 'División de gastos' },
  { key: 'proactive_alerts', enabled: true, description: 'Alertas proactivas de IA' },
]

export const mockPayments = [
  { id: 'pay-1', user_id: 'user-demo-pro', user_email: 'maria@ejemplo.com', amount: 2999, status: 'approved', date: '2026-02-15T10:00:00Z', mp_payment_id: 'MP-12345' },
  { id: 'pay-2', user_id: 'user-2', user_email: 'juan@ejemplo.com', amount: 2999, status: 'approved', date: '2026-02-20T14:30:00Z', mp_payment_id: 'MP-12346' },
  { id: 'pay-3', user_id: 'user-3', user_email: 'ana@ejemplo.com', amount: 2999, status: 'pending', date: '2026-03-10T09:00:00Z', mp_payment_id: 'MP-12347' },
]

export const CATEGORIES = [
  'Alimentación',
  'Vivienda',
  'Transporte',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Ropa',
  'Ingresos',
  'Otros',
]

export const PLAN_LIMITS = {
  free: { maxExpensesPerMonth: 20, hasAI: false, hasRecurring: false, hasCharts: false, hasBudgets: false, hasTags: false, hasSplitting: false, hasCsvExport: false, hasAchievements: false, hasGroups: false, hasScanner: false, hasWhatsApp: false },
  pro: { maxExpensesPerMonth: Infinity, hasAI: true, hasRecurring: true, hasCharts: true, hasBudgets: true, hasTags: true, hasSplitting: true, hasCsvExport: true, hasAchievements: true, hasGroups: true, hasScanner: true, hasWhatsApp: true },
}

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = [
  // Streaks
  { id: 'streak-no-delivery-7', type: 'streak', title: 'Semana sin delivery', description: '7 días sin pedir delivery', icon: '🍳', threshold: 7 },
  { id: 'streak-under-budget', type: 'streak', title: 'Mes bajo presupuesto', description: 'Un mes completo sin pasarte del presupuesto', icon: '🎯', threshold: 1 },
  { id: 'streak-savings-3m', type: 'streak', title: '3 meses ahorrando', description: '3 meses consecutivos con balance positivo', icon: '🔥', threshold: 3 },
  { id: 'streak-logging-7', type: 'streak', title: 'Racha de registro', description: '7 días seguidos registrando al menos un gasto', icon: '📝', threshold: 7 },
  // Savings milestones
  { id: 'milestone-first', type: 'milestone', title: 'Primer ahorro', description: 'Tu primer mes con balance positivo', icon: '🌱', threshold: 1 },
  { id: 'milestone-10k', type: 'milestone', title: 'Primer escalón', description: 'Ahorraste $10.000 acumulados', icon: '💰', threshold: 10000 },
  { id: 'milestone-50k', type: 'milestone', title: 'Ahorrador serio', description: 'Ahorraste $50.000 acumulados', icon: '🏅', threshold: 50000 },
  { id: 'milestone-100k', type: 'milestone', title: 'Club de los 100k', description: 'Ahorraste $100.000 acumulados', icon: '🏆', threshold: 100000 },
  { id: 'milestone-500k', type: 'milestone', title: 'Medio palo', description: 'Ahorraste $500.000 acumulados', icon: '💎', threshold: 500000 },
  { id: 'milestone-1m', type: 'milestone', title: 'Millonario', description: 'Ahorraste $1.000.000 acumulados', icon: '👑', threshold: 1000000 },
]

// TODO SUPABASE: replace with query to achievements table
export const mockAchievements = [
  { id: 'ua1', user_id: 'user-demo-pro', achievement_id: 'milestone-first', unlocked_at: '2026-01-31T20:00:00Z', progress: 100 },
  { id: 'ua2', user_id: 'user-demo-pro', achievement_id: 'milestone-10k', unlocked_at: '2026-02-15T14:00:00Z', progress: 100 },
  { id: 'ua3', user_id: 'user-demo-pro', achievement_id: 'streak-logging-7', unlocked_at: '2026-02-10T18:00:00Z', progress: 100 },
]

// TODO SUPABASE: replace with query to groups/group_members tables
export const mockGroups = [
  {
    id: 'grp-1',
    name: 'Casa con Sofi',
    owner_id: 'user-demo-pro',
    members: [
      { user_id: 'user-demo-pro', name: 'Usuario Demo Pro', email: 'demo-pro@mieconomia.com', role: 'owner', joined_at: '2026-01-15T10:00:00Z' },
      { user_id: 'user-member-1', name: 'Sofía', email: 'sofia@ejemplo.com', role: 'member', joined_at: '2026-01-16T10:00:00Z' },
    ],
    created_at: '2026-01-15T10:00:00Z',
  },
]

export const mockGroupInvites = [
  { id: 'inv-1', group_id: 'grp-1', email: 'carlos@ejemplo.com', token: 'mock-token-abc123', expires_at: '2026-04-01T10:00:00Z', used: false, created_at: '2026-03-12T10:00:00Z' },
]
