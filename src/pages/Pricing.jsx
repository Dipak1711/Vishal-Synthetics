import React, { useState } from 'react'
import { useStore, update, fmt, inr, rmRate, today } from '../store.js'
import { Page, Field, Tabs } from '../components/ui.jsx'

export default function Pricing() {
  const s = useStore(); const [tab, setTab] = useState('Raw Material Rates')
  const [rates, setRates] = useState({})
  const apply = () => update(st => { st.rawMaterials.forEach(r => { const v = +rates[r.id]; if (v && v !== r.rate) { r.prev = [...r.prev.slice(-5), r.rate]; r.rate = v } }) }) || setRates({})
  const cn = id => s.customers.find(c => c.id === id)?.name
  const base = rmRate(s)
  return <Page eyebrow="Finance" title="Pricing & Costing" sub="Weekly raw material rates, overheads, carrying interest and customer-wise price lists">
    <Tabs tabs={['Raw Material Rates', 'Customer Price List', 'Overheads & Interest']} v={tab} set={setTab} />
    {tab === 'Raw Material Rates' && <div className="card tw"><table><thead><tr><th>Material</th><th>Last week</th><th>Current ₹/kg</th><th>New rate</th><th>Change</th></tr></thead><tbody>
      {s.rawMaterials.map(r => { const last = r.prev[r.prev.length - 1]; const d = r.rate - last; return <tr key={r.id}><td>{r.name}</td><td>{inr(last)}</td><td><b>{inr(r.rate)}</b></td><td style={{ width: 130 }}><input type="number" value={rates[r.id] ?? ''} onChange={e => setRates({ ...rates, [r.id]: e.target.value })} placeholder={r.rate} /></td><td style={{ color: d >= 0 ? 'var(--red-fg)' : 'var(--primary-ink)' }}>{d >= 0 ? '+' : ''}{d}</td></tr> })}</tbody></table>
      <button className="btn" style={{ marginTop: 12 }} onClick={apply}>Update weekly rates</button><p className="sub" style={{ marginTop: 10 }}>Blended raw material cost: <b>{inr(base)}</b>/kg. Customer recommended prices move with this automatically.</p></div>}
    {tab === 'Customer Price List' && <div className="card tw"><table><thead><tr><th>Customer</th><th>Product</th><th>Usual qty</th><th>Last price</th><th>RM at sale</th><th>RM change</th><th>Recommended now</th></tr></thead><tbody>
      {s.priceList.map(p => { const d = base - p.rmAtSale; return <tr key={p.id}><td>{cn(p.customerId)}</td><td>{p.colour}</td><td>{fmt(p.qty, 0)} kg</td><td>{inr(p.lastPrice)}</td><td>{inr(p.rmAtSale)}</td><td style={{ color: d >= 0 ? 'var(--red-fg)' : 'var(--primary-ink)' }}>{d >= 0 ? '+' : ''}{fmt(d)}</td><td><b>{inr(p.lastPrice + d)}</b></td></tr> })}</tbody></table></div>}
    {tab === 'Overheads & Interest' && <div className="card" style={{ maxWidth: 560 }}><div className="fg"><Field cls="c12" label="Bank interest / carrying cost (% per year, simple)"><input type="number" value={s.settings.interestPct} onChange={e => update(st => { st.settings.interestPct = +e.target.value })} /></Field></div><div style={{ height: 14 }} />
      <div className="helper"><div className="ln"><span>Raw material</span><b>{inr(base)}</b></div><div className="ln"><span>Overheads (labour, power, packing)</span><b>₹14.00</b></div><div className="ln"><span>Original cost</span><b>{inr(base + 14)}</b></div>
        {[1, 3, 6].map(m => <div className="ln" key={m}><span>After {m} month(s) unsold</span><b>{inr((base + 14) * (1 + s.settings.interestPct / 1200 * m))}</b></div>)}</div></div>}
  </Page>
}
