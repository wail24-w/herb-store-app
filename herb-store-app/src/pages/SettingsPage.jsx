import { useState } from 'react'
import { getApiKey, setApiKey } from '../services/grokApi'
import { exportData, importData } from '../db/database'

export default function SettingsPage() {
  const [apiKey, setApiKeyState] = useState(getApiKey())
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveKey = () => {
    setApiKey(apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    importData(file).then(() => alert('تم الاستيراد بنجاح!')).catch(() => alert('خطأ في الاستيراد'))
  }

  return (
    <div className="min-h-screen bg-herb-50">
      <div className="page-header">
        <h1 className="text-lg font-bold">الإعدادات</h1>
      </div>

      <div className="p-4 pb-24 w-full space-y-4">
        {/* Grok API */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
            ✨ مفتاح Grok API
          </h2>
          <p className="text-xs text-gray-500 mb-3">يُستخدم لتوليد وصف المنتجات تلقائياً. يُحفظ محلياً على جهازك فقط.</p>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKeyState(e.target.value)}
              placeholder="xai-..."
              className="input-field flex-1 font-mono text-sm"
            />
            <button onClick={() => setShowKey(s => !s)} className="bg-gray-100 px-3 rounded-xl text-gray-500">
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          <button
            onClick={saveKey}
            className={`mt-3 btn-primary w-full ${saved ? 'bg-green-500' : ''}`}
          >
            {saved ? '✓ تم الحفظ' : 'حفظ المفتاح'}
          </button>
        </div>

        {/* Backup */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">💾 النسخ الاحتياطي</h2>
          <div className="space-y-3">
            <button onClick={exportData} className="btn-secondary w-full">
              📤 تصدير البيانات (JSON)
            </button>
            <label className="btn-secondary w-full cursor-pointer flex items-center justify-center gap-2">
              📥 استيراد البيانات
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            يتم تصدير جميع المنتجات والمبيعات كملف JSON
          </p>
        </div>

        {/* Info */}
        <div className="card text-center text-gray-400 text-sm py-4">
          <div className="text-3xl mb-2">🌿</div>
          <p className="font-medium text-gray-600">متجر الأعشاب</p>
          <p className="text-xs mt-1">الإصدار 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
