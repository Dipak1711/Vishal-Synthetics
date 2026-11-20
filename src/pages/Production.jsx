import React, { useState } from 'react'
import { useStore, update, nextNo, today, fmt } from '../store.js'
import { useToast } from '../toast.jsx'
import { Page, Field, Pill, Tabs } from '../components/ui.jsx'

export default function Production() {
  const s = useStore()
  const [tab, setTab] = useState('Production Orders')
  const [f, setF] = useState({ soId: '', colour: 'White', issued: 1050, recycled: 0 })
  const toast = useToast()
  const [closing, setClosing] = useState({})
  const openSO = s.salesOrders.filter(o => o.status === 'Open')
  const rec = { granules: 0.92, cmb: 0.05, g3: 0.03 }
  const scrapAvail = s.scrap.filter(x => x.colour === f.colour).reduce((a, x) => a + x.weight, 0)
  const issue = () => {
    const so = s.salesOrders.find(o => o.id === f.soId); if (!so) return toast('Select a sales order first', 'err')
    update(st => {
      const virgin = f.issued - f.recycled
      st.rawMaterials[0].stock -= virgin * rec.granules; st.rawMaterials[1].stock -= virgin * rec.cmb; st.rawMaterials[2].stock -= virgin * rec.g3
      let need = +f.recycled; st.scrap.filter(x => x.colour === f.colour).forEach(x => { const t = Math.min(x.weight, need); x.weight -= t; need -= t })
      st.scrap = st.scrap.filter(x => x.weight > 0)
      st.productions.push({ id: nextNo(st, 'prod', 'PRD-'), soId: so.id, customerId: so.customerId, ordered: so.qty, issued: +f.issued, recycled: +f.recycled, produced: 0, returned: 0, colour: so.colour, date: today(), status: 'In Production' })
    }); toast('BOM issued to production'); 
  }
  const complete = (p) => {
    const produced = +closing[p.id]; if (!produced) return toast('Enter the actual produced weight', 'err')
    update(st => {
      const x = st.productions.find(y => y.id === p.id); x.produced = produced; x.returned = Math.max(0, x.issued - produced); x.status = 'Completed'
      st.rawMaterials[0].stock += x.returned * rec.granules; st.rawMaterials[1].stock += x.returned * rec.cmb; st.rawMaterials[2].stock += x.returned * rec.g3
    }); toast('Order closed — unused raw material returned to stock')
  }
  return <Page eyebrow="Operations" title="Production & BOM" sub="Issue raw material per order, handle ± weight variation, recycle scrap">
    <Tabs tabs={['Production Orders', 'BOM Recipes']} v={tab} set={setTab} />
    {tab === 'BOM Recipes' && <div className="card tw"><table><thead><tr><th>Fabric</th><th>Granules</th><th>Colour MB</th><th>3G MB</th><th>Recycled scrap allowed</th></tr></thead><tbody>
      {s.colours.map(c => <tr key={c}><td><b>{c}</b></td><td>92%</td><td>{c === 'White' ? '5% (white)' : '5% (' + c.toLowerCase() + ')'}</td><td>3%</td><td>Up to 20%</td></tr>)}</tbody></table></div>}
    {tab === 'Production Orders' && <>
      <div className="card"><h3>Issue BOM</h3>
        <div className="fg">
          <Field cls="c6" label="Sales order"><select value={f.soId} onChange={e => { const o = s.salesOrders.find(x => x.id === e.target.value); setF({ ...f, soId: e.target.value, colour: o?.colour || f.colour, issued: o ? Math.round(o.qty * 1.05) : f.issued }) }}><option value="">Select order…</option>{openSO.map(o => <option key={o.id} value={o.id}>{o.id} — {s.customers.find(c => c.id === o.customerId).name} — {o.qty} kg {o.colour}</option>)}</select></Field>
          <Field cls="c3" label="BOM qty to issue (kg)"><input type="number" value={f.issued} onChange={e => setF({ ...f, issued: e.target.value })} /></Field>
          <Field cls="c3" label="Recycled scrap (kg)" hint={fmt(scrapAvail) + ' kg available'}><input type="number" max={scrapAvail} value={f.recycled} onChange={e => setF({ ...f, recycled: Math.min(scrapAvail, +e.target.value) })} /></Field>
          <div className="chips c12"><span>Granules <b>{fmt((f.issued - f.recycled) * rec.granules)} kg</b></span><span>Colour MB <b>{fmt((f.issued - f.recycled) * rec.cmb)} kg</b></span><span>3G MB <b>{fmt((f.issued - f.recycled) * rec.g3)} kg</b></span><span>Scrap <b>{f.recycled} kg</b></span></div>
          <div className="fa"><button className="btn" onClick={issue}>Issue BOM</button></div>
        </div></div>
      <div className="card tw"><table><thead><tr><th>Prod. No</th><th>Order</th><th>Ordered</th><th>BOM issued</th><th>Produced</th><th>Returned to stock</th><th>Status</th><th>Close order</th></tr></thead><tbody>
        {s.productions.slice().reverse().map(p => <tr key={p.id}><td>{p.id}</td><td>{p.soId}</td><td>{p.ordered} kg</td><td>{p.issued} kg</td><td>{p.produced || '—'}</td><td>{p.returned || '—'}</td><td><Pill s={p.status} /></td>
          <td>{p.status !== 'Completed' && <div className="row" style={{ flexWrap: 'nowrap' }}><input style={{ width: 90 }} type="number" placeholder="Actual kg" value={closing[p.id] || ''} onChange={e => setClosing({ ...closing, [p.id]: e.target.value })} /><button className="btn sm" onClick={() => complete(p)}>Close</button></div>}</td></tr>)}
        {s.productions.length === 0 && <tr><td colSpan="8" style={{ color: 'var(--muted-fg)' }}>No production orders yet. Issue a BOM above.</td></tr>}</tbody></table>
        <p className="sub" style={{ marginTop: 10 }}>Orders close cleanly at actual produced weight (e.g. 960 kg or 1,040 kg on a 1,000 kg order) — no false pending balance.</p></div></>}
  </Page>
}
