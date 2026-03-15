import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'
import TopBar from '../components/shared/TopBar'
import Dashboard from '../components/app/Dashboard'
import ExpenseTable from '../components/app/ExpenseTable'
import BudgetManager from '../components/app/BudgetManager'
import RecurringExpenses from '../components/app/RecurringExpenses'
import Achievements from '../components/app/Achievements'
import GroupSettings from '../components/app/GroupSettings'
import WhatsAppSettings from '../components/app/WhatsAppSettings'
import ProfilePage from './ProfilePage'
import CfoPage from '../components/app/CfoPage'
import AIChat from '../components/app/AIChat'
import { usePlan } from '../hooks/usePlan'
import TrialBanner from '../components/shared/TrialBanner'

export default function AppPage() {
  const { canUseBudgets, canUseRecurring, canUseAchievements, canUseGroups, canUseWhatsApp } = usePlan()

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar />
      <main className="flex-1 ml-[220px] p-6 max-w-[1200px]">
        <TrialBanner />
        <TopBar />
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
          <Route
            path="achievements"
            element={canUseAchievements ? <Achievements /> : <Navigate to="/pricing" replace />}
          />
          <Route
            path="group"
            element={canUseGroups ? <GroupSettings /> : <Navigate to="/pricing" replace />}
          />
          <Route
            path="whatsapp"
            element={canUseWhatsApp ? <WhatsAppSettings /> : <Navigate to="/pricing" replace />}
          />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="cfo" element={<CfoPage />} />
        </Routes>
      </main>
      <AIChat />
    </div>
  )
}
