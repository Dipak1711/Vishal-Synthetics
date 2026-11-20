import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useStore, update, nextNo, today, fmt, inr, recommended, currentCost, rmRate } from '../store.js'
import { useToast } from '../toast.jsx'
import { Page, Field } from '../components/ui.jsx'

export default function SalesNew() {
  const { type } = useParams(); const isQ = type !== 'order'
  const s = useStore(); const toast = useToast(); const navigate = useNavigate()
  const back = () => navigate('/sales' + (isQ ? '' : '?tab=orders'))
  const [f, setF] = useState({ type: isQ ? 'quotation' : 'order', customerId: s.customers[0]?.id, colour: 'White', quality: 'First', gsm: 80, width: 63, length: 1000, qty: 500, uom: 'kg', rate: '' })
  const [err, setErr] = useState({})
  const set = k => e => { setF({ ...f, [k]: e.target.value }); if (k === 'rate' || k === 'qty') setErr({}) }
  const match = s.rolls.filter(r => r.status === 'Available' && r.colour === f.colour)
  const orig = match.length ? match.reduce((a, r) => a + r.origCost, 0) / match.length : rmRate(s) + 14
  const cur = match.length ? match.reduce((a, r) => a + currentCost(r.origCost, r.date, s), 0) / match.length : orig
  const rec = recommended(s, f.customerId, f)
  const rate = +f.rate || 0
  const loss = rate > 0 && rate < cur
  const save = () => {
    const e = {}; if (!(rate > 0)) e.rate = 'Enter a selling rate'; if (!(+f.qty > 0)) e.qty = 'Quantity must be greater than 0'
    setErr(e); if (Object.keys(e).length) return toast('Please fix the highlighted fields', 'err')
    update(st => { const id = isQ ? nextNo(st, 'qt', 'QT-') : nextNo(st, 'so', 'SO-'); const d = { ...f, id, date: today(), rate, qty: +f.qty, gsm: +f.gsm, width: +f.width, length: +f.length, status: isQ ? 'Sent' : 'Open' }; (isQ ? st.quotations : st.salesOrders).push(d) })
    toast((isQ ? 'Quotation' : 'Sales order') + ' saved'); back()
  }
  return <Page title={'New ' + (isQ ? 'quotation' : 'sales order')} right={<button className="btn sec" onClick={back}><ArrowLeft size={16} />Back to list</button>}>
    <div className="mgrid">
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="fg">
          <div className="fsec">Customer</div>
          <Field cls="c12" label="Customer"><select value={f.customerId} onChange={set('customerId')}>{s.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <div className="fsec">Fabric specification</div>
          <Field cls="c3" label="Colour"><select value={f.colour} onChange={set('colour')}>{s.colours.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field cls="c3" label="Quality"><select value={f.quality} onChange={set('quality')}>{s.qualities.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field cls="c2" label="GSM"><input type="number" value={f.gsm} onChange={set('gsm')} /></Field>
          <Field cls="c2" label="Width (in)"><input type="number" value={f.width} onChange={set('width')} /></Field>
          <Field cls="c2" label="Length (m)"><input type="number" value={f.length} onChange={set('length')} /></Field>
          <div className="fsec">Quantity &amp; pricing</div>
          <Field cls="c4" label="Quantity" required error={err.qty}><input type="number" value={f.qty} onChange={set('qty')} /></Field>
          <Field cls="c4" label="Sell by"><select value={f.uom} onChange={set('uom')}><option value="kg">Kilogram</option><option value="meter">Meter</option><option value="roll">Fixed per roll</option></select></Field>
          <Field cls="c4" label={`Rate (₹/${f.uom})`} required error={err.rate}><input type="number" value={f.rate} onChange={set('rate')} placeholder={rec ? fmt(rec.rec, 0) : ''} /></Field>
          {loss && <div className="alert al-r c12" style={{ margin: 0 }}>Rate is below current product cost ({inr(cur)}) — this sale will be at a loss.</div>}
          <div className="fa"><span className="ftot">{rate > 0 && <>Total amount<b>{inr(rate * f.qty)}</b></>}</span><button className="btn sec" onClick={back}>Cancel</button><button className="btn" onClick={save}>Save {isQ ? 'quotation' : 'order'}</button></div>
        </div>
      </div>
      <div className="helper side-help"><h3 style={{ color: 'var(--foreground)' }}>Rate helper</h3>
        <div className="ln"><span>Original product cost</span><b>{inr(orig)}</b></div>
        <div className="ln"><span>Current cost (with interest)</span><b style={{ color: cur > orig ? 'var(--amb-fg)' : undefined }}>{inr(cur)}</b></div>
        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '8px 0' }} />
        {rec ? <><div className="ln"><span>Last price to this customer</span><b>{inr(rec.last)}</b></div><div className="ln"><span>Raw material change</span><b>{rec.delta >= 0 ? '+' : ''}{fmt(rec.delta)}</b></div><div className="ln"><span>Recommended price</span><span className="big">{inr(rec.rec)}</span></div>
          <button className="btn sec" style={{ width: '100%', marginTop: 12 }} onClick={() => setF({ ...f, rate: rec.rec })}>Use {inr(rec.rec)}</button></>
          : <p style={{ margin: 0 }}>No previous price for this customer. Suggested minimum: <b>{inr(cur * 1.08)}</b></p>}
      </div>
    </div></Page>
}
