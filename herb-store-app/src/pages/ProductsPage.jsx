import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchProducts, deleteProduct, updateProduct, bulkUpdatePrices } from '../db/database'
import BarcodeScanner from '../components/Scanner/BarcodeScanner'

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [selected, setSelected] = useState([])
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkPercent, setBulkPercent] = useState('')
  const [bulkDir, setBulkDir] = useState('up')
  const [editingId, setEditingId] = useState(null)
  const [editPrice, setEditPrice] = useState('')

  const load = async (q = query) => {
    const res = await searchProducts(q)
    setProducts(res)
  }

  useEffect(() => { load() }, [])

  const handleSearch = (v) => { setQuery(v); load(v) }

  const handleScan = (code) => {
    setShowScanner(false)
    handleSearch(code)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا المنتج؟')) return
    await deleteProduct(id)
    load()
  }

  const savePrice = async (id) => {
    if (!editPrice || isNaN(editPrice)) return
    await updateProduct(id, { price: parseFloat(editPrice) })
    setEditingId(null)
    load()
  }

  const applyBulk = async () => {
    if (!bulkPercent || selected.length === 0) return
    const factor = bulkDir === 'up'
      ? 1 + parseFloat(bulkPercent) / 100
      : 1 - parseFloat(bulkPercent) / 100
    await bulkUpdatePrices(selected, factor)
    setSelected([])
    setBulkMode(false)
    setBulkPercent('')
    load()
  }

  const toggleSelect = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const typeLabel = (t) => ({ barcode: '📦', manual: '🏷️', weight: '⚖️' }[t] || '📦')
  const unitLabel = (u) => ({ kg: '/كغ', '100g': '/100غ', g: '/غ' }[u] || '')

  return (
    <div className="min-h-screen bg-herb-50">
      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} title="بحث بالباركود" />
      )}

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">المنتجات</h1>
          <button
            onClick={() => navigate('/add-product')}
            className="bg-white/20 px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1"
          >
            <span className="text-lg">+</span> إضافة
          </button>
        </div>
        {/* شريط البحث */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="بحث بالاسم أو الباركود..."
              className="w-full bg-white/20 text-white placeholder-white/60 rounded-xl px-4 py-2.5 text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="bg-white/20 p-2.5 rounded-xl"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
          <button
            onClick={() => { setBulkMode(b => !b); setSelected([]) }}
            className={`p-2.5 rounded-xl ${bulkMode ? 'bg-white text-herb-700' : 'bg-white/20'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bulk edit bar */}
      {bulkMode && selected.length > 0 && (
        <div className="bg-herb-700 text-white px-4 py-3 flex items-center gap-2">
          <span className="text-sm flex-1">تعديل {selected.length} منتج</span>
          <select
            value={bulkDir}
            onChange={e => setBulkDir(e.target.value)}
            className="bg-white/20 text-white text-sm rounded-lg px-2 py-1 outline-none"
          >
            <option value="up">زيادة %</option>
            <option value="down">تخفيض %</option>
          </select>
          <input
            type="number"
            value={bulkPercent}
            onChange={e => setBulkPercent(e.target.value)}
            placeholder="%"
            className="w-16 bg-white/20 text-white placeholder-white/60 text-sm rounded-lg px-2 py-1 outline-none"
          />
          <button onClick={applyBulk} className="bg-white text-herb-700 text-sm px-3 py-1 rounded-lg font-medium">
            تطبيق
          </button>
        </div>
      )}

      {/* القائمة */}
      <div className="p-4 pb-24 space-y-3 max-w-lg mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🌿</div>
            <p>لا توجد منتجات</p>
            <button onClick={() => navigate('/add-product')} className="mt-4 btn-primary">
              إضافة أول منتج
            </button>
          </div>
        ) : (
          products.map(p => (
            <div key={p.id} className={`card ${bulkMode && selected.includes(p.id) ? 'border-herb-400 bg-herb-50' : ''}`}>
              <div className="flex gap-3">
                {bulkMode && (
                  <button
                    onClick={() => toggleSelect(p.id)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                      selected.includes(p.id) ? 'bg-herb-500 border-herb-500 text-white' : 'border-gray-300'
                    }`}
                  >
                    {selected.includes(p.id) && '✓'}
                  </button>
                )}
                {p.image && (
                  <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs">{typeLabel(p.type)}</span>
                      <h3 className="font-semibold text-gray-800">{p.name}</h3>
                      {p.barcode && (
                        <p className="text-xs text-gray-400 font-mono">{p.barcode}</p>
                      )}
                    </div>
                    {/* السعر */}
                    {editingId === p.id ? (
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          className="w-20 border border-herb-400 rounded-lg px-2 py-1 text-sm outline-none"
                          autoFocus
                        />
                        <button onClick={() => savePrice(p.id)} className="bg-herb-500 text-white text-xs px-2 rounded-lg">✓</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-600 text-xs px-2 rounded-lg">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(p.id); setEditPrice(p.price) }}
                        className="text-herb-700 font-bold text-base whitespace-nowrap"
                      >
                        {p.price} د.ج{p.type === 'weight' ? unitLabel(p.priceUnit) : ''}
                      </button>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                  )}
                  {!bulkMode && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="text-xs text-herb-600 bg-herb-50 px-3 py-1 rounded-lg"
                      >
                        تفاصيل
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-lg"
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
