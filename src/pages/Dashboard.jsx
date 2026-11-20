import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Plus, TrendingUp, Wallet, Boxes, ClipboardList, ArrowRight, Truck, Bell } from 'lucide-react'
import { useStore, inr, fmt, today, daysBetween } from '../store.js'
import { alertsFor } from '../alerts.js'
import { Page } from '../components/ui.jsx'

const lakh = n => Math.abs(n) >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr' : Math.abs(n) >= 1e5 ? '₹' + (n / 1e5).toFixed(2) + ' L' : Math.abs(n) >= 1e3 ? '₹' + (n / 1e3).toFixed(1) + ' K' : '₹' + Math.round(n)
const axis = v => v >= 1e5 ? (v / 1e5) + 'L' : v >= 1e3 ? (v / 1e3) + 'K' : v
const FAB = { White: '#cbd5e1', Red: '#ef4444', Blue: '#3b82f6', Pink: '#f472b6', Green: '#22c55e' }
const tick = { fontSize: 12, fill: 'var(--muted-fg)' }
const RANGES = [['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 12 months']]
const REORDER = { RM1: 5000, RM2: 800, RM3: 600 }
const Dot = ({ c }) => <i className="cdot" style={{ background: c, boxShadow: c === '#cbd5e1' ? 'inset 0 0 0 1px #94a3b8' : 'none' }} />
const Tip = ({ active, payload, label }) => !active || !payload?.length ? null : <div className="ctip"><b>{label}</b>{payload.map((p, i) => <div key={i}><i style={{ background: p.color || p.fill }} />{p.name}<span>{inr(p.value)}</span></div>)}</div>
const Head = ({ title, sub, link, to, nav }) => <div className="dc-t"><div><h3>{title}</h3>{sub && <span>{sub}</span>}</div>{link && <button className="dc-link" onClick={() => nav(to)}>{link}<ArrowRight size={14} /></button>}</div>

