export default function DashboardMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main mockup container */}
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 shadow-2xl shadow-accent/5">
        {/* Fake topbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-dark-text">
            mi Econom<span className="text-accent">IA</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-dark-border" />
            <div className="w-2 h-2 rounded-full bg-dark-border" />
            <div className="w-2 h-2 rounded-full bg-accent/40" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-dark-bg border border-dark-border rounded-lg p-2.5 animate-fade-in-1">
            <div className="text-[8px] text-dark-muted mb-1">Ingresos</div>
            <div className="text-xs font-mono font-bold text-accent">$850.000</div>
          </div>
          <div className="bg-dark-bg border border-dark-border rounded-lg p-2.5 animate-fade-in-2">
            <div className="text-[8px] text-dark-muted mb-1">Gastos</div>
            <div className="text-xs font-mono font-bold text-red-400">$620.000</div>
          </div>
          <div className="bg-dark-bg border border-dark-border rounded-lg p-2.5 animate-fade-in-3">
            <div className="text-[8px] text-dark-muted mb-1">Balance</div>
            <div className="text-xs font-mono font-bold text-accent">$230.000</div>
          </div>
        </div>

        {/* Fake chart */}
        <div className="bg-dark-bg border border-dark-border rounded-lg p-3 mb-4">
          <div className="text-[8px] text-dark-muted mb-2">Últimos 6 meses</div>
          <div className="flex items-end justify-between gap-1.5 h-16">
            {[40, 55, 35, 65, 50, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5">
                <div
                  className="bg-accent/30 rounded-sm animate-grow"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${0.5 + i * 0.15}s`,
                  }}
                />
                <div
                  className="bg-red-400/30 rounded-sm animate-grow"
                  style={{
                    height: `${h * 0.7}%`,
                    animationDelay: `${0.6 + i * 0.15}s`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fake expense rows */}
        <div className="space-y-1.5 mb-4">
          {[
            { cat: '🍔', name: 'Alimentación', amt: '$45.200', color: 'text-red-400' },
            { cat: '🏠', name: 'Alquiler', amt: '$280.000', color: 'text-red-400' },
            { cat: '💰', name: 'Sueldo', amt: '$850.000', color: 'text-accent' },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-dark-bg border border-dark-border rounded-lg px-2.5 py-1.5 animate-slide-in"
              style={{ animationDelay: `${1.2 + i * 0.2}s` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{row.cat}</span>
                <span className="text-[10px] text-dark-muted">{row.name}</span>
              </div>
              <span className={`text-[10px] font-mono ${row.color}`}>{row.amt}</span>
            </div>
          ))}
        </div>

        {/* MAX chat bubble */}
        <div
          className="bg-accent/10 border border-accent/20 rounded-xl p-3 animate-pop-in"
          style={{ animationDelay: '2s' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-[8px] font-bold text-accent">M</span>
            </div>
            <span className="text-[9px] font-medium text-accent">MAX</span>
            <span className="text-[8px] text-accent/60">✅ SÍ PODÉS</span>
          </div>
          <p className="text-[9px] text-dark-muted leading-relaxed">
            Tenés un balance positivo de $230.000. Podés hacer esa compra sin comprometer tus ahorros.
          </p>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-accent/5 rounded-3xl blur-2xl -z-10" />

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes grow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-1 { animation: fadeIn 0.5s ease-out 0.3s both; }
        .animate-fade-in-2 { animation: fadeIn 0.5s ease-out 0.5s both; }
        .animate-fade-in-3 { animation: fadeIn 0.5s ease-out 0.7s both; }
        .animate-grow { animation: grow 0.6s ease-out both; transform-origin: bottom; }
        .animate-slide-in { animation: slideIn 0.4s ease-out both; }
        .animate-pop-in { animation: popIn 0.5s ease-out both; }
      `}</style>
    </div>
  )
}
