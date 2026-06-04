import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

export default function BarcodeScanner({ onScan, onClose, title = 'مسح الباركود' }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)
  const lastScan = useRef('')
  const lastScanTime = useRef(0)

  const handleDecode = useCallback((result) => {
    if (!result) return
    const text = result.getText()
    const now = Date.now()
    if (text === lastScan.current && now - lastScanTime.current < 2000) return
    lastScan.current = text
    lastScanTime.current = now
    onScan(text)
  }, [onScan])

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) handleDecode(result)
      if (err && !(err instanceof NotFoundException)) {
        console.warn('Scanner:', err)
      }
    }).catch(e => {
      setError('تعذّر الوصول للكاميرا. تأكد من منح الإذن.')
      setScanning(false)
    })

    return () => {
      try { reader.reset() } catch {}
    }
  }, [handleDecode])

  return (
    <div className="scanner-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="text-white text-lg font-semibold mb-4">{title}</div>

      {error ? (
        <div className="bg-red-500/20 border border-red-400 text-white rounded-xl p-4 text-center max-w-xs">
          <div className="text-2xl mb-2">📷</div>
          <p>{error}</p>
          <button onClick={onClose} className="mt-3 bg-white/20 px-4 py-2 rounded-lg text-sm">
            إغلاق
          </button>
        </div>
      ) : (
        <>
          <div className="scanner-viewport">
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="scanner-frame" />
            <div className="scanner-line" />
          </div>
          <p className="text-white/70 text-sm mt-4 text-center">
            وجّه الكاميرا نحو الباركود أو QR Code
          </p>
        </>
      )}

      <button
        onClick={onClose}
        className="mt-6 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium transition-colors"
      >
        إلغاء
      </button>
    </div>
  )
}
