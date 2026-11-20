import { useSyncExternalStore } from 'react'
export const USERS = [
  { username: 'admin', password: 'admin123', name: 'Brijesh Patel', role: 'Admin', access: '*' },
  { username: 'accounts', password: 'accounts123', name: 'Meera Shah', role: 'Accountant', access: ['/', '/accounts', '/sales', '/customers', '/pricing', '/purchase'] },
  { username: 'dispatch', password: 'dispatch123', name: 'Ramesh Solanki', role: 'Dispatch Staff', access: ['/', '/dispatch', '/inventory'] },
  { username: 'production', password: 'production123', name: 'Vijay Parmar', role: 'Production Operator', access: ['/', '/production', '/weighing', '/cutting', '/inventory'] },
  { username: 'sales', password: 'sales123', name: 'Kiran Shah', role: 'Sales Rep', access: ['/', '/sales', '/crm', '/customers', '/pricing'] },
]
const KEY = 'vs_session'
let cur = null
try { cur = JSON.parse(localStorage.getItem(KEY)) } catch {}
const subs = new Set()
const emit = () => subs.forEach(f => f())
export const useSession = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f) }, () => cur)
export const login = (u, p) => {
  const x = USERS.find(y => y.username === u.trim().toLowerCase() && y.password === p)
  if (!x) return false
  cur = { username: x.username, name: x.name, role: x.role, access: x.access }
  try { localStorage.setItem(KEY, JSON.stringify(cur)) } catch {}
  emit(); return true
}
export const logout = () => { cur = null; try { localStorage.removeItem(KEY) } catch {}; emit() }
export const canAccess = (s, path) => !s ? false : s.access === '*' || s.access.some(a => a === path || (a !== '/' && path.startsWith(a + '/')))
