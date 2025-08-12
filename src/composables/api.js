// src/composables/api.js
export async function get(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = `/api/${endpoint}${query ? '?' + query : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${endpoint} failed`)
  return await res.json()
}

export async function post(endpoint, body) {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`POST ${endpoint} failed`)
  return await res.json()
}
