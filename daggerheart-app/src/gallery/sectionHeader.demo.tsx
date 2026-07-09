import { SectionHeader } from '../components/SectionHeader'

export default function SectionHeaderDemo() {
  return (
    <div style={{ display:'grid', gap:18 }}>
      <SectionHeader>Traits</SectionHeader>
      <SectionHeader hint="Tap to toggle">Domain Cards</SectionHeader>
    </div>
  )
}
