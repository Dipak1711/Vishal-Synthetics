import { useSyncExternalStore } from 'react'
import { seed } from './seed.js'

const KEY = 'vs_erp_v8'
let state
try { state = JSON.parse(localStorage.getItem(KEY)) } catch { state = null }
if (!state || !Array.isArray(state.invoices) || !state.settings) state = seed()
const subs = new Set()
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }
export const getState = () => state
export const update = (fn) => { const next = structuredClone(state); fn(next); state = next; save(); subs.forEach(s => s()) }
export const useStore = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f) }, getState)
export const resetData = () => { state = seed(); save(); subs.forEach(s => s()) }

export const uid = (p) => p + Math.random().toString(36).slice(2, 8).toUpperCase()
export const nextNo = (s, key, prefix, pad = 4) => { s.counters[key] = (s.counters[key] || 0) + 1; return prefix + String(s.counters[key]).padStart(pad, '0') }
export const fmt = (n, d = 2) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d })
export const inr = (n) => '₹' + fmt(n)
export const today = () => new Date().toISOString().slice(0, 10)
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10) }
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)
export const monthsOld = (d) => Math.max(0, daysBetween(d, today()) / 30)
export const currentCost = (orig, date, s) => orig * (1 + (s.settings.interestPct / 12 / 100) * monthsOld(date))
export const rmRate = (s) => s.rawMaterials.reduce((a, r) => a + r.rate * (r.mix || 0), 0)
export const recommended = (s, customerId, spec) => {
  const pl = s.priceList.find(p => p.customerId === customerId && (!spec || p.colour === spec.colour || p.colour === '*'))
  if (!pl) return null
  const delta = rmRate(s) - pl.rmAtSale
  return { last: pl.lastPrice, delta, rec: pl.lastPrice + delta }
}
