import React, { useState } from 'react'
import { useStore, update, nextNo, today, addDays, fmt, inr, currentCost } from '../store.js'
import { invoiceState } from '../alerts.js'
import { Wallet, AlertTriangle, FileClock } from 'lucide-react'
import { useToast } from '../toast.jsx'
import { Printer, Search as SearchI } from 'lucide-react'
import PrintDoc from '../components/PrintDoc.jsx'
import { Page, Pill, Tabs, Stat, SearchBox, EmptyRow, Confirm } from '../components/ui.jsx'

export default function Accounts() {
  const s = useStore()
  const [tab, setTab] = useState('Delivery Reports'); const toast = useToast(); const [q, setQ] = useState(''); const [print, setPrint] = useState(null); const [ask, setAsk] = useState(null)
  const cn = id => s.customers.find(c => c.id === id)
  const pending = s.deliveries.filter(d => d.status === 'Pending Invoice')
  const mk = d => { update(st => {
    const c = st.customers.find(x => x.id === d.customerId); const dl = st.deliveries.find(x => x.id === d.id); dl.status = 'Invoiced'
    const rolls = dl.rolls.map(id => st.rolls.find(r => r.id === id))
    const amt = dl.uom === 'roll' ? dl.rate * dl.rolls.length : dl.rate * dl.qty
    st.invoices.push({ id: nextNo(st, 'inv', 'INV-'), customerId: c.id, date: today(), due: addDays(today(), c.credit), qty: dl.qty, amount: Math.round(amt), status: 'Unpaid', rolls: dl.rolls.length, reminders: [], colour: rolls[0]?.colour, cost: Math.round(rolls.reduce((a, r) => a + r.net * r.origCost, 0)) })
    const pl = st.priceList.find(p => p.customerId === c.id); if (pl) { pl.lastPrice = dl.rate; pl.rmAtSale = st.rawMaterials.reduce((a, r) => a + r.rate * r.mix, 0); pl.date = today() }
  }); toast('Invoice created for ' + cn(d.customerId).name); setTab('Invoices') }
  const remind = (i, ch) => { update(st => { st.invoices.find(x => x.id === i.id).reminders.push(`${ch} · ${today()}`) }); toast(`${ch} reminder sent to ${cn(i.customerId).name}`) }
  const total = s.invoices.filter(i => i.status !== 'Paid')
  const over = total.filter(i => invoiceState(i).label === 'Overdue')
  return <Page eyebrow="Finance" title="Invoices & Payments" sub="Convert delivery reports to invoices and chase payments automatically">
    <div className="grid g3"><Stat icon={Wallet} tone="info" l="Outstanding" v={inr(total.reduce((a, i) => a + i.amount, 0))} /><Stat icon={AlertTriangle} tone="red" l="Overdue" v={inr(over.reduce((a, i) => a + i.amount, 0))} /><Stat icon={FileClock} tone="warn" l="Awaiting invoice" v={pending.length + ' delivery reports'} /></div>
    <Tabs tabs={['Delivery Reports', 'Invoices', 'Reminders']} v={tab} set={setTab} />
    {tab === 'Delivery Reports' && <div className="card tw"><table><thead><tr><th>Slip</th><th>Date</th><th>Customer</th><th>Rolls</th><th>Net weight</th><th>Rate</th><th>Prod. cost (orig / current)</th><th></th></tr></thead><tbody>
      {pending.map(d => { const rs = d.rolls.map(id => s.rolls.find(r => r.id === id)); const o = rs.reduce((a, r) => a + r.origCost, 0) / rs.length; const c = rs.reduce((a, r) => a + currentCost(r.origCost, r.date, s), 0) / rs.length
        return <tr key={d.id}><td><b>{d.id}</b></td><td>{d.date}</td><td>{cn(d.customerId).name}</td><td>{d.rolls.length}</td><td>{fmt(d.qty)} kg</td><td>{inr(d.rate)}</td><td>{inr(o)} / {inr(c)}</td><td><div className="row" style={{ flexWrap: 'nowrap' }}><button className="btn sec sm" onClick={() => setPrint({ kind: 'slip', doc: d })}><Printer size={13} />Slip</button><button className="btn sm" onClick={() => mk(d)}>Create invoice</button></div></td></tr> })}
      {!pending.length && <EmptyRow cols={8} text="No pending delivery reports" hint="Scan rolls on the Dispatch page to create one." />}</tbody></table></div>}
    {tab === 'Invoices' && <div className="card"><div style={{ marginBottom: 10, maxWidth: 360 }}><SearchBox value={q} onChange={setQ} placeholder="Search invoice or customer…" /></div><div className="tw"><table><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Qty</th><th>Amount</th><th>Credit</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
      {s.invoices.filter(i => (i.id + cn(i.customerId).name).toLowerCase().includes(q.toLowerCase())).slice().reverse().map(i => { const st = invoiceState(i); return <tr key={i.id}><td><b>{i.id}</b></td><td>{i.date}</td><td>{cn(i.customerId).name}</td><td>{fmt(i.qty, 0)} kg</td><td>{inr(i.amount)}</td><td>{cn(i.customerId).credit} d</td><td>{i.due}</td><td><Pill s={st.label} /></td>
        <td><div className="row" style={{ flexWrap: 'nowrap' }}><button className="btn sec sm" onClick={() => setPrint({ kind: 'invoice', doc: i })}><Printer size={13} />Print</button>{i.status !== 'Paid' && <button className="btn sec sm" onClick={() => setAsk(i)}>Mark paid</button>}</div></td></tr> })}</tbody></table></div></div>}
    {ask && <Confirm title="Mark invoice as paid?" text={`${ask.id} for ${inr(ask.amount)} will be recorded as received.`} yes="Mark paid" onNo={() => setAsk(null)} onYes={() => { update(x => { x.invoices.find(y => y.id === ask.id).status = 'Paid' }); toast(ask.id + ' marked as paid'); setAsk(null) }} />}
    {print && <PrintDoc kind={print.kind} doc={print.doc} s={s} onClose={() => setPrint(null)} />}
    {tab === 'Reminders' && <div className="card tw"><p className="sub">Automatic schedule: 3 days before due · on due date · every {s.settings.overdueEvery} days when overdue.</p><table><thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th>State</th><th>Next reminder</th><th>Sent</th><th></th></tr></thead><tbody>
      {total.map(i => { const st = invoiceState(i); const next = st.label === 'Overdue' ? `Every ${s.settings.overdueEvery} days` : st.days <= 3 ? 'Due soon — now' : addDays(i.due, -3)
        return <tr key={i.id}><td>{i.id}</td><td>{cn(i.customerId).name}</td><td>{i.due}</td><td><Pill s={st.label} /></td><td>{next}</td><td>{i.reminders.length}</td><td><div className="row" style={{ flexWrap: 'nowrap' }}>{['WhatsApp', 'Email', 'SMS'].map(ch => <button key={ch} className="btn sec sm" onClick={() => remind(i, ch)}>{ch}</button>)}</div></td></tr> })}</tbody></table></div>}
  </Page>
}
