import React from 'react'
import { Printer } from 'lucide-react'
import { Modal } from './ui.jsx'
import { inr, fmt } from '../store.js'

export default function PrintDoc({ kind, doc, s, onClose }) {
  const c = s.customers.find(x => x.id === doc.customerId)
  const gst = s.settings.gst ?? 12
  const isInv = kind === 'invoice'
  const isDoc = kind === 'quote' || kind === 'order'
  const rolls = (doc.rolls || []).map?.(id => s.rolls.find(r => r.id === id)).filter(Boolean) || []
  const base = isInv ? doc.amount : doc.qty * doc.rate
  const tax = base * gst / 100
  return <Modal title={isInv ? 'Tax Invoice ' + doc.id : isDoc ? (kind === 'quote' ? 'Quotation ' : 'Sales Order ') + doc.id : 'Delivery Slip ' + doc.id} onClose={onClose} width={760}
    footer={<><button className="btn sec" onClick={onClose}>Close</button><button className="btn" onClick={() => window.print()}><Printer size={16} />Print</button></>}>
    <div className="doc print-area">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><h2>Vishal Synthetics</h2><div>Non-woven fabric manufacturer</div></div>
        <div style={{ textAlign: 'right' }}><h2>{isInv ? 'TAX INVOICE' : isDoc ? (kind === 'quote' ? 'QUOTATION' : 'SALES ORDER') : 'DELIVERY SLIP'}</h2><div>No: <b>{doc.id}</b></div><div>Date: {doc.date}</div>{isInv && <div>Due: {doc.due}</div>}</div>
      </div>
      <hr />
      <div><b>Bill to:</b><br />{c?.name}<br />{c?.city} · {c?.phone}</div>
      {isDoc && <table style={{ marginTop: 16 }}><thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Rate</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead><tbody>
        <tr><td>Non-woven fabric · {doc.colour} · {doc.quality} · {doc.gsm} GSM · {doc.width}" × {doc.length} m</td><td style={{ textAlign: 'right' }}>{doc.qty} {doc.uom}</td><td style={{ textAlign: 'right' }}>{inr(doc.rate)}</td><td style={{ textAlign: 'right' }}>{inr(doc.qty * doc.rate)}</td></tr></tbody></table>}
      {!isInv && !isDoc && <table style={{ marginTop: 16 }}><thead><tr><th>#</th><th>Roll No</th><th>Specification</th><th style={{ textAlign: 'right' }}>Net (kg)</th></tr></thead><tbody>
        {rolls.map((r, i) => <tr key={r.id}><td>{i + 1}</td><td>{r.id}</td><td>{r.colour} · {r.quality} · {r.gsm} GSM · {r.width}" × {r.length} m</td><td style={{ textAlign: 'right' }}>{fmt(r.net)}</td></tr>)}</tbody></table>}
      {isInv && <table style={{ marginTop: 16 }}><thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Rolls</th><th style={{ textAlign: 'right' }}>Qty (kg)</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead><tbody>
        <tr><td>Non-woven fabric rolls</td><td style={{ textAlign: 'right' }}>{doc.rolls}</td><td style={{ textAlign: 'right' }}>{fmt(doc.qty)}</td><td style={{ textAlign: 'right' }}>{inr(doc.amount)}</td></tr></tbody></table>}
      <div className="tot">
        {!isInv && !isDoc && <div><span>Total net weight</span><b>{fmt(doc.qty)} kg</b></div>}
        {(isInv || isDoc) && <><div><span>Taxable value</span><span>{inr(base)}</span></div><div><span>GST @ {gst}%</span><span>{inr(tax)}</span></div><div className="grand"><span>Total</span><span>{inr(base + tax)}</span></div></>}
      </div>
      {isInv && <p style={{ marginTop: 24, color: '#555' }}>Payment due within {c?.credit} days of invoice date.</p>}
      <p style={{ marginTop: 30, color: '#555' }}>Authorised signatory</p>
    </div></Modal>
}
