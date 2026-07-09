import { Card, Button } from '../components'
export default function CardDemo() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
      <Card title="Unleash Chaos" domain="arcana" type="Spell" meta="Arcana · Lv 1" recall={1}>
        At the beginning of a session, place a number of tokens equal to your Spellcast trait on this card. Spend tokens to deal Nd10 magic damage.
        <div style={{ marginTop:8 }}><Button variant="gold" size="sm">Cast</Button></div>
      </Card>
      <Card title="Natural Familiar" domain="sage" type="Spell" meta="Sage · Lv 2" recall={1}>
        Spend a Hope to summon a small nature spirit to your side until your next rest.
      </Card>
      <Card title="Rune Ward" domain="arcana" type="Spell" meta="Arcana · Lv 1" recall={0}>
        A personal trinket infused with protective magic; spend a Hope to reduce incoming damage by 1d8.
      </Card>
    </div>
  )
}
