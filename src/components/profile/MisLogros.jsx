import { useState, useEffect } from 'react'
import { Trophy, Plus, Pencil, Trash2, Check, Share2, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { useAchievements } from '../../hooks/useAchievements'
import useProfileStore from '../../store/profileStore'
import { CATEGORIES } from '../../store/mockData'
import AchievementShareCanvas from '../app/AchievementShareCanvas'

const ACHIEVEMENT_TYPES = [
  { value: 'savings_target', label: 'Ahorro acumulado' },
  { value: 'no_spend', label: 'Sin gastar en categoría' },
  { value: 'monthly_limit', label: 'Gasto mensual bajo X' },
  { value: 'manual', label: 'Logro libre' },
]

export default function MisLogros() {
  const { user } = useAuth()
  const { isPro } = usePlan()
  const { achievements, definitions, isUnlocked } = useAchievements()
  const {
    getCustomAchievements,
    addCustomAchievement,
    updateCustomAchievement,
    toggleCustomAchievement,
    deleteCustomAchievement,
    getAllowedEmojis,
  } = useProfileStore()

  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [shareAchievement, setShareAchievement] = useState(null)
  const [showConfetti, setShowConfetti] = useState(null)

  const customAchievements = user ? getCustomAchievements(user.id) : []
  const allowedEmojis = getAllowedEmojis()

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'savings_target',
    target_amount: '',
    target_category: '',
    target_days: '',
    emoji: '🎯',
    deadline: '',
  })

  const resetForm = () => {
    setForm({ name: '', description: '', type: 'savings_target', target_amount: '', target_category: '', target_days: '', emoji: '🎯', deadline: '' })
    setEditingId(null)
  }

  const handleCreate = () => {
    if (!form.name.trim()) return
    const result = addCustomAchievement(user.id, {
      ...form,
      target_amount: form.target_amount ? Number(form.target_amount) : null,
      target_days: form.target_days ? Number(form.target_days) : null,
    })
    if (!result.error) {
      resetForm()
      setShowCreate(false)
    }
  }

  const handleEdit = (achievement) => {
    setForm({
      name: achievement.name,
      description: achievement.description || '',
      type: achievement.type,
      target_amount: achievement.target_amount || '',
      target_category: achievement.target_category || '',
      target_days: achievement.target_days || '',
      emoji: achievement.emoji || '🎯',
      deadline: achievement.deadline || '',
    })
    setEditingId(achievement.id)
    setShowCreate(true)
  }

  const handleUpdate = () => {
    if (!form.name.trim()) return
    updateCustomAchievement(editingId, user.id, {
      name: form.name.slice(0, 50),
      description: form.description.slice(0, 120),
      type: form.type,
      target_amount: form.target_amount ? Number(form.target_amount) : null,
      target_category: form.target_category || null,
      target_days: form.target_days ? Number(form.target_days) : null,
      emoji: form.emoji,
      deadline: form.deadline || null,
    })
    resetForm()
    setShowCreate(false)
  }

  const handleToggle = (id) => {
    const result = toggleCustomAchievement(id, user.id)
    if (!result.error) {
      const a = customAchievements.find((x) => x.id === id)
      if (a && !a.completed) {
        setShowConfetti(id)
        setTimeout(() => setShowConfetti(null), 2000)
      }
    }
  }

  const handleDelete = (id) => {
    deleteCustomAchievement(id, user.id)
    setDeleteConfirm(null)
  }

  // Calculate progress for custom achievements
  const getProgress = (a) => {
    if (a.completed) return 100
    if (a.type === 'manual') return a.completed ? 100 : 0
    if (a.type === 'savings_target' && a.target_amount) return Math.min(100, Math.round((65000 / a.target_amount) * 100)) // Mock: 65k saved
    if (a.type === 'no_spend' && a.target_days) return Math.min(100, Math.round((18 / a.target_days) * 100)) // Mock: 18 days
    if (a.type === 'monthly_limit' && a.target_amount) return Math.min(100, Math.round((8500 / a.target_amount) * 100)) // Mock: 8.5k spent
    return 0
  }

  // System achievements split
  const streaks = definitions.filter((d) => d.type === 'streak')
  const milestones = definitions.filter((d) => d.type === 'milestone')

  const getUnlockedData = (defId) => achievements.find((a) => a.achievement_id === defId)

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-dark-text">Mis Logros</h2>

      {/* Section A: System achievements */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wider">Rachas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {streaks.map((def) => {
            const unlocked = isUnlocked(def.id)
            const data = getUnlockedData(def.id)
            return (
              <div
                key={def.id}
                className={`bg-dark-surface border rounded-xl p-4 transition-all ${
                  unlocked ? 'border-accent/40' : 'border-dark-border opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{def.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark-text">{def.title}</p>
                    <p className="text-xs text-dark-muted">{def.description}</p>
                  </div>
                  {unlocked && (
                    <button
                      onClick={() => setShareAchievement(def)}
                      className="text-dark-muted hover:text-accent transition-colors"
                    >
                      <Share2 size={14} />
                    </button>
                  )}
                </div>
                {!unlocked && (
                  <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
                    <div className="h-full bg-dark-muted/30 rounded-full" style={{ width: `${data?.progress || 20}%` }} />
                  </div>
                )}
                {unlocked && data && (
                  <p className="text-xs text-accent mt-1">
                    Desbloqueado {new Date(data.unlocked_at).toLocaleDateString('es-AR')}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mt-6">Hitos de ahorro</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((def) => {
            const unlocked = isUnlocked(def.id)
            const data = getUnlockedData(def.id)
            return (
              <div
                key={def.id}
                className={`bg-dark-surface border rounded-xl p-4 transition-all ${
                  unlocked ? 'border-accent/40' : 'border-dark-border opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{def.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark-text">{def.title}</p>
                    <p className="text-xs text-dark-muted">{def.description}</p>
                  </div>
                  {unlocked && (
                    <button
                      onClick={() => setShareAchievement(def)}
                      className="text-dark-muted hover:text-accent transition-colors"
                    >
                      <Share2 size={14} />
                    </button>
                  )}
                </div>
                {unlocked && data && (
                  <p className="text-xs text-accent mt-2">
                    Desbloqueado {new Date(data.unlocked_at).toLocaleDateString('es-AR')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Section B: Custom achievements (Pro only) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wider">Mis logros personales</h3>
          {isPro && (
            <button
              onClick={() => { resetForm(); setShowCreate(true) }}
              className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <Plus size={16} />
              Crear logro personal
            </button>
          )}
        </div>

        {!isPro && (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 text-center">
            <Trophy size={32} className="text-dark-muted mx-auto mb-3" />
            <p className="text-dark-muted text-sm mb-3">Los logros personalizados son una función Pro</p>
            <a href="/pricing" className="text-accent text-sm hover:underline">Mejorar a Pro</a>
          </div>
        )}

        {isPro && customAchievements.length === 0 && !showCreate && (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 text-center">
            <p className="text-dark-muted text-sm mb-3">No tenés logros personales todavía</p>
            <button
              onClick={() => { resetForm(); setShowCreate(true) }}
              className="text-accent text-sm hover:underline"
            >
              Crear tu primer logro
            </button>
          </div>
        )}

        {isPro && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customAchievements.map((a) => {
              const progress = getProgress(a)
              return (
                <div
                  key={a.id}
                  className={`bg-dark-surface border rounded-xl p-4 relative transition-all ${
                    a.completed ? 'border-accent/40' : 'border-dark-border'
                  } ${showConfetti === a.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-dark-bg' : ''}`}
                >
                  {a.completed && (
                    <span className="absolute top-2 right-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                      Completado
                    </span>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-text truncate">{a.name}</p>
                      <p className="text-xs text-dark-muted truncate">{a.description}</p>
                      {a.deadline && (
                        <p className="text-xs text-dark-muted mt-1">
                          Fecha límite: {new Date(a.deadline).toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {a.type !== 'manual' && (
                    <div className="mb-3">
                      <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${a.completed ? 'bg-accent' : 'bg-accent/60'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-dark-muted mt-1">{progress}%</p>
                    </div>
                  )}

                  {/* Manual toggle */}
                  {a.type === 'manual' && (
                    <button
                      onClick={() => handleToggle(a.id)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg mb-3 transition-colors ${
                        a.completed
                          ? 'bg-accent/20 text-accent'
                          : 'bg-dark-hover text-dark-muted hover:text-dark-text'
                      }`}
                    >
                      <Check size={14} />
                      {a.completed ? 'Completado' : 'Marcar como completado'}
                    </button>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-dark-border/50">
                    {a.completed && (
                      <button
                        onClick={() => setShareAchievement({ ...a, title: a.name, icon: a.emoji })}
                        className="text-xs text-dark-muted hover:text-accent transition-colors flex items-center gap-1"
                      >
                        <Share2 size={12} /> Compartir
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-xs text-dark-muted hover:text-dark-text transition-colors flex items-center gap-1 ml-auto"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(a.id)}
                      className="text-xs text-dark-muted hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setShowCreate(false); resetForm() }}>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-text">
                {editingId ? 'Editar logro' : 'Crear logro personal'}
              </h3>
              <button onClick={() => { setShowCreate(false); resetForm() }} className="text-dark-muted hover:text-dark-text">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Emoji selector */}
              <div>
                <label className="block text-sm text-dark-muted mb-1.5">Ícono</label>
                <div className="flex flex-wrap gap-2">
                  {allowedEmojis.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        form.emoji === e ? 'bg-accent/20 ring-2 ring-accent' : 'bg-dark-bg hover:bg-dark-hover'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-dark-muted mb-1.5">Nombre del logro</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value.slice(0, 50) }))}
                  placeholder="Ej: Vacaciones en Brasil"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                />
                <p className="text-xs text-dark-muted mt-1 text-right">{form.name.length}/50</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-dark-muted mb-1.5">Descripción</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value.slice(0, 120) }))}
                  placeholder="Ej: Ahorrar $200.000 para julio"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                />
                <p className="text-xs text-dark-muted mt-1 text-right">{form.description.length}/120</p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm text-dark-muted mb-1.5">Tipo de logro</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                >
                  {ACHIEVEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Conditional fields */}
              {form.type === 'savings_target' && (
                <div>
                  <label className="block text-sm text-dark-muted mb-1.5">Monto objetivo</label>
                  <input
                    type="number"
                    value={form.target_amount}
                    onChange={(e) => setForm((p) => ({ ...p, target_amount: e.target.value }))}
                    placeholder="200000"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              )}

              {form.type === 'no_spend' && (
                <>
                  <div>
                    <label className="block text-sm text-dark-muted mb-1.5">Categoría</label>
                    <select
                      value={form.target_category}
                      onChange={(e) => setForm((p) => ({ ...p, target_category: e.target.value }))}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                    >
                      <option value="">Seleccionar categoría</option>
                      {CATEGORIES.filter((c) => c !== 'Ingresos').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-dark-muted mb-1.5">Cantidad de días</label>
                    <input
                      type="number"
                      value={form.target_days}
                      onChange={(e) => setForm((p) => ({ ...p, target_days: e.target.value }))}
                      placeholder="30"
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                </>
              )}

              {form.type === 'monthly_limit' && (
                <>
                  <div>
                    <label className="block text-sm text-dark-muted mb-1.5">Categoría</label>
                    <select
                      value={form.target_category}
                      onChange={(e) => setForm((p) => ({ ...p, target_category: e.target.value }))}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                    >
                      <option value="">Seleccionar categoría</option>
                      {CATEGORIES.filter((c) => c !== 'Ingresos').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-dark-muted mb-1.5">Monto máximo mensual</label>
                    <input
                      type="number"
                      value={form.target_amount}
                      onChange={(e) => setForm((p) => ({ ...p, target_amount: e.target.value }))}
                      placeholder="15000"
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Deadline */}
              <div>
                <label className="block text-sm text-dark-muted mb-1.5">Fecha límite (opcional)</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              {/* Preview */}
              <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                <p className="text-xs text-dark-muted mb-2 uppercase tracking-wider">Vista previa</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{form.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-dark-text">{form.name || 'Nombre del logro'}</p>
                    <p className="text-xs text-dark-muted">{form.description || 'Descripción del logro'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreate(false); resetForm() }}
                className="flex-1 px-4 py-2.5 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={!form.name.trim()}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  form.name.trim()
                    ? 'bg-accent text-dark-bg hover:bg-accent/90 cursor-pointer'
                    : 'bg-dark-hover text-dark-muted cursor-not-allowed'
                }`}
              >
                {editingId ? 'Guardar cambios' : 'Crear logro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-text mb-2">Eliminar logro</h3>
            <p className="text-sm text-dark-muted mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      <AchievementShareCanvas
        achievement={shareAchievement}
        userName={user?.full_name || 'Usuario'}
        isOpen={!!shareAchievement}
        onClose={() => setShareAchievement(null)}
      />
    </div>
  )
}
