import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSalesStats } from '../db/database'

export default function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => { getSalesStats().then(setStats) }, [])

  const fmt = (n = 0) => n.toLocaleString('ar-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const quickActions = [
    { label: 'نقطة البيع', icon: '🛒', path: '/sales', color: 'bg-herb-600' },
    { label: 'إضافة منتج', icon: '➕', path: '/add-product', color: 'bg-blue-500' },
    { label: 'المنتجات', icon: '🌿', path: '/products', color: 'bg-amber-500' },
    { label: 'الإحصائيات', icon: '📊', path: '/stats', color: 'bg-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-herb-50">
      {/* Hero Header */}
      <div className="bg-herb-600 px-4 pt-safe-top pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">متجر الأعشاب</h1>
            <p className="text-herb-200 text-sm">
              {new Date().toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="text-4xl">🌿</div>
        </div>

        {/* Today stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-2xl p-4">
            <div className="text-herb-200 text-xs mb-1">مبيعات اليوم</div>
            <div className="text-white font-bold text-xl">{stats ? fmt(stats.todayTotal) : '—'}</div>
            <div className="text-herb-200 text-xs">د.ج</div>
          </div>
          <div className="bg-white/15 rounded-2xl p-4">
            <div className="text-herb-200 text-xs mb-1">مبيعات الشهر</div>
            <div className="text-white font-bold text-xl">{stats ? fmt(stats.monthTotal) : '—'}</div>
            <div className="text-herb-200 text-xs">د.ج</div>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 w-full -mt-2">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.map(a => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className={`${a.color} text-white rounded-2xl p-5 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-sm`}
            >
              <span className="text-3xl">{a.icon}</span>
              <span className="font-semibold text-sm">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Mini stats */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3">ملخص سريع</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'المنتجات', value: stats?.productsCount ?? '—' },
              { label: 'عمليات اليوم', value: stats?.todayCount ?? '—' },
              { label: 'عمليات الشهر', value: stats?.monthCount ?? '—' }
            ].map((s, i) => (
              <div key={i} className="bg-herb-50 rounded-xl py-3">
                <div className="font-bold text-herb-700 text-xl">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
