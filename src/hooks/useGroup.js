import useGroupStore from '../store/groupStore'
import { useAuth } from './useAuth'
import useExpenseStore from '../store/expenseStore'

export function useGroup() {
  const { user } = useAuth()
  const userId = user?.id
  const store = useGroupStore()
  const allExpenses = useExpenseStore((s) => s.expenses)

  const group = userId ? store.getGroupForUser(userId) : null
  const groupId = group?.id || null

  return {
    group,
    userId,
    members: groupId ? store.getGroupMembers(groupId) : [],
    isOwner: groupId && userId ? store.isOwner(groupId, userId) : false,
    groupExpenses: groupId ? store.getGroupExpenses(groupId, allExpenses) : [],
    pendingInvites: groupId ? store.getPendingInvites(groupId) : [],
    createGroup: (name) => userId ? store.createGroup(name, user) : { error: 'No autenticado.' },
    inviteMember: (email) => groupId ? store.inviteMember(groupId, email) : { error: 'No pertenecés a ningún grupo.' },
    acceptInvite: (token) => userId ? store.acceptInvite(token, userId, user.full_name, user.email) : { error: 'No autenticado.' },
    removeMember: (memberUserId) => groupId && userId ? store.removeMember(groupId, memberUserId, userId) : { error: 'No pertenecés a ningún grupo.' },
    leaveGroup: () => groupId && userId ? store.removeMember(groupId, userId, userId) : { error: 'No pertenecés a ningún grupo.' },
    transferOwnership: (newOwnerId) => groupId && userId ? store.transferOwnership(groupId, newOwnerId, userId) : { error: 'No pertenecés a ningún grupo.' },
    dissolveGroup: () => groupId && userId ? store.dissolveGroup(groupId, userId) : { error: 'No pertenecés a ningún grupo.' },
    canEditExpense: (expenseUserId) => groupId && userId ? store.canEditExpense(groupId, expenseUserId, userId) : false,
  }
}
