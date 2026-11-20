import React, { useState, useMemo } from 'react'
import { Plus, Download, Printer, FileText, IndianRupee, Hourglass, CheckCircle2, ArrowRightCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, update, nextNo, today, inr, daysBetween } from '../store.js'
import { useToast } from '../toast.jsx'
import PrintDoc from '../components/PrintDoc.jsx'
import { Page, Pill, Stat, SearchBox, EmptyRow } from '../components/ui.jsx'

export default function Sales() {
  const s = useStore(); const toast = useToast(); const navigate = useNavigate(); const [sp] = useSearchParams()
  const [tab, setTab] = useState(sp.get('tab') === 'orders' ? 'Sales Orders' : 'Quotations')
  const [status, setStatus] = useState('All'); const [q, setQ] = useState(''); const [period, setPeriod] = useState('All time')
  const [print, setPrint] = useState(null)
  const isQ = tab === 'Quotations'
  const cn = id => s.customers.find(c => c.id === id)?.name
  const lbl = r => (isQ && r.status === 'Closed') ? 'Converted' : r.status
  const all = isQ ? s.quotations : s.salesOrders
  const inPeriod = r => period === 'All time' || (period === 'Last 30 days' ? daysBetween(r.date, today()) <= 30 : r.date.slice(0, 7) === today().slice(0, 7))
  const base = all.filter(inPeriod).filter(r => (r.id + cn(r.customerId) + r.colour + r.quality).toLowerCase().includes(q.toLowerCase()))
  const statuses = isQ ? ['Sent', 'Converted'] : ['Open', 'Closed']
  const rows = base.filter(r => status === 'All' || lbl(r) === status).slice().reverse()
  const stats = useMemo(() => ({ total: all.length, value: all.reduce((a, r) => a + r.rate * r.qty, 0), pending: all.filter(r => lbl(r) === statuses[0]).length, done: all.filter(r => lbl(r) === statuses[1]).length }), [all, tab])

  const openNew = () => navigate('/sales/new/' + (isQ ? 'quotation' : 'order'))
  const convert = r => { update(st => { const x = st.quotations.find(y => y.id === r.id); x.status = 'Closed'; st.salesOrders.push({ ...r, id: nextNo(st, 'so', 'SO-'), type: 'order', status: 'Open', date: today() }) }); toast(r.id + ' converted to a sales order') }
  const exportCsv = () => {
    const head = ['No', 'Date', 'Customer', 'Colour', 'Quality', 'GSM', 'Qty', 'UOM', 'Rate', 'Amount', 'Status']
    const body = rows.map(r => [r.id, r.date, cn(r.customerId), r.colour, r.quality, r.gsm, r.qty, r.uom, r.rate, r.rate * r.qty, lbl(r)])
    const csv = [head, ...body].map(l => l.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = (isQ ? 'quotations' : 'sales-orders') + '.csv'; a.click()
  }
  const switchTab = t => { setTab(t); setStatus('All') }

  return <Page title={isQ ? 'Sales Quotations' : 'Sales Orders'}
    right={<><button className="btn sec" onClick={exportCsv}><Download size={16} />Export</button><button className="btn" onClick={openNew}><Plus size={16} />New {isQ ? 'quotation' : 'sales order'}</button></>}>
    <div className="tabs" style={{ marginBottom: 16 }}>{['Quotations', 'Sales Orders'].map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => switchTab(t)}>{t}</button>)}</div>
    <div className="grid g4">
      <Stat icon={FileText} tone="blue" l={isQ ? 'Total quotations' : 'Total orders'} v={stats.total} />
      <Stat icon={IndianRupee} tone="green" l="Total value" v={inr(stats.value)} />
      <Stat icon={Hourglass} tone="amber" l={isQ ? 'Sent — awaiting reply' : 'Open — to dispatch'} v={stats.pending} />
      <Stat icon={CheckCircle2} tone="violet" l={isQ ? 'Converted to order' : 'Closed'} v={stats.done} />
    </div>
    <div className="toolbar">
      <SearchBox value={q} onChange={setQ} placeholder={`Search ${isQ ? 'quotations' : 'orders'}…`} />
      <select className="tsel" value={period} onChange={e => setPeriod(e.target.value)}>{['All time', 'This month', 'Last 30 days'].map(x => <option key={x}>{x}</option>)}</select>
      <span className="rcount">{rows.length} {rows.length === 1 ? "record" : "records"}</span>
    </div>
    <div className="tabs stabs">{['All', ...statuses].map(x => <button key={x} className={status === x ? 'on' : ''} onClick={() => setStatus(x)}>{x}<em>{x === 'All' ? base.length : base.filter(r => lbl(r) === x).length}</em></button>)}</div>
    <div className="card tw"><table className="dense"><thead><tr><th>{isQ ? 'Quotation no' : 'Order no'}</th><th>Date</th><th>Customer</th><th>Item</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Rate</th><th style={{ textAlign: 'right' }}>Total</th><th>Status</th><th></th></tr></thead><tbody>
      {rows.map(r => <tr key={r.id}><td><b className="mono">{r.id}</b></td><td>{r.date}</td><td>{cn(r.customerId)}</td><td>{r.colour} · {r.quality} · {r.gsm} GSM</td><td style={{ textAlign: 'right' }}>{r.qty} {r.uom}</td><td style={{ textAlign: 'right' }}>{inr(r.rate)}</td><td style={{ textAlign: 'right' }}><b>{inr(r.rate * r.qty)}</b></td><td><Pill s={lbl(r)} /></td>
        <td><div className="acts">{isQ && r.status === 'Sent' && <button className="btn sm" onClick={() => convert(r)}><ArrowRightCircle size={14} />Convert</button>}<button className="icon-btn" style={{ width: 34, height: 34 }} title="Print" onClick={() => setPrint({ kind: isQ ? 'quote' : 'order', doc: r })}><Printer size={15} /></button></div></td></tr>)}
      {!rows.length && <EmptyRow cols={9} text={`No ${isQ ? 'quotations' : 'sales orders'} found`} hint="Change the filters or create a new one." />}</tbody></table></div>

    {print && <PrintDoc kind={print.kind} doc={print.doc} s={s} onClose={() => setPrint(null)} />}
  </Page>
}
