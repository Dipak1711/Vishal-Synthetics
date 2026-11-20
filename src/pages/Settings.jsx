import React from 'react'
import { useStore, update, resetData } from '../store.js'
import { useToast } from '../toast.jsx'
import { Page, Field, Confirm } from '../components/ui.jsx'

export default function Settings() {
  const s = useStore(); const toast = useToast(); const [ask, setAsk] = React.useState(false)
  return <Page eyebrow="System" title="Settings" sub="Reminder, alert and costing preferences">
    <div className="card" style={{ maxWidth: 760 }}><h3>Preferences</h3><div className="fg">
      <div className="fsec">Reminders &amp; alerts</div>
      <Field cls="c6" label="Overdue reminder interval (days)"><input type="number" value={s.settings.overdueEvery} onChange={e => update(st => { st.settings.overdueEvery = +e.target.value })} /></Field>
      <Field cls="c6" label="Inactive SKU alert after (days)"><input type="number" value={s.settings.inactiveDays} onChange={e => update(st => { st.settings.inactiveDays = +e.target.value })} /></Field>
      <div className="fsec">Production &amp; costing</div>
      <Field cls="c4" label="Default paper core (kg)"><select value={s.settings.tareDefault} onChange={e => update(st => { st.settings.tareDefault = +e.target.value })}>{[0.5, 0.6, 1, 2].map(t => <option key={t}>{t}</option>)}</select></Field>
      <Field cls="c4" label="GST on invoices (%)"><input type="number" value={s.settings.gst ?? 12} onChange={e => update(st => { st.settings.gst = +e.target.value })} /></Field>
      <Field cls="c4" label="Bank interest (% / year)"><input type="number" value={s.settings.interestPct} onChange={e => update(st => { st.settings.interestPct = +e.target.value })} /></Field>
      <div className="fa" style={{ justifyContent: 'flex-start' }}><button className="btn red" onClick={() => setAsk(true)}>Reset data</button></div></div></div>
    {ask && <Confirm danger title="Reset all data?" text="All records you added will be removed and the starting sample records restored. This cannot be undone." yes="Reset data" onNo={() => setAsk(false)} onYes={() => { resetData(); setAsk(false); toast('Data reset') }} />}</Page>
}
