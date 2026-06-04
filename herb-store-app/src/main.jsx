import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { autoBackup } from './db/database.js'

// نسخ احتياطي كل 60 ثانية
setInterval(autoBackup, 60000)

// نسخ احتياطي عند إغلاق التطبيق
window.addEventListener('beforeunload', autoBackup)
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') autoBackup()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
