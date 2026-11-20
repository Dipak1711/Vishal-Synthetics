import React, { useState, useEffect, useMemo } from 'react'
import { NavLink, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { PanelLeft, ChevronRight, LayoutGrid, Briefcase, Wallet, Home, MoreHorizontal, Bell, Menu, Moon, Sun, ChevronDown, LogOut, Search, ShieldAlert, LayoutDashboard, Boxes, Factory, Scale, Scissors, ScanLine, FileText, Receipt, Users, IndianRupee, ShoppingCart, Contact, Settings as Cog } from 'lucide-react'
import { useStore } from './store.js'
import { alertsFor } from './alerts.js'
import { useSession, logout, canAccess } from './auth.js'
import { ToastProvider } from './toast.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import Production from './pages/Production.jsx'
import Weighing from './pages/Weighing.jsx'
import Cutting from './pages/Cutting.jsx'
import Dispatch from './pages/Dispatch.jsx'
import Sales from './pages/Sales.jsx'
import SalesNew from './pages/SalesNew.jsx'
import Accounts from './pages/Accounts.jsx'
import CRM from './pages/CRM.jsx'
import Pricing from './pages/Pricing.jsx'
import Purchase from './pages/Purchase.jsx'
import Customers from './pages/Customers.jsx'
import Settings from './pages/Settings.jsx'

const nav = [
  ['Overview', [['/', 'Dashboard', LayoutDashboard]], LayoutGrid],
  ['Operations', [['/inventory', 'Inventory', Boxes], ['/production', 'Production & BOM', Factory], ['/weighing', 'Weighing & Barcode', Scale], ['/cutting', 'Roll Cutting', Scissors], ['/dispatch', 'Dispatch Scan', ScanLine]], Factory],
  ['Sales', [['/sales', 'Quotations & Orders', FileText], ['/crm', 'CRM & Leads', Users], ['/customers', 'Customers', Contact]], Briefcase],
  ['Finance', [['/accounts', 'Invoices & Payments', Receipt], ['/pricing', 'Pricing & Costing', IndianRupee], ['/purchase', 'Purchase', ShoppingCart]], Wallet],
  ['System', [['/settings', 'Settings', Cog]], Cog],
]
const flat = nav.flatMap(([g, it]) => it.map(([to, label]) => ({ to, label, group: g })))

function Shell({ session }) {
  const s = useStore(); const navigate = useNavigate(); const loc = useLocation()
  const [open, setOpen] = useState(false); const [bell, setBell] = useState(false); const [menu, setMenu] = useState(false)
  const [q, setQ] = useState('')
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('vs_collapsed') === '1' } catch { return false } })
  const toggleSide = () => { const n = !collapsed; setCollapsed(n); try { localStorage.setItem('vs_collapsed', n ? '1' : '0') } catch {} }
  const [openG, setOpenG] = useState(() => { try { return JSON.parse(localStorage.getItem('vs_groups')) || { Overview: true, Operations: true } } catch { return { Overview: true, Operations: true } } })
  const toggleG = g => { const n = { ...openG, [g]: !openG[g] }; setOpenG(n); try { localStorage.setItem('vs_groups', JSON.stringify(n)) } catch {} }
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('vs_theme') === 'dark' } catch { return false } })
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); try { localStorage.setItem('vs_theme', dark ? 'dark' : 'light') } catch {} }, [dark])
  useEffect(() => { setBell(false); setMenu(false); setQ(''); setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  const alerts = alertsFor(s)
  const cur = flat.find(x => x.to === loc.pathname) || flat.find(x => x.to !== '/' && loc.pathname.startsWith(x.to + '/'))
  const sub = loc.pathname.startsWith('/sales/new/') ? (loc.pathname.endsWith('order') ? 'New sales order' : 'New quotation') : null
  const results = useMemo(() => {
    const t = q.trim().toLowerCase(); if (!t) return []
    const out = []
    flat.filter(x => canAccess(session, x.to) && x.label.toLowerCase().includes(t)).forEach(x => out.push({ k: 'Page', label: x.label, to: x.to }))
    s.customers.filter(c => c.name.toLowerCase().includes(t)).slice(0, 4).forEach(c => out.push({ k: 'Customer', label: c.name, to: '/customers' }))
    s.rolls.filter(r => r.id.toLowerCase().includes(t)).slice(0, 4).forEach(r => out.push({ k: 'Roll', label: `${r.id} · ${r.colour} ${r.gsm}GSM`, to: '/inventory' }))
    s.invoices.filter(i => i.id.toLowerCase().includes(t)).slice(0, 3).forEach(i => out.push({ k: 'Invoice', label: i.id, to: '/accounts' }))
    return out.slice(0, 10)
  }, [q, s])
  const initials = session.name.split(' ').map(p => p[0]).join('').slice(0, 2)
  const allowed = canAccess(session, loc.pathname)
  const hour = new Date().getHours()
  return <div className="app">
    <aside className={'side' + (open ? ' open' : '') + (collapsed ? ' mini' : '')}>
      <div className="brand"><i>VS</i><span className="lbl">Vishal Synthetics</span></div>
      {nav.map(([g, items, GIcon]) => { const vis = items.filter(([to]) => canAccess(session, to)); if (!vis.length) return null
        const hasActive = vis.some(([to]) => to === loc.pathname || (to !== '/' && loc.pathname.startsWith(to + '/'))); const isOpen = openG[g] || hasActive
        return <div key={g} className="sgroup">
          <button className={'sec' + (hasActive ? ' act' : '')} onClick={() => toggleG(g)}><span className="sic"><GIcon size={18} /></span><span className="lbl">{g}</span><ChevronRight size={16} className={'chev lbl' + (isOpen ? ' o' : '')} /></button>
          <div className={'sub-list' + (isOpen ? ' o' : '')}>{vis.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} title={label}><Icon size={19} /><span className="lbl">{label}</span></NavLink>)}</div></div> })}
      <div className="sfoot"><span className="av">{initials}</span><div className="lbl"><b>{session.name}</b><small>{session.role}</small></div></div>
    </aside>
    <nav className="bnav">{[['/', 'Home', Home], ['/weighing', 'Weigh', Scale], ['/dispatch', 'Dispatch', ScanLine], ['/sales', 'Sales', FileText], ['/accounts', 'Invoices', Receipt]].filter(([to]) => canAccess(session, to)).slice(0, 4).map(([to, l, I]) => <NavLink key={to} to={to} end={to === '/'}><I size={20} /><span>{l}</span></NavLink>)}<button onClick={() => setOpen(true)}><MoreHorizontal size={20} /><span>More</span></button></nav>
    {open && <div className="overlay" style={{ zIndex: 25, background: 'rgb(0 0 0/.4)' }} onClick={() => setOpen(false)} />}
    <div className={'main' + (collapsed ? ' mini' : '')}>
      <div className="top">
        <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menu"><Menu size={18} /></button>
        <button className="icon-btn side-toggle" onClick={toggleSide} aria-label="Toggle sidebar" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><PanelLeft size={18} /></button>
        <div className="crumbs hide-m">{cur ? <>{cur.group}<span>/</span>{sub ? <>{cur.label}<span>/</span><b>{sub}</b></> : <b>{cur.label}</b>}</> : <b>Dashboard</b>}</div>
        <div className="gs"><div className="sbox"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search pages, rolls, customers, invoices…" /></div>
          {q && <div className="gs-res">{results.length ? results.map((r, i) => <button key={i} onClick={() => navigate(r.to)}><b>{r.label}</b><small>{r.k}</small></button>) : <div className="empty" style={{ padding: 16 }}><small>No results for “{q}”</small></div>}</div>}</div>
        <div style={{ flex: 1 }} />
        <button className="icon-btn bell" onClick={() => { setBell(!bell); setMenu(false) }} aria-label="Notifications"><Bell size={18} />{alerts.length > 0 && <b>{alerts.length}</b>}</button>
        <button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button className="user" style={{ cursor: 'pointer', font: 'inherit', color: 'inherit' }} onClick={() => { setMenu(!menu); setBell(false) }}><span className="av">{initials}</span><div style={{ textAlign: 'left' }}><b>{session.name}</b><small>{session.role}</small></div><ChevronDown size={14} /></button>
      </div>
      {bell && <div className="panel"><div className="sec-title" style={{ padding: '4px 6px 8px' }}>Notifications ({alerts.length})</div>{alerts.length === 0 ? <div className="empty" style={{ padding: 20 }}><small>You're all caught up</small></div> : alerts.map((a, i) => <div key={i} className={'alert al-' + a.t}>{a.msg}</div>)}</div>}
      {menu && <div className="menu"><button onClick={() => { logout(); navigate('/') }}><LogOut size={16} />Sign out</button></div>}
      <div className="content">
        {!allowed ? <div className="card empty" style={{ padding: 50 }}><span><ShieldAlert size={20} /></span><b>Access restricted</b><small>Your role ({session.role}) does not have access to this page.</small><button className="btn" style={{ marginTop: 10 }} onClick={() => navigate('/')}>Back to dashboard</button></div> :
          <Routes>
            <Route path="/" element={<Dashboard greeting={(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening') + ', ' + session.name.split(' ')[0]} />} /><Route path="/inventory" element={<Inventory />} />
            <Route path="/production" element={<Production />} /><Route path="/weighing" element={<Weighing />} />
            <Route path="/cutting" element={<Cutting />} /><Route path="/dispatch" element={<Dispatch />} />
            <Route path="/sales" element={<Sales />} /><Route path="/sales/new/:type" element={<SalesNew />} /><Route path="/accounts" element={<Accounts />} />
            <Route path="/crm" element={<CRM />} /><Route path="/pricing" element={<Pricing />} />
            <Route path="/purchase" element={<Purchase />} /><Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} /><Route path="*" element={<Navigate to="/" />} />
          </Routes>}
      </div>
    </div>
  </div>
}

export default function App() {
  const session = useSession()
  return <ToastProvider>{session ? <Shell session={session} /> : <Login />}</ToastProvider>
}
