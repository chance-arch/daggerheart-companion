import { useState } from 'react'
import { PipTrack } from '../components/PipTrack'

export default function PipTrackDemo() {
  const [hp, setHp] = useState(6)
  const [stress, setStress] = useState(2)
  const [armor, setArmor] = useState(3)
  const [hope, setHope] = useState(4)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:420 }}>
      <PipTrack kind="hp" label="Hit Points" max={8} value={hp} onChange={setHp} />
      <PipTrack kind="stress" label="Stress" max={6} value={stress} onChange={setStress} />
      <PipTrack kind="armor" label="Armor" max={6} value={armor} onChange={setArmor} />
      <PipTrack kind="hope" label="Hope" max={6} value={hope} onChange={setHope} />
    </div>
  )
}
