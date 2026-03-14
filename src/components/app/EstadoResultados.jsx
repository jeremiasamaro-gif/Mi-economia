import { useState, useMemo } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { useTranslation } from '../../hooks/useTranslation'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const PERIODS = ['monthly', 'quarterly', 'yearly']

function getQuarter(date) {
  return Math.floor(date.getMonth() / 3) + 1
}

function getMonthName(monthIndex, lang) {
  const names = {
    es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  }
  return (names[lang] || names.es)[monthIndex]
}

function getFullMonthName(monthIndex, lang) {
  const names = {
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  }
  return (names[lang] || names.es)[monthIndex]
}

function calcVariation(current, previous) {
  if (previous === 0 && current > 0) return 'new'
  if (previous === 0 && current === 0) return null
  return ((current - previous) / previous) * 100
}

function formatVariation(variation, t) {
  if (variation === null) return '—'
  if (variation === 'new') return t('pnl.new')
  const rounded = Math.round(variation * 10) / 10
  const prefix = rounded > 0 ? '+' : ''
  return `${prefix}${rounded}%`
}

function filterByPeriod(expenses, period, offset) {
  const now = new Date()
  return expenses.filter((e) => {
    const d = new Date(e.date)
    if (period === 'monthly') {
      let targetMonth = now.getMonth() - offset
      let targetYear = now.getFullYear()
      if (targetMonth < 0) {
        targetMonth += 12
        targetYear -= 1
      }
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear
    }
    if (period === 'quarterly') {
      const currentQ = getQuarter(now)
      let targetQ = currentQ - offset
      let targetYear = now.getFullYear()
      while (targetQ < 1) {
        targetQ += 4
        targetYear -= 1
      }
      return getQuarter(d) === targetQ && d.getFullYear() === targetYear
    }
    // yearly
    const targetYear = now.getFullYear() - offset
    return d.getFullYear() === targetYear
  })
}

function groupByCategory(items) {
  const map = {}
  items.forEach((e) => {
    const cat = String(e.category || '')
    if (!map[cat]) map[cat] = 0
    map[cat] += e.amount
  })
  return map
}

function getPeriodLabel(period, offset, lang) {
  const now = new Date()
  if (period === 'monthly') {
    let m = now.getMonth() - offset
    let y = now.getFullYear()
    if (m < 0) { m += 12; y -= 1 }
    return `${getMonthName(m, lang)} ${y}`
  }
  if (period === 'quarterly') {
    let q = getQuarter(now) - offset
    let y = now.getFullYear()
    while (q < 1) { q += 4; y -= 1 }
    return `Q${q} ${y}`
  }
  return `${now.getFullYear() - offset}`
}

function getSubtitleDate(lang) {
  const now = new Date()
  return `${getFullMonthName(now.getMonth(), lang)} ${now.getFullYear()}`
}

