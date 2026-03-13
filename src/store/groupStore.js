import { create } from 'zustand'
import { mockGroups, mockGroupInvites } from './mockData'

// TODO SUPABASE: replace with supabase.from('groups'), supabase.from('group_members'), supabase.from('group_invites')

const useGroupStore = create((set, get) => ({
  groups: [...mockGroups],
  invites: [...mockGroupInvites],

  // --- Getters ---

  getGroupForUser: (userId) => {
    return get().groups.find((g) =>
      g.members.some((m) => m.user_id === userId)
    ) || null
  },

  getGroupMembers: (groupId) => {
    const group = get().groups.find((g) => g.id === groupId)
    return group ? group.members : []
  },

  isOwner: (groupId, userId) => {
    const group = get().groups.find((g) => g.id === groupId)
    return group ? group.owner_id === userId : false
  },

  getGroupExpenses: (groupId, allExpenses) => {
    const group = get().groups.find((g) => g.id === groupId)
    if (!group) return []
    const memberIds = group.members.map((m) => m.user_id)
    return allExpenses.filter((e) => memberIds.includes(e.user_id))
  },

  getPendingInvites: (groupId) => {
    return get().invites.filter(
      (inv) => inv.group_id === groupId && !inv.used
    )
  },

  // --- Actions ---

  createGroup: (name, owner) => {
    // TODO SUPABASE: insert into groups table + group_members table, validate server-side that user has no existing group
    const existingGroup = get().getGroupForUser(owner.id)
    if (existingGroup) return { error: 'Ya pertenecés a un grupo.' }

    const newGroup = {
      id: `grp-${Date.now()}`,
      name: String(name).slice(0, 60),
      owner_id: owner.id,
      members: [
        {
          user_id: owner.id,
          name: owner.full_name,
          email: owner.email,
          role: 'owner',
          joined_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    }

    set((state) => ({ groups: [...state.groups, newGroup] }))
    return { group: newGroup }
  },

  inviteMember: (groupId, email) => {
    // TODO SUPABASE: insert into group_invites table, send invite email via edge function, validate server-side
    const group = get().groups.find((g) => g.id === groupId)
    if (!group) return { error: 'Grupo no encontrado.' }
    if (group.members.length >= 5) return { error: 'El grupo ya tiene el máximo de 5 miembros.' }

    // Check if email is already a member
    if (group.members.some((m) => m.email === email)) {
      return { error: 'Ese email ya es miembro del grupo.' }
    }

    // Check if there's already a pending invite for this email
    const existingInvite = get().invites.find(
      (inv) => inv.group_id === groupId && inv.email === email && !inv.used
    )
    if (existingInvite) return { error: 'Ya hay una invitación pendiente para ese email.' }

    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    const invite = {
      id: `inv-${Date.now()}`,
      group_id: groupId,
      email: String(email).trim().toLowerCase(),
      token,
      expires_at: expiresAt,
      used: false,
      created_at: new Date().toISOString(),
    }

    // TODO SUPABASE: send invite email with token link
    set((state) => ({ invites: [...state.invites, invite] }))
    return { invite }
  },

  acceptInvite: (token, userId, userName, userEmail) => {
    // TODO SUPABASE: validate token server-side, add member in transaction, mark invite used
    const invite = get().invites.find((inv) => inv.token === token)
    if (!invite) return { error: 'Invitación no encontrada.' }
    if (invite.used) return { error: 'Esta invitación ya fue utilizada.' }
    if (new Date(invite.expires_at) < new Date()) return { error: 'La invitación expiró.' }

    const group = get().groups.find((g) => g.id === invite.group_id)
    if (!group) return { error: 'Grupo no encontrado.' }
    if (group.members.length >= 5) return { error: 'El grupo ya tiene el máximo de 5 miembros.' }

    // Check user doesn't already belong to a group
    const existingGroup = get().getGroupForUser(userId)
    if (existingGroup) return { error: 'Ya pertenecés a un grupo. Salí primero para unirte a otro.' }

    const newMember = {
      user_id: userId,
      name: userName,
      email: userEmail,
      role: 'member',
      joined_at: new Date().toISOString(),
    }

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === invite.group_id
          ? { ...g, members: [...g.members, newMember] }
          : g
      ),
      invites: state.invites.map((inv) =>
        inv.token === token ? { ...inv, used: true } : inv
      ),
    }))
    return { success: true }
  },

  removeMember: (groupId, userId, requestingUserId) => {
    // TODO SUPABASE: validate permissions server-side, remove member in transaction
    const group = get().groups.find((g) => g.id === groupId)
    if (!group) return { error: 'Grupo no encontrado.' }

    const isRequesterOwner = group.owner_id === requestingUserId

    // Owner can remove anyone except self; members can only remove self (leave)
    if (!isRequesterOwner && userId !== requestingUserId) {
      return { error: 'Solo el dueño puede quitar miembros.' }
    }
    if (isRequesterOwner && userId === requestingUserId) {
      return { error: 'El dueño no puede salir del grupo. Transferí la propiedad primero o disolvé el grupo.' }
    }

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.filter((m) => m.user_id !== userId) }
          : g
      ),
    }))
    return { success: true }
  },

  transferOwnership: (groupId, newOwnerId, currentOwnerId) => {
    // TODO SUPABASE: validate ownership server-side, update roles in transaction
    const group = get().groups.find((g) => g.id === groupId)
    if (!group) return { error: 'Grupo no encontrado.' }
    if (group.owner_id !== currentOwnerId) return { error: 'Solo el dueño puede transferir la propiedad.' }
    if (!group.members.some((m) => m.user_id === newOwnerId)) return { error: 'El nuevo dueño debe ser miembro del grupo.' }

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              owner_id: newOwnerId,
              members: g.members.map((m) => ({
                ...m,
                role: m.user_id === newOwnerId ? 'owner' : 'member',
              })),
            }
          : g
      ),
    }))
    return { success: true }
  },

  dissolveGroup: (groupId, ownerId) => {
    // TODO SUPABASE: validate ownership server-side, delete group + members + invites in transaction
    const group = get().groups.find((g) => g.id === groupId)
    if (!group) return { error: 'Grupo no encontrado.' }
    if (group.owner_id !== ownerId) return { error: 'Solo el dueño puede disolver el grupo.' }

    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      invites: state.invites.filter((inv) => inv.group_id !== groupId),
    }))
    return { success: true }
  },

  canEditExpense: (groupId, expenseUserId, requestingUserId) => {
    // TODO SUPABASE: validate permissions server-side
    const group = get().groups.find((g) => g.id === groupId)
    if (!group) return false
    // Owner can edit all expenses within the group
    if (group.owner_id === requestingUserId) return true
    // Members can only edit their own expenses
    return expenseUserId === requestingUserId
  },
}))

export default useGroupStore
