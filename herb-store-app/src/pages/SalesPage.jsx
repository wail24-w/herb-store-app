import { useState, useRef, useEffect } from 'react'
import BarcodeScanner from '../components/Scanner/BarcodeScanner'
import { getProductByBarcode, searchProducts, saveSale } from '../db/database'

export default function SalesPage() {
  const [cart, setCart] = useState([])
  const [showScanner, setShowScanner] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [weightModal, setWeightModal] = useState(null) // product needing weight
  const [weightInput, setWeightInput] = useState('')
  const [flash, setFlash] = useState(null) // scanned product name flash
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const searchRef = useRef(null)

  const total = cart.reduce((s, i) => s + i.subtotal, 0)

  // Flash feedback after scan
  const showFlash = (name) => {
    setFlash(name)
    setTimeout(() => setFlash(null), 1500)
  }

  const addToCart = (product, weight = null) => {
    if (product.type === 'weight' && weight === null) {
      setWeightModal(product)
      return
    }

    const price = product.price
    const qty = 1
    const subtotal = product.type === 'weight'
      ? parseFloat((price * weight).toFixed(2))
      : price * qty

    const existing = cart.findIndex(i => i.productId === product.id && product.type !== 'weight')
    if (existing >= 0 && product.type !== 'weight') {
      setCart(c => c.map((item, idx) =>
        idx === existing
          ? { ...item, quantity: item.quantity + 1, subtotal: item.subtotal + price }
          : item
      ))
    } else {
      setCart(c => [...c, {
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price,
        quantity: qty,
        weight: weight,
        subtotal,
        image: product.image || null,
        type: product.type
      }])
    }
    showFlash(product.name)
  }

  const handleScan = async (code) => {
    setShowScanner(false)
    const product = await getProductByBarcode(code)
    if (!product) {
      setFlash('❌ المنتج غير موجود')
      setTimeout(() => setFlash(null), 2000)
      return
    }
    addToCart(product)
  }

  const handleWeightConfirm = () => {
    const w = parseFloat(weightInput)
    if (!w || w <= 0) return
    addToCart(weightModal, w)
    setWeightModal(null)
    setWeightInput('')
  }

  const updateQty = (id, delta) => {
    setCart(c => c.map(item => {
      if (item.id !== id) return item
      const newQty = item.quantity + delta
      if (newQty <= 0) return null
      return { ...item, quantity: newQty, subtotal: parseFloat((item.price * newQty).toFixed(2)) }
    }).filter(Boolean))
  }

  const removeItem = (id) => setCart(c => c.filter(i => i.id !== id))
  const clearCart = () => { if (confirm('إفراغ السلة؟')) setCart([]) }

  const handleSearch = async (v) => {
    setSearchQuery(v)
    if (v.trim().length < 1) { setSearchResults([]); return }
    const res = await searchProducts(v)
    setSearchResults(res.slice(0, 8))
  }

  const handleSale = async () => {
    if (cart.length === 0) return
    setSaving(true)
    try {
      await saveSale(cart, total)
      setDone(true)
      setTimeout(() => { setCart([]); setDone(false) }, 1500)
    } catch { alert('خطأ أثناء حفظ الفاتورة') }
    finally { setSaving(false) }
  }

  const unitLabel = (u) => ({ kg: 'كغ', '100g': '100غ', g: 'غ' }[u] || 'كغ')

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Scanner */}
      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} title="مسح منتج للبيع" />
      )}

      {/* Weight modal */}
      {weightModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-gray-800">
            <h3 className="font-bold text-lg mb-1">⚖️ {weightModal.name}</h3>
            <p className="text-sm text-gray-500 mb-4">
              السعر: {weightModal.price} د.ج / {unitLabel(weightModal.priceUnit)}
            </p>
            <label className="text-sm font-medium block mb-2">أدخل الوزن ({unitLabel(weightModal.priceUnit)})</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder="0.000"
              className="input-field text-xl text-center mb-4"
              autoFocus
            />
            {weightInput && (
              <p className="text-center text-herb-600 font-bold mb-4">
                المجموع: {(weightModal.price * parseFloat(weightInput || 0)).toFixed(2)} د.ج
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setWeightModal(null); setWeightInput('') }} className="btn-secondary flex-1">إلغاء</button>
              <button onClick={handleWeightConfirm} className="btn-primary flex-1 bg-herb-600">إضافة</button>
            </div>
          </div>
        </div>
      )}

      {/* Flash feedback */}
      {flash && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-herb-500 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-medium slide-up max-w-[90vw] text-center">
          {flash}
        </div>
      )}

      {/* Header POS */}
      <div className="bg-gray-800 px-4 pt-safe-top pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">🛒 نقطة البيع</h1>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowSearch(s => !s); setSearchResults([]); setSearchQuery('') }}
              className="bg-gray-700 p-2.5 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button onClick={() => setShowScanner(true)} className="bg-herb-600 p-2.5 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="mt-3 relative">
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="ابحث عن منتج للإضافة..."
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none"
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 right-0 left-0 bg-gray-700 rounded-xl overflow-hidden z-10 shadow-xl">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { addToCart(p); setSearchResults([]); setSearchQuery('') }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-600 active:bg-gray-600 border-b border-gray-600/50 last:border-0 text-right"
                  >
                    {p.image && <img src={p.image} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{p.name}</div>
                      <div className="text-xs text-herb-400">{p.price} د.ج{p.type === 'weight' ? `/${unitLabel(p.priceUnit)}` : ''}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-5xl mb-3">📷</div>
            <p className="text-sm">امسح باركود لإضافة منتج</p>
            <button onClick={() => setShowScanner(true)} className="mt-4 btn-primary bg-herb-600">
              ابدأ المسح
            </button>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3 slide-up">
              {item.image && <img src={item.image} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="text-xs text-gray-400">
                  {item.type === 'weight'
                    ? `${item.weight} ${unitLabel(item.type)} × ${item.price}`
                    : `${item.price} × ${item.quantity}`}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.type !== 'weight' && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-gray-700 rounded-lg text-lg flex items-center justify-center">−</button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-gray-700 rounded-lg text-lg flex items-center justify-center">+</button>
                  </div>
                )}
                <div className="text-herb-400 font-bold text-sm w-16 text-left">{item.subtotal} د.ج</div>
                <button onClick={() => removeItem(item.id)} className="text-red-400 text-lg w-6">×</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: total + actions */}
      {cart.length > 0 && (
        <div className="bg-gray-800 border-t border-gray-700 p-4 pb-safe">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">{cart.length} منتج</span>
            <div className="text-2xl font-bold text-herb-400">{total.toFixed(2)} <span className="text-base">د.ج</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={clearCart} className="btn-secondary flex-shrink-0 bg-gray-700 border-gray-600 text-gray-300">
              إفراغ
            </button>
            <button
              onClick={handleSale}
              disabled={saving || done}
              className={`btn-primary flex-1 py-3 text-base ${done ? 'bg-green-500' : 'bg-herb-600'}`}
            >
              {done ? '✓ تم الحفظ!' : saving ? 'جارٍ...' : `تأكيد البيع • ${total.toFixed(2)} د.ج`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
