import { Button } from '../components'
export default function ButtonDemo() {
  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
      <Button variant="gold">Cast Spell</Button>
      <Button variant="ghost">Roll Duality</Button>
      <Button variant="danger">Remove</Button>
      <Button variant="gold" size="sm">Replenish</Button>
      <Button variant="ghost" size="sm">+ Add</Button>
      <Button variant="gold" disabled>Unaffordable</Button>
    </div>
  )
}
