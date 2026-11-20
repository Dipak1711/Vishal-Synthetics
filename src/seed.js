const d = (n) => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10) }
export function seed() {
  const customers = [
    { id: 'C1', name: 'Shree Packaging Industries', city: 'Ahmedabad', region: 'West', phone: '+91 98250 11223', email: 'accounts@shreepack.in', credit: 30 },
    { id: 'C2', name: 'MediCare Disposables Pvt Ltd', city: 'Mumbai', region: 'West', phone: '+91 98200 44551', email: 'purchase@medicare.in', credit: 45 },
    { id: 'C3', name: 'Sai Textiles & Caps', city: 'Surat', region: 'West', phone: '+91 98790 33441', email: 'sai.caps@gmail.com', credit: 15 },
    { id: 'C4', name: 'Northern Hygiene Products', city: 'Delhi', region: 'North', phone: '+91 98110 22331', email: 'info@northhygiene.in', credit: 60 },
    { id: 'C5', name: 'Eastern Wraps Co.', city: 'Kolkata', region: 'East', phone: '+91 98300 77665', email: 'orders@easternwraps.in', credit: 30 },
    { id: 'C6', name: 'Southern PPE Solutions', city: 'Chennai', region: 'South', phone: '+91 98400 55123', email: 'buy@southppe.in', credit: 30 },
  ]
  const rawMaterials = [
    { id: 'RM1', name: 'Plastic Granules (Reliance)', stock: 18400, rate: 112, mix: 0.92, prev: [108, 110, 109, 111, 112] },
    { id: 'RM2', name: 'Colour Master Batch', stock: 1250, rate: 210, mix: 0.05, prev: [205, 208, 212, 209, 210] },
    { id: 'RM3', name: '3G Master Batch (Quality)', stock: 980, rate: 180, mix: 0.03, prev: [178, 176, 179, 181, 180] },
  ]
  const colours = ['White', 'Red', 'Blue', 'Pink', 'Green']
  const qualities = ['Virgin', 'First', 'Medium', 'Second']
  const rolls = []
  let n = 0
  const specs = [
    ['White', 'Virgin', 80, 63, 1000, 30], ['White', 'First', 60, 40, 1000, 75], ['Red', 'First', 80, 63, 1000, 14],
    ['Blue', 'Medium', 50, 40, 800, 120], ['Pink', 'First', 70, 63, 1000, 200], ['Green', 'Second', 40, 80, 1000, 60], ['White', 'Virgin', 100, 100, 1000, 5],
  ]
  specs.forEach(([colour, quality, gsm, width, length, age], si) => {
    for (let i = 0; i < 6; i++) {
      n++
      const tare = [0.5, 0.6, 1, 2][i % 4]
      const gross = +(48 + ((n * 7) % 9) / 3 + tare).toFixed(1)
      rolls.push({ id: 'VS-R-' + String(n).padStart(6, '0'), colour, quality, gsm, width, length, gross, tare, net: +(gross - tare).toFixed(2), date: d(age + i), origCost: 118 + si * 1.5, status: 'Available', parent: null })
    }
  })
  const scrap = [{ id: 'SC1', date: d(3), weight: 142, colour: 'White', source: 'Slitting offcut' }, { id: 'SC2', date: d(1), weight: 58, colour: 'Red', source: 'Production waste' }]
  const priceList = [
    { id: 'P1', customerId: 'C1', colour: 'White', lastPrice: 160, rmAtSale: 106, qty: 5000, date: d(20) },
    { id: 'P2', customerId: 'C2', colour: 'White', lastPrice: 166, rmAtSale: 106, qty: 200, date: d(15) },
    { id: 'P3', customerId: 'C3', colour: 'Red', lastPrice: 158, rmAtSale: 106, qty: 1000, date: d(10) },
    { id: 'P4', customerId: 'C4', colour: 'Blue', lastPrice: 162, rmAtSale: 106, qty: 3000, date: d(30) },
    { id: 'P5', customerId: 'C5', colour: 'Pink', lastPrice: 165, rmAtSale: 106, qty: 800, date: d(95) },
    { id: 'P6', customerId: 'C6', colour: 'Green', lastPrice: 155, rmAtSale: 106, qty: 1500, date: d(12) },
  ]
  const salesOrders = [
    { id: 'SO-0001', customerId: 'C1', date: d(2), colour: 'White', quality: 'Virgin', gsm: 80, width: 63, length: 1000, qty: 300, uom: 'kg', rate: 168, status: 'Open', type: 'order' },
    { id: 'SO-0002', customerId: 'C3', date: d(1), colour: 'Red', quality: 'First', gsm: 80, width: 63, length: 1000, qty: 250, uom: 'kg', rate: 164, status: 'Open', type: 'order' },
  ]
  const quotations = [{ id: 'QT-0001', customerId: 'C2', date: d(3), colour: 'White', quality: 'First', gsm: 60, width: 40, length: 1000, qty: 200, uom: 'kg', rate: 172, status: 'Sent', type: 'quotation' }]
  const invoices = [
    { id: 'INV-0001', customerId: 'C1', date: d(40), due: d(10), qty: 1000, amount: 160000, status: 'Unpaid', rolls: 20, reminders: [] },
    { id: 'INV-0002', customerId: 'C2', date: d(20), due: d(-25), qty: 600, amount: 99600, status: 'Unpaid', rolls: 12, reminders: [] },
    { id: 'INV-0003', customerId: 'C4', date: d(58), due: d(-2), qty: 1500, amount: 243000, status: 'Unpaid', rolls: 30, reminders: [] },
    { id: 'INV-0004', customerId: 'C3', date: d(30), due: d(15), qty: 500, amount: 79000, status: 'Paid', rolls: 10, reminders: [] },
    { id: 'INV-0005', customerId: 'C6', date: d(35), due: d(5), qty: 750, amount: 116250, status: 'Unpaid', rolls: 15, reminders: [] },
  ]
  let sv = 7; const rnd = () => (sv = (sv * 9301 + 49297) % 233280) / 233280
  const credit = { C1: 30, C2: 45, C3: 15, C4: 60, C5: 30, C6: 30 }
  const cw = ['White', 'White', 'White', 'Red', 'Red', 'Blue', 'Blue', 'Green', 'Green', 'Pink']
  const cpk = { White: 128, Red: 124, Blue: 126, Green: 127, Pink: 116 }
  const NI = 90
  for (let i = 0; i < NI; i++) {
    const age = 178 - 2 * i; const cust = 'C' + (1 + (i * 5 + 1) % 6); const colour = cw[(i * 7 + 3) % 10]
    const qty = Math.round((380 + ((i * 37) % 90)) * (0.78 + 0.44 * i / NI)); const price = 160 + ((i * 3) % 9) + (colour === 'Pink' ? 6 : 0)
    const status = age > 60 ? 'Paid' : age > 34 ? (i % 4 === 0 ? 'Unpaid' : 'Paid') : (i % 2 === 0 ? 'Unpaid' : 'Paid')
    invoices.push({ id: 'INV-' + String(6 + i).padStart(4, '0'), customerId: cust, date: d(age), due: d(age - credit[cust]), qty, amount: qty * price, status, rolls: Math.round(qty / 50), reminders: [], colour, cost: Math.round(qty * (cpk[colour] + (i % 5))) })
  }
  const supM = { RM1: 'Reliance Polymers Dist.', RM2: 'ColorTech Masterbatch', RM3: 'QualityChem Traders' }
  const baseM = { RM1: [4200, 110], RM2: [420, 207], RM3: [320, 178] }
  const extraPO = Array.from({ length: 16 }, (_, i) => { const m = ['RM1', 'RM1', 'RM2', 'RM1', 'RM3'][i % 5]; const [q, r] = baseM[m]; return { id: 'PO-' + String(3 + i).padStart(4, '0'), supplier: supM[m], material: m, qty: Math.round(q * (0.8 + ((i * 7) % 5) / 10)), rate: r + ((i * 3) % 5), date: d(172 - i * 10), status: 'Received' } })
  const deliveries = [], productions = []
  const add = (dt, n) => { const x = new Date(dt); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10) }
  invoices.forEach((inv, k) => {
    if (k < 5) inv.date = d([75, 20, 95, 70, 65][k])
    inv.colour = inv.colour || colours[k % 5]; inv.cost = inv.cost ?? Math.round(inv.qty * (121 + (k % 4)))
    const so = 'SO-' + String(3 + k).padStart(4, '0'), qt = 'QT-' + String(2 + k).padStart(4, '0')
    const base = { customerId: inv.customerId, colour: inv.colour, quality: 'First', gsm: 80, width: 63, length: 1000, qty: inv.qty, uom: 'kg', rate: Math.round(inv.amount / inv.qty) }
    quotations.push({ ...base, id: qt, date: add(inv.date, -14), status: 'Closed', type: 'quotation' })
    salesOrders.push({ ...base, id: so, date: add(inv.date, -7), status: 'Closed', type: 'order' })
    productions.push({ id: 'PRD-' + String(1 + k).padStart(4, '0'), soId: so, customerId: inv.customerId, ordered: inv.qty, issued: Math.round(inv.qty * 1.05), recycled: 0, produced: inv.qty, returned: Math.round(inv.qty * 0.03), waste: Math.round(inv.qty * 0.018), colour: inv.colour, date: add(inv.date, -4), status: 'Completed' })
    deliveries.push({ id: 'DL-' + String(1 + k).padStart(4, '0'), soId: so, customerId: inv.customerId, date: add(inv.date, -1), rolls: [], qty: inv.qty, rate: base.rate, uom: 'kg', status: 'Invoiced' })
  });
  [[40, 'C2'], [28, 'C5'], [16, 'C3'], [9, 'C6']].forEach(([age, c], i) => quotations.push({ id: 'QT-' + String(19 + i).padStart(4, '0'), customerId: c, date: d(age), colour: colours[i], quality: 'First', gsm: 70, width: 40, length: 1000, qty: 400, uom: 'kg', rate: 165, status: 'Sent', type: 'quotation' }))
  const reps = [
    { id: 'R1', name: 'Amit Joshi', region: 'North' }, { id: 'R2', name: 'Rohan Das', region: 'East' },
    { id: 'R3', name: 'Priya Nair', region: 'South' }, { id: 'R4', name: 'Kiran Shah', region: 'West' },
  ]
  const leads = [
    { id: 'L1', date: d(5), name: 'Rajesh Kumar', company: 'Delhi Mask Works', region: 'North', product: 'White 40 GSM', qty: 2000, rep: 'R1', status: 'Under Process' },
    { id: 'L2', date: d(4), name: 'Sourav Ghosh', company: 'Kolkata Packaging', region: 'East', product: 'Blue 60 GSM', qty: 1500, rep: 'R2', status: 'Deal Closed', sold: 5200 },
    { id: 'L3', date: d(3), name: 'Lakshmi Iyer', company: 'Chennai PPE Hub', region: 'South', product: 'Green 50 GSM', qty: 800, rep: 'R3', status: 'Allocated' },
    { id: 'L4', date: d(2), name: 'Hardik Patel', company: 'Rajkot Caps', region: 'West', product: 'White 30 GSM', qty: 1000, rep: 'R4', status: 'Deal Closed', sold: 10400 },
    { id: 'L5', date: d(1), name: 'Neha Singh', company: 'Lucknow Hygiene', region: 'North', product: 'Pink 70 GSM', qty: 600, rep: 'R1', status: 'Lost' },
  ]
  const lnames = ['Mehul Shah', 'Divya Rao', 'Imran Khan', 'Pooja Jain', 'Sandeep Roy', 'Anita Das', 'Farhan Ali', 'Kavita Menon', 'Rakesh Gupta', 'Nisha Verma']
  const lreg = ['North', 'East', 'South', 'West']
  for (let i = 0; i < 130; i++) { const region = lreg[i % 4]; const st = ['Deal Closed', 'Under Process', 'Lost', 'Allocated', 'Under Process', 'Lost', 'Deal Closed'][i % 7]; leads.push({ id: 'L' + (6 + i), date: d(3 + Math.round(i * 1.3)), name: lnames[i % 10], company: lnames[i % 10].split(' ')[1] + ' Traders', region, product: ['White 40 GSM', 'Red 60 GSM', 'Blue 50 GSM', 'Green 80 GSM', 'Pink 70 GSM'][i % 5], qty: 500 + i * 60, rep: reps.find(r => r.region === region).id, status: st, ...(st === 'Deal Closed' ? { sold: 700 + (i * 137) % 1800 } : {}) }) }
  const history = {}
  customers.forEach(c => { history[c.id] = {} })
  history.C1 = { White: 5, Red: 8, Blue: 20 }; history.C2 = { White: 10, Red: 12 }; history.C3 = { Red: 6, Pink: 110, White: 14 }
  history.C4 = { Blue: 25, White: 30 }; history.C5 = { Pink: 95, White: 40 }; history.C6 = { Green: 9, White: 22 }
  const sales = [['White', 18000], ['Red', 9500], ['Blue', 7200], ['Pink', 3100], ['Green', 4600]]
  return {
    settings: { interestPct: 12, overdueEvery: 7, inactiveDays: 90, tareDefault: 1, commission: [{ from: 0, rate: 0 }, { from: 5000, rate: 1 }, { from: 10000, rate: 2 }], companyName: 'Vishal Synthetics' },
    customers, rawMaterials, rolls, scrap, priceList, salesOrders, quotations, invoices, reps, leads, history, sales,
    deliveries, productions, purchases: [
      { id: 'PO-0001', supplier: 'Reliance Polymers Dist.', material: 'RM1', qty: 2500, rate: 111, date: d(6), status: 'Received' },
      { id: 'PO-0002', supplier: 'ColorTech Masterbatch', material: 'RM2', qty: 500, rate: 210, date: d(2), status: 'Ordered' }, ...extraPO,
    ],
    notifications: [], counters: { roll: n, so: 2 + invoices.length, qt: 5 + invoices.length, inv: invoices.length, dl: invoices.length, po: 18, prod: invoices.length, scrap: 2, lead: 135 },
    colours, qualities,
  }
}
