import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BarcodeScanner from '../components/Scanner/BarcodeScanner'
import { addProduct } from '../db/database'
import { generateProductDescription } from '../services/grokApi'

const PRODUCT_TYPES = [
  { value: 'barcode', label: 'منتج بباركود', icon: '📦' },
  { value: 'manual', label: 'بدون باركود', icon: '🏷️' },
  { value: 'weight', label: 'يُباع بالوزن', icon: '⚖️' }
]

export default function AddProductPage() {
  const navigate = useNavigate()
  const [type, setType] = useState('barcode')
  const [showScanner, setShowScanner] = useState(false)
  const [form, setForm] = useState({
    barcode: '', name: '', price: '', priceUnit: 'kg', description: ''
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [grokLoading, setGrokLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleScan = (code) => {
    setForm(f => ({ ...f, barcode: code }))
    setShowScanner(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  const generateDesc = async () => {
    if (!form.name.trim()) return
    setGrokLoading(true)
    const desc = await generateProductDescription(form.name)
    setForm(f => ({ ...f, description: desc }))
    setGrokLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price) return
    setLoading(true)
    try {
      await addProduct({
        type,
        barcode: form.barcode || null,
        name: form.name.trim(),
        price: parseFloat(form.price),
        priceUnit: type === 'weight' ? form.priceUnit : null,
        description: form.description,
        image: image || null
      })
      setSaved(true)
      setTimeout(() => navigate('/products'), 1000)
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-herb-50">
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          title="مسح باركود المنتج"
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10 active:bg-white/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">إضافة منتج جديد</h1>
        </div>
      </div>

      <div className="p-4 pb-24 max-w-lg mx-auto">
        {/* نوع المنتج */}
        <div className="card mb-4">
          <p className="text-sm text-gray-500 mb-3">نوع المنتج</p>
          <div className="grid grid-cols-3 gap-2">
            {PRODUCT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  type === t.value
                    ? 'border-herb-500 bg-herb-50 text-herb-700'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className="text-xs font-medium">{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* باركود */}
          {type === 'barcode' && (
            <div className="card">
              <label className="text-sm font-medium text-gray-700 block mb-2">الباركود / QR Code</label>
              <div className="flex gap-2">
                <input
                  value={form.barcode}
                  readOnly
                  placeholder="اضغط مسح للقراءة..."
                  className="input-field flex-1 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="btn-primary px-4 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  مسح
                </button>
              </div>
            </div>
          )}

          {/* اسم المنتج */}
          <div className="card">
            <label className="text-sm font-medium text-gray-700 block mb-2">اسم المنتج *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="مثال: زعتر، كركم، حبة البركة..."
              className="input-field"
              required
            />
          </div>

          {/* السعر */}
          <div className="card">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {type === 'weight' ? 'سعر الكيلوغرام / الغرام' : 'السعر'} *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                className="input-field flex-1"
                required
              />
              {type === 'weight' && (
                <select
                  value={form.priceUnit}
                  onChange={e => setForm(f => ({ ...f, priceUnit: e.target.value }))}
                  className="input-field w-28"
                >
                  <option value="kg">/ كغ</option>
                  <option value="100g">/ 100غ</option>
                  <option value="g">/ غ</option>
                </select>
              )}
            </div>
          </div>

          {/* الوصف */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">الوصف والفوائد</label>
              <button
                type="button"
                onClick={generateDesc}
                disabled={!form.name || grokLoading}
                className="text-xs bg-herb-100 text-herb-700 px-3 py-1 rounded-lg font-medium disabled:opacity-50 flex items-center gap-1"
              >
                {grokLoading ? (
                  <><span className="animate-spin">⟳</span> جارٍ التوليد...</>
                ) : (
                  <>✨ توليد تلقائي</>
                )}
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="وصف مختصر عن فوائد المنتج واستخداماته..."
              className="input-field min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          {/* الصورة */}
          <div className="card">
            <label className="text-sm font-medium text-gray-700 block mb-2">الصورة (اختياري)</label>
            {image ? (
              <div className="relative">
                <img src={image} alt="صورة المنتج" className="w-full h-48 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-herb-300 rounded-xl cursor-pointer bg-herb-50 hover:bg-herb-100 transition-colors">
                <span className="text-3xl">📷</span>
                <span className="text-sm text-herb-600 mt-1">اختر صورة أو التقط</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* زر الحفظ */}
          <button
            type="submit"
            disabled={loading || saved}
            className={`btn-primary w-full py-4 text-base ${saved ? 'bg-green-500' : ''}`}
          >
            {saved ? '✓ تم الحفظ بنجاح!' : loading ? 'جارٍ الحفظ...' : 'حفظ المنتج'}
          </button>
        </form>
      </div>
    </div>
  )
}
