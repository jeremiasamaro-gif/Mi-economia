import { create } from 'zustand'

// TODO SUPABASE: replace all mock data with Supabase queries
// Tables: support_conversations, support_messages, support_notifications
// See schema in project spec for full SQL

const ADMIN_EMAIL = 'jeremias@mieconomia.com'
const MAX_MESSAGE_LENGTH = 1000
const RATE_LIMIT_MAX = 10 // messages per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const SUPPORT_RATE_KEY = 'mi-economia-support-rate'

// BUG-011 FIX: persist rate limit in localStorage so refresh doesn't reset it
function getSupportRateLog() {
  try {
    const data = JSON.parse(localStorage.getItem(SUPPORT_RATE_KEY) || '[]')
    const now = Date.now()
    return data.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)
  } catch { return [] }
}

function addSupportRateEntry() {
  try {
    const log = getSupportRateLog()
    log.push(Date.now())
    localStorage.setItem(SUPPORT_RATE_KEY, JSON.stringify(log))
  } catch { /* ignore */ }
}

// Mock conversations for development
const mockConversations = [
  {
    id: 'conv-demo-pro',
    user_id: 'user-demo-pro',
    user_name: 'Usuario Demo Pro',
    user_email: 'demo-pro@mieconomia.com',
    user_plan: 'pro',
    status: 'open',
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    unread_by_admin: true,
    unread_by_user: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'conv-demo-free',
    user_id: 'user-demo-free',
    user_name: 'Usuario Demo Free',
    user_email: 'demo-free@mieconomia.com',
    user_plan: 'free',
    status: 'open',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hrs ago
    unread_by_admin: false,
    unread_by_user: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

const mockMessages = {
  'conv-demo-pro': [
    {
      id: 'msg-1',
      conversation_id: 'conv-demo-pro',
      sender_id: 'user-demo-pro',
      sender_role: 'user',
      content: 'Hola, tengo un problema con mi cuenta',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-demo-pro',
      sender_id: 'user-admin',
      sender_role: 'admin',
      content: 'Hola! ¿En qué te puedo ayudar?',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'msg-3',
      conversation_id: 'conv-demo-pro',
      sender_id: 'user-demo-pro',
      sender_role: 'user',
      content: 'No me aparecen los gastos del mes pasado, se borraron todos',
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
  'conv-demo-free': [
    {
      id: 'msg-4',
      conversation_id: 'conv-demo-free',
      sender_id: 'user-demo-free',
      sender_role: 'user',
      content: 'Hola, quería saber si hay descuentos para estudiantes',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'msg-5',
      conversation_id: 'conv-demo-free',
      sender_id: 'user-admin',
      sender_role: 'admin',
      content: 'Hola! Por ahora no tenemos descuentos especiales, pero podés aprovechar el plan anual que tiene un 28% de ahorro.',
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],
}

// Sanitize message content: strip HTML, enforce max length
function sanitizeMessage(content) {
  const stripped = content.replace(/<[^>]*>/g, '').trim()
  return stripped.slice(0, MAX_MESSAGE_LENGTH)
}

const useSupportStore = create((set, get) => ({
  conversations: [...mockConversations],
  messages: { ...mockMessages },
  notifications: [],
  isPanelOpen: false,
  activeConversationId: null,

  // --- Panel ---
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),

  // --- Client side ---

  // Get or create the conversation for the current user
  getOrCreateConversation: (userId, userName, userEmail, userPlan) => {
    const state = get()
    let conv = state.conversations.find((c) => c.user_id === userId)
    if (!conv) {
      conv = {
        id: `conv-${userId}`,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        user_plan: userPlan,
        status: 'open',
        last_message_at: new Date().toISOString(),
        unread_by_admin: false,
        unread_by_user: false,
        created_at: new Date().toISOString(),
      }
      set((s) => ({
        conversations: [...s.conversations, conv],
        messages: { ...s.messages, [conv.id]: [] },
      }))
    }
    return conv
  },

  getConversationMessages: (conversationId) => {
    return get().messages[conversationId] || []
  },

  // BUG-011 FIX: check rate limit from localStorage (persists across refresh)
  canSendMessage: () => {
    return getSupportRateLog().length < RATE_LIMIT_MAX
  },

  // Send message as user
  sendUserMessage: (userId, userName, userEmail, userPlan, content) => {
    const state = get()
    if (!state.canSendMessage()) return false

    const sanitized = sanitizeMessage(content)
    if (!sanitized) return false

    const conv = state.getOrCreateConversation(userId, userName, userEmail, userPlan)
    const convId = conv.id

    const msg = {
      id: `msg-${Date.now()}`,
      conversation_id: convId,
      sender_id: userId,
      sender_role: 'user',
      content: sanitized,
      read: false,
      created_at: new Date().toISOString(),
    }

    // TODO SUPABASE: insert into support_messages, update support_conversations
    set((s) => ({
      messages: {
        ...s.messages,
        [convId]: [...(s.messages[convId] || []), msg],
      },
      conversations: s.conversations.map((c) =>
        c.id === convId
          ? { ...c, last_message_at: msg.created_at, unread_by_admin: true, status: 'open' }
          : c
      ),
    }))

    // BUG-011 FIX: persist rate limit entry
    addSupportRateEntry()

    return true
  },

  // Mark messages as read by user (when user opens panel)
  markReadByUser: (userId) => {
    const state = get()
    const conv = state.conversations.find((c) => c.user_id === userId)
    if (!conv) return

    // TODO SUPABASE: update support_conversations set unread_by_user = false
    // TODO SUPABASE: update support_messages set read = true where conversation_id and sender_role = 'admin'
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.user_id === userId ? { ...c, unread_by_user: false } : c
      ),
      messages: {
        ...s.messages,
        [conv.id]: (s.messages[conv.id] || []).map((m) =>
          m.sender_role === 'admin' ? { ...m, read: true } : m
        ),
      },
      notifications: s.notifications.map((n) =>
        n.user_id === userId ? { ...n, read: true } : n
      ),
    }))
  },

  // Count unread messages for a user (admin replies they haven't seen)
  getUnreadCountForUser: (userId) => {
    const state = get()
    const conv = state.conversations.find((c) => c.user_id === userId)
    if (!conv || !conv.unread_by_user) return 0
    const msgs = state.messages[conv.id] || []
    return msgs.filter((m) => m.sender_role === 'admin' && !m.read).length
  },

  // --- Admin side ---

  // Get all conversations sorted: unread first, then by last_message_at desc
  getAllConversations: () => {
    const state = get()
    return [...state.conversations].sort((a, b) => {
      if (a.unread_by_admin && !b.unread_by_admin) return -1
      if (!a.unread_by_admin && b.unread_by_admin) return 1
      return new Date(b.last_message_at) - new Date(a.last_message_at)
    })
  },

  // Count unread conversations for admin
  getUnreadCountForAdmin: () => {
    return get().conversations.filter((c) => c.unread_by_admin).length
  },

  // Send message as admin
  sendAdminMessage: (conversationId, adminId, content) => {
    const sanitized = sanitizeMessage(content)
    if (!sanitized) return false

    const msg = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: adminId,
      sender_role: 'admin',
      content: sanitized,
      read: false,
      created_at: new Date().toISOString(),
    }

    const state = get()
    const conv = state.conversations.find((c) => c.id === conversationId)

    // TODO SUPABASE: insert into support_messages, update support_conversations
    // TODO SUPABASE: insert into support_notifications for the user
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] || []), msg],
      },
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, last_message_at: msg.created_at, unread_by_admin: false, unread_by_user: true }
          : c
      ),
      notifications: conv
        ? [
            ...s.notifications,
            {
              id: `notif-${Date.now()}`,
              user_id: conv.user_id,
              message: sanitized.slice(0, 80),
              read: false,
              conversation_id: conversationId,
              created_at: new Date().toISOString(),
            },
          ]
        : s.notifications,
    }))

    return true
  },

  // Mark messages as read by admin (when admin opens conversation)
  markReadByAdmin: (conversationId) => {
    // TODO SUPABASE: update support_conversations set unread_by_admin = false
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread_by_admin: false } : c
      ),
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] || []).map((m) =>
          m.sender_role === 'user' ? { ...m, read: true } : m
        ),
      },
    }))
  },

  // Close conversation
  closeConversation: (conversationId) => {
    // TODO SUPABASE: update support_conversations set status = 'closed'
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, status: 'closed' } : c
      ),
    }))
  },

  // Reopen conversation
  reopenConversation: (conversationId) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, status: 'open' } : c
      ),
    }))
  },
}))

export default useSupportStore
