import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/shared/BottomNav'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import AddProductPage from './pages/AddProductPage'
import SalesPage from './pages/SalesPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <div className="relative min-h-screen w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
