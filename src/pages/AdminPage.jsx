import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Flag, CreditCard, ArrowLeft, MessageSquare } from 'lucide-react'
import AdminDashboard from '../components/admin/AdminDashboard'
import UsersTable from '../components/admin/UsersTable'
import FeatureFlags from '../components/admin/FeatureFlags'
import PaymentManagement from '../components/admin/PaymentManagement'
import AdminSupport from '../components/admin/AdminSupport'
import useSupportStore from '../store/supportStore'
import { useTranslation } from '../hooks/useTranslation'

const baseTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'flags', label: 'Feature Flags', icon: Flag },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'support', labelKey: 'support.admin.tab', icon: MessageSquare },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate()
  const { t } = useTranslation()
  const unreadAdmin = useSupportStore((s) => s.getUnreadCountForAdmin())

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface border-b border-dark-border px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="text-dark-muted hover:text-dark-text"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">
              mi Econom<span className="text-accent">IA</span>
              <span className="text-dark-muted font-normal ml-2 text-sm">Admin</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-surface border-b border-dark-border px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {baseTabs.map(({ id, label, labelKey, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-dark-muted hover:text-dark-text'
              }`}
            >
              <Icon size={16} />
              {labelKey ? t(labelKey) : label}
              {id === 'support' && unreadAdmin > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadAdmin > 9 ? '9+' : unreadAdmin}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'users' && <UsersTable />}
        {activeTab === 'flags' && <FeatureFlags />}
        {activeTab === 'payments' && <PaymentManagement />}
        {activeTab === 'support' && <AdminSupport />}
      </div>
    </div>
  )
}
