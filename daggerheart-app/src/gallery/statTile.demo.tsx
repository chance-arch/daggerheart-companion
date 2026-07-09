import { useState } from 'react'
import { StatTile } from '../components/StatTile'

export default function StatTileDemo() {
  const [picked, setPicked] = useState(false)
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'flex-start' }}>
      <StatTile label="Agility" value={2} signed sub="Sprint·Leap·Maneuver" />
      <StatTile label="Strength" value={1} signed active sub="Lift·Smash·Grapple" />
      <StatTile label="Knowledge" value={-1} signed sub="Recall·Analyze·Comprehend" />
      <StatTile label="Evasion" value={11} />
      <StatTile label="Spellcast" value="+3" sub="Tap to toggle" active={picked} onClick={() => setPicked(p => !p)} />
    </div>
  )
}
