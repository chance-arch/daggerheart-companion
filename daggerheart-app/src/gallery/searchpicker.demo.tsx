import { useState } from 'react'
import { SearchPicker } from '../components/SearchPicker'

const WEAPONS = [
  { value: 'longsword', label: 'Longsword', sub: 'd8+3 phy · Melee', group: 'Primary' },
  { value: 'broadsword', label: 'Broadsword', sub: 'd10+2 phy · Melee', group: 'Primary' },
  { value: 'dagger', label: 'Dagger', sub: 'd6+1 phy · Melee', group: 'Primary' },
  { value: 'greatsword', label: 'Greatsword', sub: 'd10+3 phy · Melee', group: 'Primary' },
  { value: 'warhammer', label: 'Warhammer', sub: 'd12+1 phy · Melee', group: 'Primary' },
  { value: 'shortbow', label: 'Shortbow', sub: 'd6+1 phy · Far', group: 'Primary' },
  { value: 'longbow', label: 'Longbow', sub: 'd8+2 phy · Very Far', group: 'Primary' },
  { value: 'round-shield', label: 'Round Shield', sub: '+2 evasion', group: 'Secondary' },
  { value: 'tower-shield', label: 'Tower Shield', sub: '+3 evasion', group: 'Secondary' },
  { value: 'parry-dagger', label: 'Parry Dagger', sub: 'd4 phy · reactive', group: 'Secondary' },
  { value: 'spiked-buckler', label: 'Spiked Buckler', sub: 'd6 phy · +1 evasion', group: 'Secondary' },
  { value: 'whip', label: 'Whip', sub: 'd6 phy · Close', group: 'Secondary' },
]

export default function SearchPickerDemo() {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SearchPicker
        items={WEAPONS}
        onPick={setPicked}
        placeholder="Swap weapon…"
        maxResults={6}
      />
      <div style={{ fontFamily: 'var(--dh-font-data)', color: 'var(--dh-mut)' }}>
        {picked ? (
          <>Equipped: <strong style={{ color: 'var(--dh-ink-strong)' }}>{picked}</strong></>
        ) : (
          'Type to find a weapon.'
        )}
      </div>
    </div>
  )
}