export default function EstadoResultados() {
  const { expenses } = useExpenses()
  const { t, lang } = useTranslation()
  const [period, setPeriod] = useState('monthly')
  const [showMobileComparison, setShowMobileComparison] = useState(false)

  const data = useMemo(() => {
    const currentItems = filterByPeriod(expenses, period, 0)
    const previousItems = filterByPeriod(expenses, period, 1)

    const currentIncome = currentItems.filter((e) => e.type === 'income')
    const previousIncome = previousItems.filter((e) => e.type === 'income')
    const currentExpense = currentItems.filter((e) => e.type === 'expense')
    const previousExpense = previousItems.filter((e) => e.type === 'expense')

    const curIncByCat = groupByCategory(currentIncome)
    const prevIncByCat = groupByCategory(previousIncome)
    const curExpByCat = groupByCategory(currentExpense)
    const prevExpByCat = groupByCategory(previousExpense)

    // Merge all category names
    const incomeCategories = [...new Set([...Object.keys(curIncByCat), ...Object.keys(prevIncByCat)])]
      .filter((cat) => (curIncByCat[cat] || 0) > 0 || (prevIncByCat[cat] || 0) > 0)
    const expenseCategories = [...new Set([...Object.keys(curExpByCat), ...Object.keys(prevExpByCat)])]
      .filter((cat) => (curExpByCat[cat] || 0) > 0 || (prevExpByCat[cat] || 0) > 0)

    const totalCurIncome = currentIncome.reduce((s, e) => s + e.amount, 0)
    const totalPrevIncome = previousIncome.reduce((s, e) => s + e.amount, 0)
    const totalCurExpense = currentExpense.reduce((s, e) => s + e.amount, 0)
    const totalPrevExpense = previousExpense.reduce((s, e) => s + e.amount, 0)

    const curBalance = totalCurIncome - totalCurExpense
    const prevBalance = totalPrevIncome - totalPrevExpense

    // Savings rate
    const savingsRate = totalCurIncome > 0 ? (curBalance / totalCurIncome) * 100 : 0
    const prevSavingsRate = totalPrevIncome > 0 ? (prevBalance / totalPrevIncome) * 100 : 0

    // Largest expense category
    let largestExpCat = ''
    let largestExpAmt = 0
    Object.entries(curExpByCat).forEach(([cat, amt]) => {
      if (amt > largestExpAmt) { largestExpCat = cat; largestExpAmt = amt }
    })
    const largestExpPct = totalCurExpense > 0 ? (largestExpAmt / totalCurExpense) * 100 : 0

    // Projection (only for monthly)
    const now = new Date()
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - dayOfMonth
    const dailyAvgExp = dayOfMonth > 0 ? totalCurExpense / dayOfMonth : 0
    const projectedExpense = totalCurExpense + dailyAvgExp * daysRemaining
    const lastDayStr = `${daysInMonth}/${String(now.getMonth() + 1).padStart(2, '0')}`

    return {
      incomeCategories,
      expenseCategories,
      curIncByCat,
      prevIncByCat,
      curExpByCat,
      prevExpByCat,
      totalCurIncome,
      totalPrevIncome,
      totalCurExpense,
      totalPrevExpense,
      curBalance,
      prevBalance,
      savingsRate,
      prevSavingsRate,
      largestExpCat,
      largestExpPct,
      projectedExpense,
      lastDayStr,
      daysRemaining,
    }
  }, [expenses, period])

  const currentLabel = getPeriodLabel(period, 0, lang)
  const previousLabel = getPeriodLabel(period, 1, lang)

  const savingsColor = data.savingsRate > 20 ? 'text-[#4ade80]' : data.savingsRate >= 5 ? 'text-amber-400' : 'text-[#f87171]'

  return (
    <div className="bg-[#13151a] border border-[#2a2d35] rounded-xl p-5 mb-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#e2e4e9]">
            {t('pnl.title')}
          </h3>
          <p className="text-xs text-[#6b7280] mt-0.5">
            {t('pnl.subtitle', { date: getSubtitleDate(lang) })}
          </p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                period === p
                  ? 'bg-[#1e2128] border border-[#3a3d45] text-[#e2e4e9]'
                  : 'border border-transparent text-[#6b7280] hover:text-[#9ca3af]'
              }`}
            >
              {t(`pnl.period.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_120px_80px] gap-2 px-2 pb-2 border-b border-[#1a1d23]">
        <span className="text-[10px] uppercase tracking-wider text-[#6b7280]">{t('pnl.concept')}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#6b7280] text-right">{currentLabel}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#6b7280] text-right hidden sm:block">{previousLabel}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#6b7280] text-right hidden sm:block">{t('pnl.var')}</span>
      </div>

      {/* Mobile toggle */}
      <div className="sm:hidden mt-2 mb-1 px-2">
        <button
          onClick={() => setShowMobileComparison(!showMobileComparison)}
          className="text-[10px] text-[#4ade80] underline"
        >
          {showMobileComparison ? t('pnl.hideComparison') : t('pnl.showComparison')}
        </button>
      </div>

      {/* INGRESOS section */}
      <div className="mt-3">
        <div className="flex items-center gap-2 px-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#4ade80]">{t('pnl.income')}</span>
          <div className="flex-1 h-px bg-[#4ade80]/20" />
        </div>
        {data.incomeCategories.map((cat) => {
          const cur = data.curIncByCat[cat] || 0
          const prev = data.prevIncByCat[cat] || 0
          const variation = calcVariation(cur, prev)
          return (
            <div
              key={cat}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_120px_80px] gap-2 px-2 py-1.5 hover:bg-[#1a1d23] transition-colors border-b border-[#1a1d23]/50"
            >
              <span className="text-xs text-[#9ca3af] pl-3">{t(`cat.${cat}`) !== `cat.${cat}` ? t(`cat.${cat}`) : cat}</span>
              <span className="text-xs font-mono text-[#4ade80] text-right">{formatARS(cur)}</span>
              <span className={`text-xs font-mono text-[#6b7280] text-right ${showMobileComparison ? 'block' : 'hidden'} sm:block`}>
                {formatARS(prev)}
              </span>
              <span className={`text-xs text-right ${showMobileComparison ? 'block' : 'hidden'} sm:block ${
                variation === 'new' ? 'text-[#4ade80]'
                : variation === null ? 'text-[#6b7280]'
                : variation > 0 ? 'text-[#4ade80]'
                : 'text-[#f87171]'
              }`}>
                {formatVariation(variation, t)}
              </span>
            </div>
          )
        })}
        {/* Total Ingresos */}
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_120px_80px] gap-2 px-2 py-2 border-b border-[#2a2d35]">
          <span className="text-xs font-medium text-[#e2e4e9]">{t('pnl.totalIncome')}</span>
          <span className="text-xs font-mono font-medium text-[#e2e4e9] text-right">{formatARS(data.totalCurIncome)}</span>
          <span className={`text-xs font-mono text-[#6b7280] text-right ${showMobileComparison ? 'block' : 'hidden'} sm:block`}>
            {formatARS(data.totalPrevIncome)}
          </span>
          <span className={`text-xs text-right ${showMobileComparison ? 'block' : 'hidden'} sm:block ${
            calcVariation(data.totalCurIncome, data.totalPrevIncome) === 'new' ? 'text-[#4ade80]'
            : calcVariation(data.totalCurIncome, data.totalPrevIncome) === null ? 'text-[#6b7280]'
            : calcVariation(data.totalCurIncome, data.totalPrevIncome) > 0 ? 'text-[#4ade80]'
            : 'text-[#f87171]'
          }`}>
            {formatVariation(calcVariation(data.totalCurIncome, data.totalPrevIncome), t)}
          </span>
        </div>
      </div>

      {/* GASTOS section */}
      <div className="mt-4">
        <div className="flex items-center gap-2 px-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#f87171]">{t('pnl.expenses')}</span>
          <div className="flex-1 h-px bg-[#f87171]/20" />
        </div>
        {data.expenseCategories.map((cat) => {
          const cur = data.curExpByCat[cat] || 0
          const prev = data.prevExpByCat[cat] || 0
          const variation = calcVariation(cur, prev)
          return (
            <div
              key={cat}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_120px_80px] gap-2 px-2 py-1.5 hover:bg-[#1a1d23] transition-colors border-b border-[#1a1d23]/50"
            >
              <span className="text-xs text-[#9ca3af] pl-3">{t(`cat.${cat}`) !== `cat.${cat}` ? t(`cat.${cat}`) : cat}</span>
              <span className="text-xs font-mono text-[#f87171] text-right">{formatARS(cur)}</span>
              <span className={`text-xs font-mono text-[#6b7280] text-right ${showMobileComparison ? 'block' : 'hidden'} sm:block`}>
                {formatARS(prev)}
              </span>
              <span className={`text-xs text-right ${showMobileComparison ? 'block' : 'hidden'} sm:block ${
                variation === 'new' ? 'text-[#f87171]'
                : variation === null ? 'text-[#6b7280]'
                : variation > 0 ? 'text-[#f87171]'
                : 'text-[#4ade80]'
              }`}>
                {formatVariation(variation, t)}
              </span>
            </div>
          )
        })}
        {/* Total Gastos */}
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_120px_80px] gap-2 px-2 py-2 border-b border-[#2a2d35]">
          <span className="text-xs font-medium text-[#e2e4e9]">{t('pnl.totalExpenses')}</span>
          <span className="text-xs font-mono font-medium text-[#e2e4e9] text-right">{formatARS(data.totalCurExpense)}</span>
          <span className={`text-xs font-mono text-[#6b7280] text-right ${showMobileComparison ? 'block' : 'hidden'} sm:block`}>
            {formatARS(data.totalPrevExpense)}
          </span>
          <span className={`text-xs text-right ${showMobileComparison ? 'block' : 'hidden'} sm:block ${
            (() => {
              const v = calcVariation(data.totalCurExpense, data.totalPrevExpense)
              return v === 'new' ? 'text-[#f87171]' : v === null ? 'text-[#6b7280]' : v > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'
            })()
          }`}>
            {formatVariation(calcVariation(data.totalCurExpense, data.totalPrevExpense), t)}
          </span>
        </div>
      </div>

      {/* RESULTADO section */}
      <div className="mt-4">
        <div className="flex items-center gap-2 px-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#e2e4e9]">{t('pnl.result')}</span>
          <div className="flex-1 h-px bg-[#e2e4e9]/20" />
        </div>
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_120px_80px] gap-2 px-2 py-3 bg-[#1a1d23]/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#e2e4e9]">{t('pnl.netBalance')}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              data.curBalance >= 0 ? 'bg-[#4ade80]/15 text-[#4ade80]' : 'bg-[#f87171]/15 text-[#f87171]'
            }`}>
              {data.curBalance >= 0 ? t('pnl.surplus') : t('pnl.deficit')}
            </span>
          </div>
          <span className={`text-sm font-mono font-bold text-right ${data.curBalance >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
            {formatARS(data.curBalance)}
          </span>
          <span className={`text-xs font-mono text-[#6b7280] text-right self-center ${showMobileComparison ? 'block' : 'hidden'} sm:block`}>
            {formatARS(data.prevBalance)}
          </span>
          <span className={`text-xs text-right self-center ${showMobileComparison ? 'block' : 'hidden'} sm:block ${
            (() => {
              const v = calcVariation(data.curBalance, data.prevBalance)
              return v === 'new' ? 'text-[#4ade80]' : v === null ? 'text-[#6b7280]' : v > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
            })()
          }`}>
            {formatVariation(calcVariation(data.curBalance, data.prevBalance), t)}
          </span>
        </div>
      </div>

      {/* Mini cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        {/* Savings rate */}
        <div className="bg-[#1a1d23] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">{t('pnl.savingsRate')}</p>
          <p className={`text-lg font-mono font-bold ${savingsColor}`}>
            {Math.round(data.savingsRate * 10) / 10}%
          </p>
          <p className="text-[10px] text-[#6b7280] mt-0.5">
            vs {Math.round(data.prevSavingsRate * 10) / 10}% {t('pnl.prevPeriod')}
          </p>
        </div>

        {/* Largest expense */}
        <div className="bg-[#1a1d23] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">{t('pnl.largestExpense')}</p>
          <p className="text-sm font-medium text-[#e2e4e9] truncate">
            {data.largestExpCat
              ? (t(`cat.${data.largestExpCat}`) !== `cat.${data.largestExpCat}` ? t(`cat.${data.largestExpCat}`) : data.largestExpCat)
              : '—'}
          </p>
          <p className="text-[10px] text-[#6b7280] mt-0.5">
            {data.largestExpCat ? `${Math.round(data.largestExpPct)}% ${t('pnl.ofTotalExpenses')}` : '—'}
          </p>
        </div>

        {/* Projection */}
        <div className="bg-[#1a1d23] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">{t('pnl.projection')}</p>
          <p className="text-sm font-mono font-medium text-[#e2e4e9]">
            {period === 'monthly' && data.daysRemaining > 0 ? formatARS(data.projectedExpense) : '—'}
          </p>
          <p className="text-[10px] text-[#6b7280] mt-0.5">
            {period === 'monthly' && data.daysRemaining > 0
              ? t('pnl.estimatedAt', { date: data.lastDayStr })
              : t('pnl.onlyMonthly')}
          </p>
        </div>
      </div>

      {/* Watermark */}
      <p className="text-[10px] text-[#374151] text-right mt-4">
        mi EconomIA · {t('pnl.watermark')}
      </p>
    </div>
  )
}
