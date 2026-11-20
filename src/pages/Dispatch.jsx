import React, { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useStore, update, nextNo, today, fmt, inr } from '../store.js'
import { useToast } from '../toast.jsx'
import { Page, Field, Pill } from '../components/ui.jsx'

export default function Dispatch() {
  const s = useStore()
  const toast = useToast(); const [soId, setSoId] = useState(''); const [code, setCode] = useState(''); const [list, setList] = useState([])
  const [msg, setMsg] = useState(null); const [cam, setCam] = useState(false); const [done, setDone] = useState(null)
  const scanner = useRef(null)
  const so = s.salesOrders.find(o => o.id === soId)
  const total = list.reduce((a, r) => a + r.net, 0)
  const add = (c) => {
    c = c.trim().toUpperCase(); if (!c) return
    const r = s.rolls.find(x => x.id === c)
    if (!r) return setMsg({ t: 'r', m: 'Barcode not found: ' + c })
    if (r.status !== 'Available') return setMsg({ t: 'r', m: `${c} is already ${r.status} — cannot dispatch` })
    if (list.find(x => x.id === c)) return setMsg({ t: 'a', m: c + ' already scanned' })
    setList(l => [...l, r]); setMsg({ t: 'b', m: 'Added ' + c }); setCode('')
  }
  useEffect(() => {
    if (!cam) return
    const sc = new Html5Qrcode('reader'); scanner.current = sc
    sc.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 260, height: 120 } }, t => add(t), () => {}).catch(() => { setMsg({ t: 'a', m: 'Camera unavailable — type or pick the roll number instead' }); setCam(false) })
    return () => { sc.isScanning && sc.stop().then(() => sc.clear()).catch(() => {}) }
  }, [cam])
  const submit = () => {
    if (!so || !list.length) return
    let dl
    update(st => {
      const id = nextNo(st, 'dl', 'DL-')
      dl = { id, soId: so.id, customerId: so.customerId, date: today(), rolls: list.map(r => r.id), qty: +total.toFixed(2), rate: so.rate, uom: so.uom, status: 'Pending Invoice' }
      st.deliveries.push(dl)
      list.forEach(r => { st.rolls.find(x => x.id === r.id).status = 'Dispatched' })
      st.salesOrders.find(o => o.id === so.id).status = 'Closed'
      const col = so.colour; const h = st.history[so.customerId] || (st.history[so.customerId] = {}); h[col] = 0
    })
    setDone(dl); toast('Delivery slip ' + dl.id + ' created and sent to Accounts'); setList([]); setSoId('')
  }
  const avail = s.rolls.filter(r => r.status === 'Available' && (!so || r.colour === so.colour))
  return <Page eyebrow="Operations" title="Dispatch — Scan Rolls" sub="Scan each roll sticker with your phone camera to build the delivery slip">
    <div className="grid g2"><div className="card"><h3>Scan rolls</h3><div className="fg">
      <Field cls="c12" label="Customer order"><select value={soId} onChange={e => { setSoId(e.target.value); setList([]); setDone(null) }}><option value="">Select order…</option>{s.salesOrders.filter(o => o.status === 'Open').map(o => <option key={o.id} value={o.id}>{o.id} — {s.customers.find(c => c.id === o.customerId).name} — {o.qty} {o.uom} {o.colour}</option>)}</select></Field>
      {so && <div className="helper c12">Ordered <b>{so.qty} kg</b> {so.colour} {so.gsm} GSM · Scanned <b>{fmt(total)} kg</b> ({list.length} rolls)<div className="bar" style={{ marginTop: 8 }}><i style={{ width: Math.min(100, total / so.qty * 100) + '%' }} /></div></div>}
      <Field cls="c12" label="Roll barcode" hint="Press Enter to add. Order closes at actual dispatched weight — ± variation is accepted."><div className="igrp"><input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && add(code)} placeholder="VS-R-000001" /><button className="btn" onClick={() => add(code)}>Add</button><button className="btn sec" onClick={() => setCam(!cam)}>{cam ? 'Stop camera' : 'Scan with camera'}</button></div></Field>
    </div>
      {cam && <div id="reader" style={{ width: '100%', margin: '14px 0 0' }} />}
      {msg && <div className={'alert al-' + msg.t} style={{ marginTop: 14, marginBottom: 0 }}>{msg.m}</div>}
      {so && <><p className="sec-title" style={{ margin: '18px 0 8px' }}>Quick pick — available {so.colour} rolls</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{avail.slice(0, 12).map(r => <button key={r.id} className="btn sec sm" onClick={() => add(r.id)}>{r.id.slice(-4)} · {fmt(r.net, 1)}kg</button>)}</div></>}
    </div>
      <div className="card"><h3>Scanned rolls</h3><div className="tw"><table><thead><tr><th>Roll</th><th>Spec</th><th>Gross</th><th>Net</th><th></th></tr></thead><tbody>
        {list.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.colour} {r.gsm}GSM {r.width}"</td><td>{fmt(r.gross)}</td><td>{fmt(r.net)}</td><td><button className="btn sec sm" onClick={() => setList(list.filter(x => x.id !== r.id))}>✕</button></td></tr>)}
        {!list.length && <tr><td colSpan="5" style={{ color: 'var(--muted-fg)' }}>No rolls scanned yet</td></tr>}</tbody></table></div>
        <div className="net" style={{ marginTop: 12 }}>Total net weight<br /><b>{fmt(total)} kg</b></div>
        <button className="btn" style={{ width: '100%', marginTop: 12 }} disabled={!so || !list.length} onClick={submit}>Submit — Generate Delivery Slip</button>
        {done && <div className="alert al-b" style={{ marginTop: 12 }}>Delivery slip <b>{done.id}</b> created ({done.rolls.length} rolls, {fmt(done.qty)} kg) and sent to Accounts for invoicing.</div>}</div></div></Page>
}
