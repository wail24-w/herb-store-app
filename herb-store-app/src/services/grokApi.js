const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'

export function getApiKey() {
  return localStorage.getItem('grok_api_key') || ''
}

export function setApiKey(key) {
  localStorage.setItem('grok_api_key', key)
}

export async function generateProductDescription(productName) {
  const apiKey = getApiKey()
  if (!apiKey) return 'أضف مفتاح Grok API في الإعدادات لتوليد الوصف تلقائياً.'

  try {
    const res = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في الأعشاب الطبية والتوابل والمنتجات الغذائية الطبيعية. اكتب وصفاً مختصراً وعملياً باللغة العربية.'
          },
          {
            role: 'user',
            content: `اكتب وصفاً مختصراً (3-4 جمل) عن فوائد واستخدامات: ${productName}. اذكر الفوائد الصحية الرئيسية وطرق الاستخدام الشائعة فقط.`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `خطأ ${res.status}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || 'تعذّر توليد الوصف.'
  } catch (e) {
    console.error('Grok API error:', e)
    return `تعذّر الاتصال بـ Grok API: ${e.message}`
  }
}
