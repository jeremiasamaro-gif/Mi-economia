import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'
import Dashboard from '../components/app/Dashboard'
import ExpenseTable from '../components/app/ExpenseTable'
import BudgetManager from '../components/app/BudgetManager'
import RecurringExpenses from '../components/app/RecurringExpenses'
import AIChat from '../components/app/AIChat'
import { usePlan } from '../hooks/usePlan'

export default function AppPage() {
  const { canUseBudgets, canUseRecurring } = usePlan()

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar />
      <main className="flex-1 ml-[220px] p-6 max-w-[1200px]">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="expenses" element={<ExpenseTable />} />
          <Route
            path="budgets"
            element={canUseBudgets ? <BudgetManager /> : <Navigate to="/pricing" replace />}
          />
          <Route
            path="recurring"
            element={canUseRecurring ? <RecurringExpenses /> : <Navigate to="/pricing" replace />}
          />
        </Routes>
      </main>
      <AIChat />
    </div>
  )
}
