import React, { useState } from 'react'
import { useStore, update, nextNo, today, fmt } from '../store.js'
import { useToast } from '../toast.jsx'
import { Page, Field } from '../components/ui.jsx'
import { Sticker } from '../components/Barcode.jsx'

export default function Weighing() {
  const s = useStore()
  const [f, setF] = useState({ colour: 'White', quality: 'First', gsm: 80, width: 63, length: 1000, gross: '', tare: s.settings.tareDefault, manual: false })
  const [last, setLast] = useState(null)
  const [scale, setScale] = useState('Connected'); const toast = useToast(); const [err, setErr] = useState('')
  const net = f.gross ? Math.max(0, +f.gross - +f.tare) : 0
  const read = () => { if (scale !== 'Connected') return; setF({ ...f, gross: +(48 + Math.random() * 6).toFixed(2) }) }
  const gen = () => {
    if (!f.gross || +f.gross <= +f.tare) { const m = !f.gross ? 'Capture the gross weight first' : 'Gross weight must be more than the tare weight'; setErr(m); return toast(m, 'err') }
    setErr('')
    let roll
    update(st => {
      const id = nextNo(st, 'roll', 'VS-R-', 6)
      roll = { id, colour: f.colour, quality: f.quality, gsm: +f.gsm, width: +f.width, length: +f.length, gross: +f.gross, tare: +f.tare, net: +(f.gross - f.tare).toFixed(2), date: today(), origCost: +(st.rawMaterials.reduce((a, r) => a + r.rate * r.mix, 0) + 14).toFixed(2), status: 'Available', parent: null }
      st.rolls.push(roll)
    })
    setLast(roll); toast('Roll ' + roll.id + ' created — sticker ready to print'); setF({ ...f, gross: '' })
  }
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return <Page eyebrow="Operations" title="Weighing & Barcode" sub="Roll goes on the scale → gross weight is captured → net weight is calculated → sticker is printed"
    right={<div className="row" style={{ alignItems: 'center' }}><span className={'pill ' + (scale === 'Connected' ? 'p-g' : 'p-r')}>Scale: {scale}</span><button className="btn sec sm" onClick={() => { setScale(scale === 'Connected' ? 'Offline' : 'Connected'); setF({ ...f, manual: scale === 'Connected' }) }}>Toggle scale</button></div>}>
    <div className="grid g2">
      <div className="card"><h3>Roll details</h3>
        <div className="fg">
          <div className="fsec">Specification</div>
          <Field cls="c6" label="Colour"><select value={f.colour} onChange={set('colour')}>{s.colours.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field cls="c6" label="Quality"><select value={f.quality} onChange={set('quality')}>{s.qualities.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field cls="c4" label="GSM"><input type="number" value={f.gsm} onChange={set('gsm')} /></Field>
          <Field cls="c4" label="Width (inch)"><input type="number" value={f.width} onChange={set('width')} /></Field>
          <Field cls="c4" label="Length (m)"><input type="number" value={f.length} onChange={set('length')} /></Field>
          <div className="fsec">Weight</div>
          <Field cls="c4" label="Gross weight (kg)" required error={err} hint={f.manual ? 'Manual entry' : 'Auto-fetched from scale'}><input type="number" step="0.01" readOnly={!f.manual} value={f.gross} onChange={set('gross')} placeholder={f.manual ? 'Type weight' : 'Waiting for scale…'} /></Field>
          <Field cls="c4" label="Tare / paper core"><select value={f.tare} onChange={set('tare')}>{[0.5, 0.6, 1, 2].map(t => <option key={t} value={t}>{t} kg</option>)}</select></Field>
          <Field cls="c4" label="Entry mode"><label className="chk"><input type="checkbox" checked={f.manual} onChange={e => setF({ ...f, manual: e.target.checked })} />Manual entry</label></Field>
          <div className="net c12">Net weight = Gross − Tare<br /><b>{fmt(net)} kg</b></div>
          <div className="fa"><button className="btn sec" disabled={f.manual} onClick={read}>Read from scale</button><button className="btn" onClick={gen}>Generate & Print Barcode Sticker</button></div>
        </div></div>
      <div className="card"><h3>Sticker preview</h3>{last ? <><Sticker roll={last} /><button className="btn sec" style={{ marginTop: 12 }} onClick={() => window.print()}>Print sticker</button></> : <p className="sub">Weigh a roll and generate to see the sticker here.</p>}
        <h3 style={{ marginTop: 20 }}>Recently weighed</h3><div className="tw"><table><thead><tr><th>Roll</th><th>Colour</th><th>Net</th></tr></thead><tbody>{s.rolls.slice(-5).reverse().map(r => <tr key={r.id}><td>{r.id}</td><td>{r.colour}</td><td>{fmt(r.net)} kg</td></tr>)}</tbody></table></div></div>
    </div></Page>
}
