import { daysBetween, today } from './store.js'
export function invoiceState(inv) {
  if (inv.status === 'Paid') return { label: 'Paid', days: 0 }
  const d = daysBetween(today(), inv.due)
  return { label: d < 0 ? 'Overdue' : 'Unpaid', days: d }
}
export function alertsFor(s) {
  const a = []
  const cn = id => s.customers.find(c => c.id === id)?.name
  s.invoices.forEach(i => {
    const st = invoiceState(i)
    if (st.label === 'Overdue') a.push({ t: 'r', msg: `${i.id} (${cn(i.customerId)}) overdue by ${-st.days} days — ₹${i.amount.toLocaleString('en-IN')}` })
    else if (st.label === 'Unpaid' && st.days <= 3) a.push({ t: 'a', msg: `${i.id} (${cn(i.customerId)}) due in ${st.days} day(s) — reminder scheduled` })
  })
  s.customers.forEach(c => Object.entries(s.history[c.id] || {}).forEach(([col, days]) => {
    if (days >= s.settings.inactiveDays) a.push({ t: 'b', msg: `${cn(c.id)} has not ordered ${col} rolls for ${days} days — may be buying elsewhere` })
  }))
  const lowRM = s.rawMaterials.filter(r => r.stock < 1000)
  lowRM.forEach(r => a.push({ t: 'a', msg: `Low stock: ${r.name} (${r.stock} kg)` }))
  return a
}