export default function Dashboard({ greeting }) {
  const s = useStore(); const nav = useNavigate()
  const [range, setRange] = useState('30'); const span = +range; const t0 = today()
  const age = d => daysBetween(d, t0)
  const cn = id => s.customers.find(c => c.id === id)?.name || '—'
  const label = RANGES.find(r => r[0] === range)[1]

  const D = useMemo(() => {
    const sum = (a, f) => a.reduce((x, y) => x + f(y), 0)
    const inv = s.invoices.filter(i => age(i.date) < span), prev = s.invoices.filter(i => age(i.date) >= span && age(i.date) < 2 * span)
    const sales = sum(inv, i => i.amount), salesPrev = sum(prev, i => i.amount)
    const unpaid = s.invoices.filter(i => i.status !== 'Paid'), overdue = unpaid.filter(i => i.due < t0)
    const avail = s.rolls.filter(r => r.status === 'Available'), open = s.salesOrders.filter(o => o.status === 'Open')
    const mon = []; const now = new Date()
    for (let i = 5; i >= 0; i--) { const dt = new Date(now.getFullYear(), now.getMonth() - i, 1); mon.push({ key: dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'), name: dt.toLocaleString('en', { month: 'short' }), Sales: 0, Purchases: 0 }) }
    s.invoices.forEach(i => { const m = mon.find(x => x.key === i.date.slice(0, 7)); if (m) m.Sales += i.amount })
    s.purchases.forEach(p => { const m = mon.find(x => x.key === p.date.slice(0, 7)); if (m) m.Purchases += p.qty * p.rate })
    const col = s.colours.map(c => ({ name: c, sales: sum(inv.filter(i => i.colour === c), i => i.amount), stockKg: sum(avail.filter(r => r.colour === c), r => r.net), rolls: avail.filter(r => r.colour === c).length })).sort((a, b) => b.sales - a.sales)
    const tot = sum(col, c => c.sales) || 1, totKg = sum(col, c => c.stockKg) || 1
    col.forEach(c => { c.pct = c.sales / tot * 100; c.stockPct = c.stockKg / totKg * 100; c.slow = c.stockPct - c.pct > 10 })
    const due = [...unpaid].sort((a, b) => (a.due < b.due ? -1 : 1)).slice(0, 5)
    return { sales, growth: salesPrev ? (sales - salesPrev) / salesPrev * 100 : null, receivable: sum(unpaid, i => i.amount), overdueAmt: sum(overdue, i => i.amount), overdueN: overdue.length, stockKg: sum(avail, r => r.net), rolls: avail.length, open, openKg: sum(open, o => o.qty), mon, col, due }
  }, [s, range])

  const best = D.col[0]
  const heads = [
    ...D.col.filter(c => c.slow).map(c => ({ c: '#f59e0b', m: `${c.name} rolls are moving slowly — ${c.stockPct.toFixed(0)}% of stock but only ${c.pct.toFixed(0)}% of sales.` })),
    ...alertsFor(s).filter(a => /Low stock|not ordered/.test(a.msg)).map(a => ({ c: a.t === 'a' ? '#f59e0b' : '#0ea5e9', m: a.msg })),
  ].slice(0, 4)

  return <Page plain title="Dashboard"><div className="dclean">
    <div className="dc-head">
      <div><h1>{greeting || 'Welcome'}</h1><p>Here is how Vishal Synthetics is doing today.</p></div>
      <div className="dc-act"><select className="tsel" value={range} onChange={e => setRange(e.target.value)}>{RANGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select><button className="btn" onClick={() => nav('/sales/new/quotation')}><Plus size={16} />New quotation</button></div>
    </div>

    <div className="dc-stats">
      <div className="dc-stat"><span className="dc-ic g"><TrendingUp size={18} /></span><small>Sales</small><b>{lakh(D.sales)}</b>
        <p className={D.growth === null ? '' : D.growth >= 0 ? 'up' : 'down'}>{D.growth === null ? '—' : (D.growth >= 0 ? '↑ ' : '↓ ') + Math.abs(D.growth).toFixed(0) + '% vs the period before'}</p></div>
      <div className="dc-stat"><span className="dc-ic r"><Wallet size={18} /></span><small>Money to collect</small><b>{lakh(D.receivable)}</b>
        <p className={D.overdueN ? 'down' : 'up'}>{D.overdueN ? `${lakh(D.overdueAmt)} overdue (${D.overdueN} invoices)` : 'Nothing overdue'}</p></div>
      <div className="dc-stat"><span className="dc-ic b"><Boxes size={18} /></span><small>Stock ready to sell</small><b>{fmt(D.stockKg, 0)} kg</b><p>{D.rolls} rolls in stock</p></div>
      <div className="dc-stat"><span className="dc-ic a"><ClipboardList size={18} /></span><small>Orders to deliver</small><b>{D.open.length}</b><p>{fmt(D.openKg, 0)} kg waiting</p></div>
    </div>

    <div className="dc-grid">
      <div className="dc-card"><Head title="Sales and purchases" sub="Last 6 months" />
        <ResponsiveContainer width="100%" height={240}><BarChart data={D.mon} barGap={6} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} tickFormatter={axis} axisLine={false} tickLine={false} tickCount={5} /><Tooltip content={<Tip />} cursor={{ fill: 'var(--muted)', opacity: .6 }} />
          <Bar dataKey="Sales" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={26} /><Bar dataKey="Purchases" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={26} /></BarChart></ResponsiveContainer>
        <div className="dc-leg"><span><i style={{ background: 'var(--primary)' }} />Sales</span><span><i style={{ background: '#cbd5e1' }} />Purchases</span></div></div>
      <div className="dc-card"><Head title="Which colour sells" sub={label} />
        <ul className="dc-colors">{D.col.map(c => <li key={c.name}><Dot c={FAB[c.name]} /><b>{c.name}</b><div className="dc-bar"><em style={{ width: c.pct + '%', background: FAB[c.name] }} /></div><span>{c.pct.toFixed(0)}%</span></li>)}</ul>
        {best && best.sales > 0 && <p className="dc-note"><b>{best.name}</b> is your best seller — {lakh(best.sales)}.</p>}</div>
    </div>

    <div className="dc-grid even">
      <div className="dc-card"><Head title="Orders to deliver" link="Open dispatch" to="/dispatch" nav={nav} />
        <ul className="dc-rows">{D.open.map(o => <li key={o.id}><span className="rtile"><Truck size={16} /></span><div><b>{cn(o.customerId)}</b><small>{o.id} · {o.colour} {o.gsm} GSM · {o.qty} {o.uom}</small></div><button className="btn sec sm" onClick={() => nav('/dispatch')}>Dispatch</button></li>)}{!D.open.length && <li className="none">No orders waiting.</li>}</ul></div>
      <div className="dc-card"><Head title="Payments to collect" link="All invoices" to="/accounts" nav={nav} />
        <ul className="dc-rows">{D.due.map(i => { const n = age(i.due); return <li key={i.id}><span className={'rtile ' + (n > 0 ? 'red' : 'amb')}><Wallet size={16} /></span><div><b>{cn(i.customerId)}</b><small>{i.id} · {inr(i.amount)}</small></div><span className={'pill p-' + (n > 0 ? 'r' : 'a')}>{n > 0 ? `${n} days late` : n === 0 ? 'Due today' : `Due in ${-n} days`}</span></li> })}{!D.due.length && <li className="none">All payments received.</li>}</ul></div>
    </div>

    <div className="dc-grid three">
      <div className="dc-card"><Head title="Raw material" sub="Stock against reorder level" link="Purchase" to="/purchase" nav={nav} />
        <div className="dc-rm">{s.rawMaterials.map(r => { const lvl = REORDER[r.id], low = r.stock < lvl; return <div key={r.id}><div className="rmh"><b>{r.name.split(' (')[0]}</b><span className={'pill p-' + (low ? 'r' : 'g')}>{low ? 'Reorder' : 'OK'}</span></div><div className="bar"><i style={{ width: Math.min(100, r.stock / (lvl * 2) * 100) + '%', background: low ? 'var(--destructive)' : undefined }} /></div><small>{fmt(r.stock, 0)} kg</small></div> })}</div></div>
      <div className="dc-card"><Head title="Stock by colour" sub="Finished rolls ready to sell" link="Inventory" to="/inventory" nav={nav} />
        <ul className="dc-colors tight">{[...D.col].sort((a, b) => b.stockKg - a.stockKg).map(c => <li key={c.name}><Dot c={FAB[c.name]} /><b>{c.name}</b><div className="dc-bar"><em style={{ width: c.stockPct + '%', background: FAB[c.name] }} /></div><span className="kg">{fmt(c.stockKg, 0)} kg</span></li>)}</ul></div>
      <div className="dc-card"><Head title="Heads-up" sub="Things worth a look" />
        <ul className="dc-list">{heads.map((h, i) => <li key={i}><i style={{ background: h.c }} /><span>{h.m}</span></li>)}{!heads.length && <li><span style={{ color: 'var(--muted-fg)' }}>Nothing to worry about.</span></li>}</ul></div>
    </div>
  </div></Page>
}
