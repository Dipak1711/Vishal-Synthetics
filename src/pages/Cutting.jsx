import React, { useState } from 'react'
import { useStore, update, nextNo, today, fmt } from '../store.js'
import { useToast } from '../toast.jsx'
import { Page, Field } from '../components/ui.jsx'
import { Sticker } from '../components/Barcode.jsx'

export default function Cutting() {
  const s = useStore()
  const [id, setId] = useState(''); const [by, setBy] = useState('Length'); const [cut, setCut] = useState(700); const [scrap, setScrap] = useState(false)
  const toast = useToast(); const [res, setRes] = useState(null); const [err, setErr] = useState('')
  const avail = s.rolls.filter(r => r.status === 'Available')
  const p = s.rolls.find(r => r.id === id)
  const total = p ? (by === 'Length' ? p.length : p.width) : 0
  const rest = total - cut
  const go = () => {
    setErr('')
    if (!p) return setErr('Select a roll'); if (p.status !== 'Available') return setErr('This roll is already used')
    if (cut <= 0 || cut >= total) return setErr('Cut size must be between 0 and ' + total)
    let kids
    update(st => {
      const par = st.rolls.find(r => r.id === p.id); par.status = 'Used'
      const mk = (size, note) => { const ratio = size / total; const base = { ...par, id: nextNo(st, 'roll', 'VS-R-', 6), parent: par.id, date: par.date, status: 'Available' }
        if (by === 'Length') base.length = size; else base.width = size
        base.gross = +(par.gross * ratio).toFixed(2); base.net = +(par.net * ratio).toFixed(2); base.tare = +(base.gross - base.net).toFixed(2); return base }
      const a = mk(cut), b = mk(rest)
      st.rolls.push(a)
      if (scrap) { st.scrap.push({ id: nextNo(st, 'scrap', 'SC', 3), date: today(), weight: b.net, colour: par.colour, source: 'Slitting offcut of ' + par.id }) } else st.rolls.push(b)
      kids = scrap ? [a] : [a, b]
    })
    setRes(kids); toast('Roll cut — ' + kids.length + ' new barcode(s) generated'); setId('')
  }
  return <Page eyebrow="Operations" title="Roll Cutting & Slitting" sub="Cut a stock roll by length or width. The parent barcode is retired and fresh barcodes are issued.">
    <div className="grid g2"><div className="card"><h3>Cut a roll</h3>
      <div className="fg">
        <Field cls="c12" label="Parent roll (scan or select)"><select value={id} onChange={e => setId(e.target.value)}><option value="">Select roll…</option>{avail.map(r => <option key={r.id} value={r.id}>{r.id} — {r.colour} {r.gsm}GSM {r.width}"×{r.length}m</option>)}</select></Field>
        {p && <div className="helper c12">Parent <b>{p.id}</b> · {p.width}" × {p.length} m · {fmt(p.net)} kg &nbsp;<span className="pill p-g">Available</span> → <span className="pill p-a">Used</span></div>}
        <div className="fsec">Cut details</div>
        <Field cls="c4" label="Cut by"><select value={by} onChange={e => { setBy(e.target.value); setCut(e.target.value === 'Length' ? 700 : 80) }}><option>Length</option><option>Width</option></select></Field>
        <Field cls="c4" label={`Piece 1 — dispatch (${by === 'Length' ? 'm' : 'inch'})`}><input type="number" value={cut} onChange={e => setCut(+e.target.value)} /></Field>
        <Field cls="c4" label={`Piece 2 — remaining (${by === 'Length' ? 'm' : 'inch'})`}><input readOnly value={p ? rest : ''} placeholder="Select a roll" /></Field>
        <Field cls="c12" label="Piece 2 handling"><label className="chk"><input type="checkbox" checked={scrap} onChange={e => setScrap(e.target.checked)} />Unusable — move to Scrap / Recycle</label></Field>
        {err && <div className="alert al-r c12" style={{ margin: 0 }}>{err}</div>}
        <div className="fa"><button className="btn" onClick={go}>Cut roll & generate barcodes</button></div>
      </div></div>
      <div className="card"><h3>Result</h3>{res ? <div style={{ display: 'grid', gap: 12 }}>{res.map(r => <Sticker key={r.id} roll={r} />)}</div> : <p className="sub">New child roll stickers will appear here.</p>}</div></div></Page>
}
