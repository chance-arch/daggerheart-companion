import { useState } from 'react'
import { Select } from '../components/Select'

export default function SelectDemo() {
  const [weapon, setWeapon] = useState('longsword')
  return (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Select
        label="Active Weapon"
        value={weapon}
        onChange={setWeapon}
        placeholder="Choose a weapon…"
        options={[
          { value: 'longsword', label: 'Longsword', group: 'Primary' },
          { value: 'dagger', label: 'Dagger', group: 'Primary' },
          { value: 'round-shield', label: 'Round Shield', group: 'Secondary' },
        ]}
      />
      <div style={{ fontFamily: 'var(--dh-font-data)', color: 'var(--dh-mut)' }}>
        Chosen: <strong style={{ color: 'var(--dh-ink-strong)' }}>{weapon}</strong>
      </div>
    </div>
  )
}
