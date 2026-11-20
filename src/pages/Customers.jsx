import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore, update, uid, inr } from '../store.js'
import { useToast } from '../toast.jsx'
import { Page, Field, Modal, SearchBox, EmptyRow } from '../components/ui.jsx'

const blank = { name: '', city: '', region: 'West', phone: '', email: '', credit: 30 }
export default function Customers() {
  const s = useStore(); const toast = useToast()
  const [f, setF] = useState(blank); const [open, setOpen] = useState(false); const [err, setErr] = useState({}); const [q, setQ] = useState('')
  const set = k => e => { setF({ ...f, [k]: e.target.value }); setErr({ ...err, [k]: '' }) }
  const add = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Customer name is required'
    if (f.phone && !/^[+\d\s-]{8,15}$/.test(f.phone)) e.phone = 'Enter a valid phone number'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address'
    if (!(+f.credit >= 0)) e.credit = 'Credit days cannot be negative'
    setErr(e); if (Object.keys(e).length) return
    update(st => { st.customers.push({ ...f, name: f.name.trim(), id: uid('C'), credit: +f.credit }) })
    toast(f.name + ' added'); setF(blank); setOpen(false)
  }
  const due = id => s.invoices.filter(i => i.customerId === id && i.status !== 'Paid').reduce((a, i) => a + i.amount, 0)
  const rows = s.customers.filter(c => (c.name + c.city + c.phone).toLowerCase().includes(q.toLowerCase()))
  return <Page eyebrow="Sales" title="Customers" sub="Contacts, credit period and outstanding balance" right={<button className="btn" onClick={() => setOpen(true)}><Plus size={16} />Add customer</button>}>
    <div className="card"><div style={{ marginBottom: 10, maxWidth: 360 }}><SearchBox value={q} onChange={setQ} placeholder="Search name, city, phone…" /></div>
      <div className="tw"><table><thead><tr><th>Customer</th><th>City</th><th>Region</th><th>Phone</th><th>Email</th><th>Credit</th><th>Outstanding</th></tr></thead><tbody>
        {rows.map(c => <tr key={c.id}><td><b>{c.name}</b></td><td>{c.city}</td><td>{c.region}</td><td>{c.phone}</td><td>{c.email}</td><td>{c.credit} days</td><td>{inr(due(c.id))}</td></tr>)}
        {!rows.length && <EmptyRow cols={7} />}</tbody></table></div></div>
    {open && <Modal title="Add customer" onClose={() => { setOpen(false); setErr({}) }} footer={<><button className="btn sec" onClick={() => { setOpen(false); setErr({}) }}>Cancel</button><button className="btn" onClick={add}>Save customer</button></>}>
      <div className="fg">
        <Field cls="c12" label="Customer name" required error={err.name}><input autoFocus value={f.name} onChange={set('name')} /></Field>
        <Field cls="c6" label="City"><input value={f.city} onChange={set('city')} /></Field>
        <Field cls="c6" label="Region"><select value={f.region} onChange={set('region')}>{['North', 'South', 'East', 'West'].map(r => <option key={r}>{r}</option>)}</select></Field>
        <Field cls="c6" label="Phone / WhatsApp" error={err.phone}><input value={f.phone} onChange={set('phone')} placeholder="+91 98xxx xxxxx" /></Field>
        <Field cls="c6" label="Email" error={err.email}><input value={f.email} onChange={set('email')} /></Field>
        <Field cls="c6" label="Credit period (days)" error={err.credit} hint="Used for invoice due dates and reminders"><input type="number" value={f.credit} onChange={set('credit')} /></Field>
      </div></Modal>}
  </Page>
}
