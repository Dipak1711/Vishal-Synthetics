import React, { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
export default function Barcode({ value, h = 50 }) {
  const r = useRef()
  useEffect(() => { try { JsBarcode(r.current, value, { format: 'CODE128', height: h, displayValue: true, fontSize: 12, margin: 2 }) } catch {} }, [value])
  return <svg ref={r} />
}
export function Sticker({ roll }) {
  return <div className="sticker print-area">
    <div className="t"><span>VISHAL SYNTHETICS</span><span>{roll.id}</span></div>
    <div style={{ textAlign: 'center' }}><Barcode value={roll.id} /></div>
    <table><tbody>
      <tr><td>Colour: <b>{roll.colour}</b></td><td>Quality: <b>{roll.quality}</b></td></tr>
      <tr><td>GSM: <b>{roll.gsm}</b></td><td>Width: <b>{roll.width}"</b></td></tr>
      <tr><td>Length: <b>{roll.length} m</b></td><td>Date: <b>{roll.date}</b></td></tr>
      <tr><td>Gross: <b>{roll.gross} kg</b></td><td>Net: <b>{roll.net} kg</b></td></tr>
    </tbody></table></div>
}
