import { useState } from 'react'
import { UsersRound, Plus, Link2, Copy, Check, LogOut, Trash2, Crown, UserMinus, ArrowRightLeft, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useGroupStore from '../../store/groupStore'

export default function MiGrupo() {
  const { user } = useAuth()
  const {
    getGroupForUser,
    isOwner,
    createGroup,
    inviteMember,
    removeMember,
    transferOwnership,
    dissolveGroup,
    getPendingInvites,
  } = useGroupStore()

  const group = user ? getGroupForUser(user.id) : null
  const ownerStatus = group ? isOwner(group.id, user.id) : false
  const pendingInvites = group ? getPendingInvites(group.id) : []

  // State
  const [groupName, setGroupName] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // { type, data }
  const [dissolveText, setDissolveText] = useState('')
  const [error, setError] = useState('')

  const handleCreateGroup = () => {
    if (!groupName.trim()) return
    const result = createGroup(groupName.trim(), user)
    if (result.error) setError(result.error)
    else setGroupName('')
  }

  const handleJoinGroup = () => {
    // TODO: implement token-based joining
    setError('Funcionalidad próximamente disponible.')
  }

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    const result = inviteMember(group.id, inviteEmail.trim())
    if (result.error) {
      setError(result.error)
    } else {
      setInviteResult(result.invite)
      setInviteEmail('')
    }
  }

  const handleCopyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRemoveMember = (memberId) => {
    const result = removeMember(group.id, memberId, user.id)
    if (result.error) setError(result.error)
    setConfirmAction(null)
  }

  const handleTransfer = (memberId) => {
    const result = transferOwnership(group.id, memberId, user.id)
    if (result.error) setError(result.error)
    setConfirmAction(null)
  }

  const handleLeave = () => {
    const result = removeMember(group.id, user.id, user.id)
    if (result.error) setError(result.error)
    setConfirmAction(null)
  }

  const handleDissolve = () => {
    if (dissolveText !== group.name) return
    const result = dissolveGroup(group.id, user.id)
    if (result.error) setError(result.error)
    setConfirmAction(null)
    setDissolveText('')
  }

  const getTimeRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date()
    const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
    return `${hours}hs`
  }

  const getMemberColor = (name) => {
    const colors = ['bg-accent/20 text-accent', 'bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400', 'bg-orange-500/20 text-orange-400', 'bg-pink-500/20 text-pink-400']
    const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
    return colors[idx]
  }

  // No group - empty state
  if (!group) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-dark-text">Mi Grupo</h2>

        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center">
          <UsersRound size={48} className="text-dark-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-text mb-2">Todavía no pertenecés a ningún grupo</h3>
          <p className="text-sm text-dark-muted mb-6">Creá un grupo o unite a uno existente con un código de invitación.</p>

          <div className="max-w-sm mx-auto space-y-4">
            {/* Create group */}
            <div>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value.slice(0, 60))}
                placeholder="Nombre del grupo"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none mb-2"
              />
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  groupName.trim()
                    ? 'bg-accent text-dark-bg hover:bg-accent/90'
                    : 'bg-dark-hover text-dark-muted cursor-not-allowed'
                }`}
              >
                <Plus size={16} />
                Crear un grupo
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-dark-border" />
              <span className="text-xs text-dark-muted">o</span>
              <div className="flex-1 h-px bg-dark-border" />
            </div>

            {/* Join group */}
            <div>
              <input
                type="text"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="Código de invitación"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none mb-2"
              />
              <button
                onClick={handleJoinGroup}
                disabled={!inviteToken.trim()}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  inviteToken.trim()
                    ? 'bg-dark-hover text-dark-text hover:bg-dark-border'
                    : 'bg-dark-hover text-dark-muted cursor-not-allowed'
                }`}
              >
                <Link2 size={16} />
                Unirme con código
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    )
  }

  // Has group
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-dark-text">Mi Grupo</h2>

      {/* Group header */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <UsersRound size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark-text">{group.name}</h3>
              <span className="text-xs bg-dark-hover text-dark-muted px-2 py-0.5 rounded-full">
                {group.members.length} miembro{group.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {ownerStatus && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <Plus size={16} />
              Invitar miembro
            </button>
          )}
        </div>

        {/* Members */}
        <div className="space-y-2">
          {group.members.map((m) => (
            <div key={m.user_id} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${getMemberColor(m.name)}`}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-dark-text truncate">{m.name}</p>
                  {m.role === 'owner' && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                      <Crown size={10} /> Dueño
                    </span>
                  )}
                  {m.user_id === user.id && (
                    <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">Vos</span>
                  )}
                </div>
                <p className="text-xs text-dark-muted truncate">{m.email}</p>
              </div>
              <p className="text-xs text-dark-muted">
                {new Date(m.joined_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
              </p>

              {/* Owner actions on other members */}
              {ownerStatus && m.user_id !== user.id && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setConfirmAction({ type: 'transfer', data: m })}
                    title="Transferir dueño"
                    className="p-1.5 text-dark-muted hover:text-yellow-400 transition-colors"
                  >
                    <ArrowRightLeft size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmAction({ type: 'remove', data: m })}
                    title="Eliminar del grupo"
                    className="p-1.5 text-dark-muted hover:text-red-400 transition-colors"
                  >
                    <UserMinus size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pending invites */}
        {ownerStatus && pendingInvites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-border">
            <h4 className="text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Invitaciones pendientes</h4>
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-dark-text">{inv.email}</p>
                  <p className="text-xs text-dark-muted">Expira en {getTimeRemaining(inv.expires_at)}</p>
                </div>
                <button
                  onClick={() => handleCopyLink(inv.token)}
                  className="text-xs text-dark-muted hover:text-accent transition-colors flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  Copiar link
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      </div>

      {/* Leave / Dissolve */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        {!ownerStatus ? (
          <button
            onClick={() => setConfirmAction({ type: 'leave' })}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={16} />
            Salir del grupo
          </button>
        ) : (
          <button
            onClick={() => setConfirmAction({ type: 'dissolve' })}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={16} />
            Disolver grupo
          </button>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setShowInvite(false); setInviteResult(null) }}>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-text">Invitar miembro</h3>
              <button onClick={() => { setShowInvite(false); setInviteResult(null) }} className="text-dark-muted hover:text-dark-text">
                <X size={20} />
              </button>
            </div>

            {!inviteResult ? (
              <>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none mb-3"
                />
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inviteEmail.trim()
                      ? 'bg-accent text-dark-bg hover:bg-accent/90'
                      : 'bg-dark-hover text-dark-muted cursor-not-allowed'
                  }`}
                >
                  Enviar invitación
                </button>
              </>
            ) : (
              <div className="text-center">
                <Check size={32} className="text-accent mx-auto mb-3" />
                <p className="text-sm text-dark-text mb-3">Invitación creada</p>
                <button
                  onClick={() => handleCopyLink(inviteResult.token)}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  Copiar link de invitación
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation modals */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setConfirmAction(null); setDissolveText('') }}>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-dark-text">
                {confirmAction.type === 'leave' && 'Salir del grupo'}
                {confirmAction.type === 'remove' && 'Eliminar miembro'}
                {confirmAction.type === 'transfer' && 'Transferir propiedad'}
                {confirmAction.type === 'dissolve' && 'Disolver grupo'}
              </h3>
            </div>

            <p className="text-sm text-dark-muted mb-4">
              {confirmAction.type === 'leave' && 'Dejás de ver los gastos compartidos del grupo. Esta acción no se puede deshacer.'}
              {confirmAction.type === 'remove' && `¿Eliminar a ${confirmAction.data.name} del grupo?`}
              {confirmAction.type === 'transfer' && `¿Transferir la propiedad del grupo a ${confirmAction.data.name}? Vas a pasar a ser miembro.`}
              {confirmAction.type === 'dissolve' && 'Se eliminará el grupo y todas las invitaciones pendientes. Los gastos de cada miembro se mantienen.'}
            </p>

            {confirmAction.type === 'dissolve' && (
              <div className="mb-4">
                <label className="block text-sm text-dark-muted mb-1.5">
                  Escribí <span className="text-red-400 font-bold">{group.name}</span> para confirmar
                </label>
                <input
                  type="text"
                  value={dissolveText}
                  onChange={(e) => setDissolveText(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-red-400 focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmAction(null); setDissolveText('') }}
                className="flex-1 px-4 py-2.5 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'leave') handleLeave()
                  else if (confirmAction.type === 'remove') handleRemoveMember(confirmAction.data.user_id)
                  else if (confirmAction.type === 'transfer') handleTransfer(confirmAction.data.user_id)
                  else if (confirmAction.type === 'dissolve') handleDissolve()
                }}
                disabled={confirmAction.type === 'dissolve' && dissolveText !== group.name}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  confirmAction.type === 'dissolve' && dissolveText !== group.name
                    ? 'bg-dark-hover text-dark-muted cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
