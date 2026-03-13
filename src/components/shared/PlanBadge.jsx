export default function PlanBadge({ plan }) {
  if (plan === 'pro') {
    return (
      <span className="text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.5 rounded uppercase">
        Pro
      </span>
    )
  }
  return (
    <span className="text-[10px] font-bold bg-dark-border text-dark-muted px-1.5 py-0.5 rounded uppercase">
      Free
    </span>
  )
}
