import React, { useEffect } from 'react'
import { X, Inbox, Search } from 'lucide-react'
export const Pill = ({ s }) => {
  const m = { Available: 'g', Paid: 'g', Dispatched: 'b', Used: 'a', Scrap: 'x', Open: 'b', Closed: 'g', Unpaid: 'a', Overdue: 'r', Sent: 'b', 'Deal Closed': 'g', Lost: 'r', 'Under Process': 'a', Allocated: 'b', Received: 'g', Ordered: 'a', Completed: 'g', 'In Production': 'a', 'Pending Invoice': 'a', Converted: 'g', Invoiced: 'g' }
  return <span className={'pill p-' + (m[s] || 'x')}>{s}</span>
}
const TONE = { info: 'blue', warn: 'amber', red: 'rose' }
export const Spark = ({ data }) => {
  const w = 120, h = 30, mx = Math.max(...data), mn = Math.min(...data), r = mx - mn || 1
  const pts = data.map((v, i) => [i / (data.length - 1) * w, h - 3 - (v - mn) / r * (h - 8)])
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><path d={d + ` L${w} ${h} L0 ${h} Z`} fill="currentColor" opacity=".12" /><path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>
}
export const Stat = ({ l, v, c, icon: Icon, tone, hint, spark }) => <div className={'card stat tone-' + (TONE[tone] || tone || 'green')}>{Icon && <div className="ic"><Icon size={20} /></div>}<div style={{ minWidth: 0 }}><div className="v" style={c ? { color: c } : undefined}>{v}</div><div className="l">{l}</div>{hint && <div className="hint">{hint}</div>}</div>{spark && <Spark data={spark} />}</div>
export const Page = ({ title, sub, children, right, eyebrow, plain }) => <div className="page">{!plain && <div className="phead"><div className="pcopy"><h1>{title}</h1></div>{right && <div className="pact">{right}</div>}</div>}{children}</div>
export const Field = ({ label, children, error, hint, required, cls = '' }) => <div className={'f ' + cls}><label>{label}{required && <span style={{ color: 'var(--destructive)' }}> *</span>}</label>{children}{error ? <p className="ferr">{error}</p> : hint ? <p className="fhint">{hint}</p> : null}</div>
export const Tabs = ({ tabs, v, set }) => <div className="tabs">{tabs.map(t => <button key={t} className={v === t ? 'on' : ''} onClick={() => set(t)}>{t}</button>)}</div>
export const SearchBox = ({ value, onChange, placeholder = 'Search…' }) => <div className="sbox"><Search size={16} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />{value && <button onClick={() => onChange('')}><X size={14} /></button>}</div>
export const EmptyRow = ({ cols, text = 'Nothing to show yet', hint = 'Adjust the search or add a new record.' }) => <tr><td colSpan={cols} style={{ padding: '40px 0' }}><div className="empty"><span><Inbox size={20} /></span><b>{text}</b><small>{hint}</small></div></td></tr>
export function Modal({ title, onClose, children, width = 560, footer }) {
  useEffect(() => { const h = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [])
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal" style={{ maxWidth: width }}>
    <div className="mh"><h3 style={{ margin: 0 }}>{title}</h3><button className="icon-btn" style={{ width: 34, height: 34 }} onClick={onClose}><X size={16} /></button></div>
    <div className="mb">{children}</div>{footer && <div className="mf">{footer}</div>}</div></div>
}
export const Confirm = ({ title, text, onYes, onNo, yes = 'Confirm', danger }) => <Modal title={title} onClose={onNo} width={420} footer={<><button className="btn sec" onClick={onNo}>Cancel</button><button className={'btn' + (danger ? ' red' : '')} onClick={onYes}>{yes}</button></>}><p style={{ margin: 0 }}>{text}</p></Modal>
