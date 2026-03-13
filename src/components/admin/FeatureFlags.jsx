import { ToggleLeft, ToggleRight } from 'lucide-react'
import useAdminStore from '../../store/adminStore'

export default function FeatureFlags() {
  const flags = useAdminStore((s) => s.featureFlags)
  const toggle = useAdminStore((s) => s.toggleFeatureFlag)

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Feature Flags</h2>
      <p className="text-sm text-dark-muted mb-6">
        Activá o desactivá funciones globalmente. Útil si necesitás desactivar el asistente IA por costos.
      </p>

      <div className="space-y-2">
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="bg-dark-surface border border-dark-border rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">{flag.description}</p>
              <p className="text-xs text-dark-muted font-mono">{flag.key}</p>
            </div>
            <button onClick={() => toggle(flag.key)}>
              {flag.enabled ? (
                <ToggleRight size={28} className="text-accent" />
              ) : (
                <ToggleLeft size={28} className="text-dark-muted" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
