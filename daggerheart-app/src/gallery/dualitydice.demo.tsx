import { useState } from 'react'
import { DualityDice } from '../components/DualityDice'
import { Button } from '../components/Button'

export default function DualityDiceDemo() {
  const [roll, setRoll] = useState<{ h: number | null; f: number | null }>({ h: null, f: null })
  const d12 = () => 1 + Math.floor(Math.random() * 12)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, alignItems:'flex-start' }}>
      <DualityDice hope={roll.h} fear={roll.f} />
      <Button variant="gold" onClick={() => setRoll({ h: d12(), f: d12() })}>Roll Duality</Button>
    </div>
  )
}
