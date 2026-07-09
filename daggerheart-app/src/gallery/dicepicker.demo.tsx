import { useState } from 'react'
import { DicePicker } from '../components/DicePicker'
import { Die, type DieSides } from '../components/Die'

export default function DicePickerDemo() {
  const [d, setD] = useState<DieSides>(20)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <DicePicker value={d} onSelect={setD} />
      <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--dh-mut)', fontFamily:'var(--dh-font-data)' }}>
        Selected: <Die sides={d} size={26} selected /> <b style={{ color:'var(--dh-ink)' }}>d{d}</b>
      </div>
    </div>
  )
}
