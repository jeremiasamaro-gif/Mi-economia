import { useState } from 'react'
import { UsersRound, UserPlus, Crown, LogOut, Trash2, ArrowRightLeft, Mail, Clock, Copy } from 'lucide-react'
import { useGroup } from '../../hooks/useGroup'

export default function GroupSettings() {
  const {
    group, userId, members, isOwner, pendingInvites,
    createGroup, inviteMember, removeMember, leaveGroup,
    transferOwnership, dissolveGroup,
  } = useGroup()

  const [groupName, setGroupName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const handleCreate = () => {
    if (!groupName.trim()) return
    const result = createGroup(groupName.trim())
    if (result.error) return showMsg(result.error, true)
    showMsg('Grupo creado')
    setGroupName('')
  }

  const handleInvite = () => {
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) return showMsg('Ingresá un email válido', true)
    const result = inviteMember(email)
    if (result.error) return showMsg(result.error, true)
    showMsg(`Invitación enviada a ${email}`)
    setInviteEmail('')
  }

  const executeConfirm = () => {
    if (!confirmAction) return
    let result
    if (confirmAction.type === 'remove') result = removeMember(confirmAction.payload)
    else if (confirmAction.type === 'transfer') result = transferOwnership(confirmAction.payload)
    else if (confirmAction.type === 'dissolve') result = dissolveGroup()
    else if (confirmAction.type === 'leave') result = leaveGroup()
    if (result?.error) showMsg(result.error, true)
    else showMsg('Acción completada')
    setConfirmAction(null)
  }

  if (!group) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <UsersRound className="text-accent" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-text">Grupo</h2>
            <p className="text-sm text-dark-muted">Compartí gastos con tu pareja o familia</p>
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6 max-w-md">
          <h3 className="font-semibold mb-4">Crear un grupo</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nombre del grupo (ej: Casa)"
              maxLength={60}
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button onClick={handleCreate} className="bg-accent text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90">
              Crear
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <UsersRound className="text-accent" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-text">{group.name}</h2>
            <p className="text-sm text-dark-muted">{members.length} miembro{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}
      {success && <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-2 rounded-lg">{success}</div>}

      <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Miembros</h3>
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-dark-bg flex items-center justify-center text-xs font-bold text-accent">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    {m.name}
                    {m.role === 'owner' && <Crown size={12} className="text-yellow-400" />}
                    {m.user_id === userId && <span className="text-xs text-dark-muted">(vos)</span>}
                  </p>
                  <p className="text-xs text-dark-muted">{m.email}</p>
                </div>
              </div>
              {isOwner && m.user_id !== userId && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setConfirmAction({ type: 'transfer', payload: m.user_id, label: `¿Transferir la propiedad a ${m.name}?` })}
                    className="text-dark-muted hover:text-yellow-400 p-1" title="Transferir propiedad"
                  >
                    <ArrowRightLeft size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmAction({ type: 'remove', payload: m.user_id, label: `¿Quitar a ${m.name} del grupo?` })}
                    className="text-dark-muted hover:text-red-400 p-1" title="Quitar del grupo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isOwner && members.length < 5 && (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <UserPlus size={16} /> Invitar miembro
          </h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              maxLength={100}
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
            <button onClick={handleInvite} className="bg-accent text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90">
              Invitar
            </button>
          </div>
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Mail size={16} /> Invitaciones pendientes
          </h3>
          <div className="space-y-2">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm bg-dark-bg rounded-lg px-3 py-2">
                <span>{inv.email}</span>
                <div className="flex items-center gap-2 text-xs text-dark-muted">
                  <Clock size={12} />
                  <span>Expira {new Date(inv.expires_at).toLocaleDateString('es-AR')}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(inv.token); showMsg('Token copiado') }}
                    className="text-dark-muted hover:text-accent p-1" title="Copiar token"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Acciones</h3>
        <div className="flex flex-wrap gap-2">
          {!isOwner && (
            <button
              onClick={() => setConfirmAction({ type: 'leave', label: '¿Seguro que querés salir del grupo?' })}
              className="flex items-center gap-1.5 text-sm text-yellow-400 hover:text-yellow-300 border border-yellow-400/30 px-3 py-1.5 rounded-lg"
            >
              <LogOut size={14} /> Salir del grupo
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => setConfirmAction({ type: 'dissolve', label: '¿Seguro que querés disolver el grupo? Esta acción no se puede deshacer.' })}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded-lg"
            >
              <Trash2 size={14} /> Disolver grupo
            </button>
          )}
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 max-w-sm w-full">
            <p className="text-sm mb-4">{confirmAction.label}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmAction(null)} className="text-dark-muted hover:text-dark-text text-sm px-3 py-1.5">
                Cancelar
              </button>
              <button onClick={executeConfirm} className="bg-red-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-600">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
