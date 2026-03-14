import { useState, useRef, useEffect } from 'react'
import { Camera, Copy, Check, Save } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useProfileStore from '../../store/profileStore'

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'UYU', 'MXN']

export default function DatosPersonales({ onUnsaved, onSaved }) {
  const { user } = useAuth()
  const { profile, updateProfile, setAvatar } = useProfileStore()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    fullName: user?.full_name || '',
    phone: profile.phone || '',
    currency: profile.currency || 'ARS',
    timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  // Track changes
  useEffect(() => {
    const changed =
      form.fullName !== (user?.full_name || '') ||
      form.phone !== (profile.phone || '') ||
      form.currency !== (profile.currency || 'ARS') ||
      form.timezone !== (profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)

    setHasChanges(changed)
    if (changed) onUnsaved?.()
  }, [form, user, profile])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    // Validate phone
    if (form.phone && !/^[+\d\s()-]{0,20}$/.test(form.phone)) {
      return
    }

    updateProfile({
      phone: form.phone.slice(0, 20),
      currency: form.currency,
      timezone: form.timezone,
    })

    setHasChanges(false)
    setSaved(true)
    onSaved?.()
    setTimeout(() => setSaved(false), 3000)
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')

    // Validate type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAvatarError('Solo se aceptan JPG o PNG.')
      return
    }

    // Validate size (1MB)
    if (file.size > 1_000_000) {
      setAvatarError('La imagen no puede superar 1MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target.result
      // Validate magic bytes
      if (base64.startsWith('data:image/jpeg') || base64.startsWith('data:image/png')) {
        const result = setAvatar(base64)
        if (result.error) setAvatarError(result.error)
      } else {
        setAvatarError('Formato de imagen no válido.')
      }
    }
    reader.readAsDataURL(file)
  }

  const copyUserId = () => {
    navigator.clipboard.writeText(user?.id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = (user?.full_name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-dark-text">Datos Personales</h2>

      {/* Avatar */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-dark-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold border-2 border-dark-border">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={20} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-dark-text">{user?.full_name}</p>
            <p className="text-sm text-dark-muted">{user?.email}</p>
            {avatarError && (
              <p className="text-xs text-red-400 mt-1">{avatarError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm text-dark-muted mb-1.5">Nombre completo</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value.slice(0, 100))}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm text-dark-muted mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full bg-dark-bg/50 border border-dark-border rounded-lg px-3 py-2.5 text-dark-muted text-sm cursor-not-allowed"
          />
          <p className="text-xs text-dark-muted mt-1">Para cambiar el email contactá soporte</p>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm text-dark-muted mb-1.5">Teléfono (opcional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+54 11 1234-5678"
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Moneda */}
        <div>
          <label className="block text-sm text-dark-muted mb-1.5">Moneda principal</label>
          <select
            value={form.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Zona horaria */}
        <div>
          <label className="block text-sm text-dark-muted mb-1.5">Zona horaria</label>
          <input
            type="text"
            value={form.timezone}
            onChange={(e) => handleChange('timezone', e.target.value.slice(0, 50))}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            hasChanges
              ? 'bg-accent text-dark-bg hover:bg-accent/90 cursor-pointer'
              : saved
              ? 'bg-green-500/20 text-green-400 cursor-default'
              : 'bg-dark-hover text-dark-muted cursor-not-allowed'
          }`}
        >
          {saved ? (
            <>
              <Check size={16} />
              Guardado
            </>
          ) : (
            <>
              <Save size={16} />
              Guardar cambios
            </>
          )}
        </button>
      </div>

      {/* Account info (read-only) */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Información de cuenta</h3>

        <div className="flex justify-between items-center py-2 border-b border-dark-border/50">
          <span className="text-sm text-dark-muted">Fecha de creación</span>
          <span className="text-sm text-dark-text">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
              : '—'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-dark-border/50">
          <span className="text-sm text-dark-muted">Último acceso</span>
          <span className="text-sm text-dark-text">
            {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-dark-muted">ID de usuario</span>
          <button
            onClick={copyUserId}
            className="flex items-center gap-1.5 text-sm text-dark-text hover:text-accent transition-colors"
          >
            <code className="text-xs bg-dark-bg px-2 py-1 rounded">{user?.id || '—'}</code>
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
