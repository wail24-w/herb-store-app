import { useState, useEffect } from 'react'
import { getSalesStats, getRecentSales } from '../db/database'

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    getSalesStats().then(setStats)
    getRecentSales(10).then(setRecent)
  }, [])

  const fmt = (n = 0) => n.toLocaleString('ar-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtDate = (iso) => new Date(iso).toLocaleString('ar-DZ', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="min-h-screen bg-herb-50">
      <div className="page-header">
        <h1 className="text-lg font-bold">الإحصائيات</h1>
      </div>

      <div className="p-4 pb-24 max-w-lg mx-auto space-y-4">
        {/* Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'إجمالي المنتجات', value: stats?.productsCount ?? '—', icon: '🌿', color: 'herb' },
            { label: 'إجمالي المبيعات', value: stats?.totalSalesCount ?? '—', icon: '🧾', color: 'blue' },
            { label: 'مبيعات اليوم', value: stats ? `${fmt(stats.todayTotal)} د.ج` : '—', icon: '📅', color: 'amber', sub: `${stats?.todayCount ?? 0} عملية` },
            { label: 'مبيعات الشهر', value: stats ? `${fmt(stats.monthTotal)} د.ج` : '—', icon: '📆', color: 'purple', sub: `${stats?.monthCount ?? 0} عملية` }
          ].map((card, i) => (
            <div key={i} className="card">
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className="text-xs text-gray-500">{card.label}</div>
              <div className="font-bold text-gray-800 text-base mt-0.5">{card.value}</div>
              {card.sub && <div className="text-xs text-gray-400">{card.sub}</div>}
            </div>
          ))}
        </div>

        {/* Recent sales */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3">آخر العمليات</h2>
          {recent.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">لا توجد مبيعات بعد</p>
          ) : (
            <div className="space-y-2">
              {recent.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{fmt(s.total)} د.ج</div>
                    <div className="text-xs text-gray-400">{fmtDate(s.createdAt)}</div>
                  </div>
                  <div className="text-xs bg-herb-100 text-herb-700 px-2 py-1 rounded-lg">
                    {s.itemCount} منتج
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
