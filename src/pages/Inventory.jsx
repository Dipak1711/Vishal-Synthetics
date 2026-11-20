import React, { useState } from 'react'
import { useStore, fmt, inr, currentCost, monthsOld } from '../store.js'
import { Page, Pill, Tabs, EmptyRow } from '../components/ui.jsx'
import Barcode from '../components/Barcode.jsx'

export default function Inventory() {
  const s = useStore()
  const [tab, setTab] = useState('Finished Rolls')
  const [q, setQ] = useState(''); const [st, setSt] = useState('All'); const [col, setCol] = useState('All')
  const rolls = s.rolls.filter(r => (st === 'All' || r.status === st) && (col === 'All' || r.colour === col) && (r.id + r.colour + r.quality + r.gsm).toLowerCase().includes(q.toLowerCase()))
  return <Page eyebrow="Operations" title="Inventory" sub="Raw materials, finished fabric rolls and recycled scrap">
    <Tabs tabs={['Finished Rolls', 'Raw Material', 'Scrap / Waste']} v={tab} set={setTab} />
    {tab === 'Raw Material' && <div className="card tw"><table><thead><tr><th>Material</th><th>Stock (kg)</th><th>Current rate</th><th>Value</th><th>Level</th></tr></thead><tbody>
      {s.rawMaterials.map(r => <tr key={r.id}><td>{r.name}</td><td>{fmt(r.stock)}</td><td>{inr(r.rate)}/kg</td><td>{inr(r.stock * r.rate)}</td><td style={{ width: 160 }}><div className="bar"><i style={{ width: Math.min(100, r.stock / 200) + '%' }} /></div></td></tr>)}</tbody></table></div>}
    {tab === 'Scrap / Waste' && <div className="card tw"><table><thead><tr><th>Date</th><th>Colour</th><th>Weight (kg)</th><th>Source</th></tr></thead><tbody>
      {s.scrap.map(x => <tr key={x.id}><td>{x.date}</td><td>{x.colour}</td><td>{fmt(x.weight)}</td><td>{x.source}</td></tr>)}</tbody></table>
      <p className="sub" style={{ marginTop: 10 }}>Total recyclable: {fmt(s.scrap.reduce((a, x) => a + x.weight, 0))} kg — can be added into a new BOM of the same colour.</p></div>}
    {tab === 'Finished Rolls' && <div className="card">
      <div className="row" style={{ marginBottom: 12 }}><input placeholder="Search roll no, colour, quality, GSM…" value={q} onChange={e => setQ(e.target.value)} />
        <select value={st} onChange={e => setSt(e.target.value)}>{['All', 'Available', 'Used', 'Dispatched', 'Scrap'].map(x => <option key={x}>{x}</option>)}</select>
        <select value={col} onChange={e => setCol(e.target.value)}>{['All', ...s.colours].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="tw"><table><thead><tr><th>Roll No</th><th>Colour</th><th>Quality</th><th>GSM</th><th>Width</th><th>Length</th><th>Net (kg)</th><th>Age</th><th>Orig cost</th><th>Current cost</th><th>Status</th></tr></thead><tbody>
        {rolls.slice().reverse().map(r => <tr key={r.id}><td><b>{r.id}</b></td><td>{r.colour}</td><td>{r.quality}</td><td>{r.gsm}</td><td>{r.width}"</td><td>{r.length} m</td><td>{fmt(r.net)}</td><td>{fmt(monthsOld(r.date), 1)} mo</td><td>{inr(r.origCost)}</td><td>{inr(currentCost(r.origCost, r.date, s))}</td><td><Pill s={r.status} /></td></tr>)}{!rolls.length && <EmptyRow cols={11} text="No rolls match your filters" />}</tbody></table></div></div>}
  </Page>
}
