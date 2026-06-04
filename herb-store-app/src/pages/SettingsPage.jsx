import { useState } from 'react'
import { getApiKey, setApiKey } from '../services/grokApi'
import { exportData, importData, autoBackup, restoreFromBackup } from '../db/database'

export default function SettingsPage() {
  const [apiKey, setApiKeyState] = useState(getApiKey())
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState('')

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const saveKey = () => {
    setApiKey(apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    importData(file)
      .then(() => showMsg('✅ تم الاستيراد بنجاح!'))
      .catch(() => showMsg('❌ خطأ في الاستيراد'))
  }

  const handleManualBackup = async () => {
    await autoBackup()
    showMsg('✅ تم حفظ النسخة الاحتياطية!')
  }

  const handleRestore = async () => {
    const count = await restoreFromBackup()
    if (count > 0) showMsg(`✅ تم استرجاع ${count} منتج!`)
    else showMsg('⚠️ لا توجد نسخة احتياطية محفوظة')
  }

  const backupTime = localStorage.getItem('herb_backup_time')
  const fmtTime = backupTime
    ? new Date(backupTime).toLocaleString('ar-DZ')
    : 'لا توجد نسخة بعد'

  return (
    <div className="min-h-screen bg-herb-50">
      <div className="page-header">
        <h1 className="text-lg font-bold">الإعدادات</h1>
      </div>

      {msg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-medium text-center">
          {msg}
        </div>
      )}

      <div className="p-4 pb-24 space-y-4">

        {/* Grok API */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">✨ مفتاح Grok API</h2>
          <p className="text-xs text-gray-500 mb-3">يُستخدم لتوليد وصف المنتجات تلقائياً. يُحفظ محلياً فقط.</p>
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
          <button onClick={saveKey} className={`mt-3 btn-primary w-full ${saved ? 'bg-green-500' : ''}`}>
            {saved ? '✓ تم الحفظ' : 'حفظ المفتاح'}
          </button>
        </div>

        {/* النسخ الاحتياطي التلقائي */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">🔄 النسخ الاحتياطي التلقائي</h2>
          <p className="text-xs text-gray-500 mb-1">يحفظ تلقائياً كل دقيقة وعند إغلاق التطبيق.</p>
          <p className="text-xs text-herb-600 mb-3">آخر نسخة: {fmtTime}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleManualBackup} className="btn-secondary text-sm py-2">
              💾 حفظ الآن
            </button>
            <button onClick={handleRestore} className="btn-secondary text-sm py-2">
              ♻️ استرجاع
            </button>
          </div>
        </div>

        {/* النسخ الاحتياطي كملف */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">📁 تصدير / استيراد ملف</h2>
          <div className="space-y-3">
            <button onClick={exportData} className="btn-secondary w-full">
              📤 تصدير كملف JSON
            </button>
            <label className="btn-secondary w-full cursor-pointer flex items-center justify-center gap-2">
              📥 استيراد من ملف
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            الملف يُحفظ في تنزيلات هاتفك
          </p>
        </div>

        <div className="card text-center text-gray-400 text-sm py-4">
          <div className="text-3xl mb-2">🌿</div>
          <p className="font-medium text-gray-600">متجر الأعشاب</p>
          <p className="text-xs mt-1">الإصدار 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
