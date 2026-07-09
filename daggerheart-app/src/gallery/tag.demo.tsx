import { Tag } from '../components'
import { DOMAINS } from '../theme/tokens'
export default function TagDemo() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {DOMAINS.map(d => <Tag key={d} domain={d}>{d}</Tag>)}
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        <Tag domain="arcana" tone="solid">Spell</Tag>
        <Tag domain="sage" tone="solid">Ability</Tag>
        <Tag tone="soft">Homebrew</Tag>
        <Tag tone="solid">Physical</Tag>
      </div>
    </div>
  )
}
