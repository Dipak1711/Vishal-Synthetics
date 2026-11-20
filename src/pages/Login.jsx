import React, { useState } from 'react'
import { ArrowRight, Scale, ScanLine, Receipt, Factory, Eye, EyeOff } from 'lucide-react'
import { login } from '../auth.js'

export default function Login() {
  const [u, setU] = useState('admin'); const [p, setP] = useState('admin123'); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [show, setShow] = useState(false)
  const submit = e => { e.preventDefault(); setBusy(true); setTimeout(() => { if (!login(u, p)) { setErr('Incorrect username or password.'); setBusy(false) } }, 350) }
  const feats = [[Scale, 'Auto weighing', 'Gross, tare and net weight captured per roll.'], [ScanLine, 'Barcode dispatch', 'Scan roll stickers on your phone to build delivery slips.'], [Factory, 'Production & BOM', 'Issue raw material, track waste and recycle scrap.'], [Receipt, 'Smart pricing', 'Cost with ageing interest and customer-wise rates.']]
  return <div className="login">
    <section className="login-hero">
      <div className="brand"><i>VS</i><div>Vishal Synthetics<small>Manufacturing ERP</small></div></div>
      <div><h2>Non-woven fabric production, from granules to invoice.</h2><p>One system for roll production, weighing, barcodes, dispatch, pricing and payments — on desktop and mobile.</p>
        <div className="feat">{feats.map(([I, t, d]) => <div key={t}><I size={20} /><b>{t}</b><span>{d}</span></div>)}</div></div>
      <small className="foot">© Vishal Synthetics</small>
    </section>
    <section className="login-form"><form onSubmit={submit} className="login-card" noValidate>
      <div className="brand mobile"><i>VS</i><div>Vishal Synthetics</div></div>
      <h1 style={{ fontSize: 28 }}>Welcome back</h1><p className="sub" style={{ marginBottom: 22 }}>Sign in to continue to your dashboard.</p>
      <div className="f"><label>Username</label><input value={u} autoFocus autoComplete="username" onChange={e => { setU(e.target.value); setErr('') }} /></div>
      <div className="f"><label>Password</label><div style={{ position: 'relative' }}><input type={show ? 'text' : 'password'} value={p} autoComplete="current-password" onChange={e => { setP(e.target.value); setErr('') }} style={{ paddingRight: 40 }} />
        <button type="button" className="eye" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
        {err && <p className="ferr">{err}</p>}</div>
      <button className="btn" style={{ width: '100%', height: 44 }} disabled={busy}>{busy ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}</button>
    </form></section></div>
}
