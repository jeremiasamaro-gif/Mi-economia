/**
 * Finance Service — Data abstraction layer for expenses
 *
 * PURPOSE: Decouples UI components from the data source.
 * Currently delegates to Zustand (in-memory mock data).
 * When Supabase is integrated, ONLY this file changes — no component edits needed.
 *
 * MIGRATION GUIDE:
 * 1. Replace each method body with supabase.from('expenses')... calls
 * 2. Remove the Zustand store import
 * 3. Add error handling with { data, error } pattern
 * 4. All queries are automatically scoped by RLS (user_id = auth.uid())
 */

import useExpenseStore from '../store/expenseStore'

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

/**
 * Get all expenses for the authenticated user.
 * @param {string} userId
 * @returns {Array} expenses
 */
export function getExpenses(userId) {
  // TODO SUPABASE:
  // const { data, error } = await supabase
  //   .from('expenses')
  //   .select('*')
  //   .order('date', { ascending: false })
  // RLS ensures only user's own data is returned
  return useExpenseStore.getState().getExpensesForUser(userId)
}

/**
 * Get current month expenses (type='expense') for a user.
 * @param {string} userId
 * @returns {Array}
 */
export function getCurrentMonthExpenses(userId) {
  // TODO SUPABASE:
  // const start = startOfMonth(new Date()).toISOString()
  // const { data } = await supabase
  //   .from('expenses')
  //   .select('*')
  //   .gte('date', start)
  //   .eq('type', 'expense')
  return useExpenseStore.getState().getCurrentMonthExpenses(userId)
}

/**
 * Get count of current month expenses for plan limit check.
 * @param {string} userId
 * @returns {number}
 */
export function getCurrentMonthCount(userId) {
  // TODO SUPABASE:
  // const { count } = await supabase
  //   .from('expenses')
  //   .select('*', { count: 'exact', head: true })
  //   .gte('date', startOfMonth)
  //   .eq('type', 'expense')
  return useExpenseStore.getState().getCurrentMonthCount(userId)
}

/**
 * Check if user can add a new expense (within plan limits).
 * SECURITY: This MUST also be validated server-side via RLS + DB trigger.
 * The frontend check is for UX only — never trust it for enforcement.
 * @param {string} userId
 * @param {string} plan - 'free' | 'pro'
 * @returns {boolean}
 */
export function canAddExpense(userId, plan) {
  // TODO SUPABASE: enforce via DB trigger or Edge Function
  // The DB trigger checks: SELECT count(*) FROM expenses
  //   WHERE user_id = auth.uid() AND date >= start_of_month
  //   AND type = 'expense'
  // If count >= plan_limit → raise exception
  return useExpenseStore.getState().canAddExpense(userId, plan)
}

/**
 * Get monthly income/expense totals for charts.
 * @param {string} userId
 * @param {number} months - number of months to look back
 * @returns {Array<{ month: string, income: number, expense: number, balance: number }>}
 */
export function getMonthlyTotals(userId, months = 6) {
  // TODO SUPABASE: use a DB function (rpc) for efficient aggregation
  // const { data } = await supabase.rpc('get_monthly_totals', { p_months: months })
  return useExpenseStore.getState().getMonthlyTotals(userId, months)
}

/**
 * Get category breakdown for current month.
 * @param {string} userId
 * @returns {Array<{ name: string, value: number }>}
 */
export function getCategoryTotals(userId) {
  // TODO SUPABASE: use a DB function for efficient grouping
  // const { data } = await supabase.rpc('get_category_totals')
  return useExpenseStore.getState().getCategoryTotals(userId)
}

// ---------------------------------------------------------------------------
// WRITE
// ---------------------------------------------------------------------------

/**
 * Create a new expense.
 * @param {object} expense - { date, category, description, amount, type, tags, recurring, ... }
 * @returns {object} created expense with generated id
 */
export function createExpense(expense) {
  // TODO SUPABASE:
  // const { data, error } = await supabase
  //   .from('expenses')
  //   .insert({
  //     date: expense.date,
  //     category: expense.category,
  //     description: expense.description?.slice(0, 200),
  //     amount: Math.max(0, expense.amount),
  //     type: expense.type,
  //     tags: expense.tags?.slice(0, 10),
  //   })
  //   .select()
  //   .single()
  // user_id is set automatically by RLS default (auth.uid())
  return useExpenseStore.getState().addExpense(expense)
}

/**
 * Update an existing expense.
 * @param {string} id - expense ID
 * @param {object} updates - partial expense fields
 */
export function updateExpense(id, updates) {
  // TODO SUPABASE:
  // const { error } = await supabase
  //   .from('expenses')
  //   .update(updates)
  //   .eq('id', id)
  // RLS ensures user can only update own expenses
  return useExpenseStore.getState().updateExpense(id, updates)
}

/**
 * Delete an expense.
 * @param {string} id - expense ID
 */
export function deleteExpense(id) {
  // TODO SUPABASE:
  // const { error } = await supabase
  //   .from('expenses')
  //   .delete()
  //   .eq('id', id)
  // RLS ensures user can only delete own expenses
  return useExpenseStore.getState().deleteExpense(id)
}
