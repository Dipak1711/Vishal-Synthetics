import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
const Ctx = createContext(() => {})
export const useToast = () => useContext(Ctx)
export function ToastProvider({ children }) {
  const [list, setList] = useState([])
  const push = useCallback((msg, type = 'ok') => {
    const id = Math.random()
    setList(l => [...l, { id, msg, type }])
    setTimeout(() => setList(l => l.filter(x => x.id !== id)), 4000)
  }, [])
  const Icon = { ok: CheckCircle2, err: AlertCircle, info: Info }
  return <Ctx.Provider value={push}>{children}
    <div className="toasts">{list.map(t => { const I = Icon[t.type]; return <div key={t.id} className={'toast-i ti-' + t.type}><I size={18} /><span>{t.msg}</span><button onClick={() => setList(l => l.filter(x => x.id !== t.id))}><X size={14} /></button></div> })}</div></Ctx.Provider>
}
