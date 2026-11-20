import React, { useState } from 'react'
import { useStore, update, nextNo, today, fmt, inr } from '../store.js'
import { useToast } from '../toast.jsx'
import { Page, Field, Pill, EmptyRow } from '../components/ui.jsx'

export default function Purchase() {
  const s = useStore(); const [f, setF] = useState({ supplier: '', material: 'RM1', qty: 1000, rate: '' }); const toast = useToast(); const [err, setErr] = useState({})
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const add = () => { const e = {}; if (!f.supplier.trim()) e.supplier = 'Supplier name is required'; if (!(+f.rate > 0)) e.rate = 'Enter a valid rate'; if (!(+f.qty > 0)) e.qty = 'Enter quantity'; setErr(e); if (Object.keys(e).length) return toast('Please fix the highlighted fields', 'err'); toast('Purchase order created'); update(st => { st.purchases.push({ id: nextNo(st, 'po', 'PO-'), ...f, qty: +f.qty, rate: +f.rate, date: today(), status: 'Ordered' }) }); setF({ ...f, supplier: '', rate: '' }) }
  const recv = p => { toast(p.id + ' received into stock'); update(st => { const x = st.purchases.find(y => y.id === p.id); x.status = 'Received'; const m = st.rawMaterials.find(r => r.id === x.material); m.stock += x.qty }) }
  return <Page eyebrow="Finance" title="Purchase & Procurement" sub="Order raw material and receive it into stock">
    <div className="card"><h3>New purchase order</h3><div className="fg">
      <Field cls="c4" label="Supplier" required error={err.supplier}><input value={f.supplier} onChange={e => { set('supplier')(e); setErr({}) }} placeholder="Supplier name" /></Field>
      <Field cls="c4" label="Material"><select value={f.material} onChange={set('material')}>{s.rawMaterials.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
      <Field cls="c2" label="Qty (kg)" required error={err.qty}><input type="number" value={f.qty} onChange={set('qty')} /></Field>
      <Field cls="c2" label="Rate (₹/kg)" required error={err.rate}><input type="number" value={f.rate} onChange={e => { set('rate')(e); setErr({}) }} /></Field>
      <div className="fa"><span className="ftot">{+f.qty > 0 && +f.rate > 0 && <>Order value<b>{inr(f.qty * f.rate)}</b></>}</span><button className="btn" onClick={add}>Create PO</button></div></div></div>
    <div className="card tw"><table><thead><tr><th>PO</th><th>Date</th><th>Supplier</th><th>Material</th><th>Qty</th><th>Rate</th><th>Value</th><th>Status</th><th></th></tr></thead><tbody>
      {s.purchases.slice().reverse().map(p => <tr key={p.id}><td><b>{p.id}</b></td><td>{p.date}</td><td>{p.supplier}</td><td>{s.rawMaterials.find(r => r.id === p.material).name}</td><td>{fmt(p.qty, 0)} kg</td><td>{inr(p.rate)}</td><td>{inr(p.qty * p.rate)}</td><td><Pill s={p.status} /></td><td>{p.status === 'Ordered' && <button className="btn sm" onClick={() => recv(p)}>Receive</button>}</td></tr>)}</tbody></table></div></Page>
}
