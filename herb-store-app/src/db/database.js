import Dexie from 'dexie'

export const db = new Dexie('HerbStoreDB')

db.version(1).stores({
  products: '++id, barcode, name, type, createdAt',
  sales: '++id, createdAt',
  saleItems: '++id, saleId, productId'
})

// ─── Products ────────────────────────────────────────────────────────────────

export async function addProduct(product) {
  return await db.products.add({
    ...product,
    createdAt: new Date().toISOString()
  })
}

export async function updateProduct(id, changes) {
  return await db.products.update(id, changes)
}

export async function deleteProduct(id) {
  return await db.products.delete(id)
}

export async function getProductByBarcode(barcode) {
  return await db.products.where('barcode').equals(barcode).first()
}

export async function searchProducts(query) {
  if (!query) return await db.products.toArray()
  const q = query.toLowerCase()
  return await db.products
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
    )
    .toArray()
}

export async function getAllProducts() {
  return await db.products.toArray()
}

export async function bulkUpdatePrices(ids, factor) {
  // factor > 1 = increase, < 1 = decrease
  const products = await db.products.where('id').anyOf(ids).toArray()
  const updates = products.map(p => ({
    key: p.id,
    changes: { price: parseFloat((p.price * factor).toFixed(2)) }
  }))
  await Promise.all(updates.map(u => db.products.update(u.key, u.changes)))
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function saveSale(items, total) {
  const saleId = await db.sales.add({
    total,
    itemCount: items.length,
    createdAt: new Date().toISOString()
  })
  await db.saleItems.bulkAdd(
    items.map(item => ({
      saleId,
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      weight: item.weight || null,
      subtotal: item.subtotal
    }))
  )
  return saleId
}

export async function getSalesStats() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const allSales = await db.sales.toArray()
  const todaySales = allSales.filter(s => s.createdAt >= todayStart)
  const monthSales = allSales.filter(s => s.createdAt >= monthStart)
  const productsCount = await db.products.count()

  return {
    productsCount,
    totalSalesCount: allSales.length,
    todayTotal: todaySales.reduce((s, x) => s + x.total, 0),
    todayCount: todaySales.length,
    monthTotal: monthSales.reduce((s, x) => s + x.total, 0),
    monthCount: monthSales.length
  }
}

export async function getRecentSales(limit = 20) {
  return await db.sales.orderBy('createdAt').reverse().limit(limit).toArray()
}

// ─── Backup / Restore ─────────────────────────────────────────────────────────

export async function exportData() {
  const products = await db.products.toArray()
  const sales = await db.sales.toArray()
  const saleItems = await db.saleItems.toArray()
  const json = JSON.stringify({ products, sales, saleItems, exportedAt: new Date().toISOString() }, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `herb-store-backup-${new Date().toLocaleDateString('ar')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  await db.transaction('rw', db.products, db.sales, db.saleItems, async () => {
    if (data.products) await db.products.bulkPut(data.products)
    if (data.sales) await db.sales.bulkPut(data.sales)
    if (data.saleItems) await db.saleItems.bulkPut(data.saleItems)
  })
}
