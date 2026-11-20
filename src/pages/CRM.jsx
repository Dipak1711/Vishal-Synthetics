import React, { useState } from 'react'
import { useStore, update, nextNo, today, fmt, inr } from '../store.js'
import { Inbox, Handshake, Clock, IndianRupee } from 'lucide-react'
import { useToast } from '../toast.jsx'
import { Page, Pill, Tabs, Stat } from '../components/ui.jsx'

const incoming = [['Vikram Rao', 'Delhi Nonwoven Traders', 'North', 'White 50 GSM', 1200], ['Anil Das', 'Howrah Packers', 'East', 'Red 60 GSM', 900], ['Meena Pillai', 'Kochi Surgical Supplies', 'South', 'Blue 40 GSM', 2500], ['Jay Mehta', 'Vapi Industrial Wraps', 'West', 'Green 80 GSM', 700]]
export default function CRM() {
  const s = useStore(); const [tab, setTab] = useState('Lead Inbox'); const toast = useToast()
  const rep = id => s.reps.find(r => r.id === id)?.name
  const fetchLeads = () => { update(st => { incoming.forEach(([name, company, region, product, qty]) => { const r = st.reps.find(x => x.region === region); st.leads.push({ id: nextNo(st, 'lead', 'L', 1), date: today(), name, company, region, product, qty, rep: r?.id, status: 'Allocated' }) }) }); toast('4 new inquiries fetched and allocated by region') }
  const setStatus = (id, status) => update(st => { const l = st.leads.find(x => x.id === id); l.status = status; if (status === 'Deal Closed') l.sold = l.sold || l.qty * 5 })
  const stats = s.reps.map(r => { const ls = s.leads.filter(l => l.rep === r.id); const sold = ls.filter(l => l.status === 'Deal Closed').reduce((a, l) => a + (l.sold || 0), 0); const slab = [...s.settings.commission].reverse().find(c => sold >= c.from); return { ...r, got: ls.length, closed: ls.filter(l => l.status === 'Deal Closed').length, proc: ls.filter(l => ['Under Process', 'Allocated'].includes(l.status)).length, sold, rate: slab.rate, comm: sold * slab.rate } })
  return <Page eyebrow="Sales" title="CRM & Leads" sub="Inquiries are auto-allocated to sales reps by region" right={<button className="btn" onClick={fetchLeads}>Fetch new inquiries</button>}>
    <div className="grid g4"><Stat icon={Inbox} tone="info" l="Total inquiries" v={s.leads.length} /><Stat icon={Handshake} tone="green" l="Deals closed" v={s.leads.filter(l => l.status === 'Deal Closed').length} /><Stat icon={Clock} tone="warn" l="In process" v={s.leads.filter(l => ['Under Process', 'Allocated'].includes(l.status)).length} /><Stat icon={IndianRupee} tone="violet" l="Total commission" v={inr(stats.reduce((a, r) => a + r.comm, 0))} /></div>
    <Tabs tabs={['Lead Inbox', 'Sales Rep Performance', 'Allocation Rules']} v={tab} set={setTab} />
    {tab === 'Lead Inbox' && <div className="card tw"><table><thead><tr><th>Date</th><th>Contact</th><th>Company</th><th>Region</th><th>Product</th><th>Qty</th><th>Rep</th><th>Status</th></tr></thead><tbody>
      {s.leads.slice().reverse().map(l => <tr key={l.id}><td>{l.date}</td><td>{l.name}</td><td>{l.company}</td><td>{l.region}</td><td>{l.product}</td><td>{l.qty} kg</td><td>{rep(l.rep)}</td><td><select style={{ width: 140 }} value={l.status} onChange={e => setStatus(l.id, e.target.value)}>{['Allocated', 'Under Process', 'Deal Closed', 'Lost'].map(x => <option key={x}>{x}</option>)}</select></td></tr>)}</tbody></table></div>}
    {tab === 'Sales Rep Performance' && <div className="card tw"><p className="sub">Auto-generated every 15 days / month · commission slabs: {s.settings.commission.filter(c => c.rate).map(c => `${fmt(c.from, 0)} kg+ = ₹${c.rate}/kg`).join(' · ')}</p><table><thead><tr><th>Sales rep</th><th>Region</th><th>Inquiries</th><th>Closed</th><th>In process</th><th>Sold (kg)</th><th>Rate</th><th>Commission</th></tr></thead><tbody>
      {stats.map(r => <tr key={r.id}><td><b>{r.name}</b></td><td>{r.region}</td><td>{r.got}</td><td>{r.closed}</td><td>{r.proc}</td><td>{fmt(r.sold, 0)}</td><td>₹{r.rate}/kg</td><td><b>{inr(r.comm)}</b></td></tr>)}</tbody></table></div>}
    {tab === 'Allocation Rules' && <div className="card tw"><table><thead><tr><th>Rule</th><th>Condition</th><th>Assign to</th></tr></thead><tbody>
      {s.reps.map(r => <tr key={r.id}><td>Region-wise</td><td>Inquiry region = {r.region}</td><td>{r.name}</td></tr>)}</tbody></table></div>}
  </Page>
}
