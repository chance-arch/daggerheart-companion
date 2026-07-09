import type { ReactNode } from 'react'
import ButtonDemo from './gallery/button.demo'
import TagDemo from './gallery/tag.demo'
import SectionHeaderDemo from './gallery/sectionHeader.demo'
import PanelDemo from './gallery/panel.demo'
import CardDemo from './gallery/card.demo'
import ModalDemo from './gallery/modal.demo'
import PipTrackDemo from './gallery/piptrack.demo'
import StatTileDemo from './gallery/statTile.demo'
import TooltipDemo from './gallery/tooltip.demo'
import SelectDemo from './gallery/select.demo'
import SearchPickerDemo from './gallery/searchpicker.demo'
import DicePickerDemo from './gallery/dicepicker.demo'
import DualityDiceDemo from './gallery/dualitydice.demo'

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom:34 }}>
      <h2 style={{ fontFamily:'var(--dh-font-heading)', textTransform:'uppercase', letterSpacing:'.14em',
        fontSize:13, color:'var(--dh-gold)', borderBottom:'1px solid var(--dh-line)', paddingBottom:6, margin:'0 0 14px' }}>
        {title}{note && <span style={{ color:'var(--dh-mut)', fontWeight:400, letterSpacing:0, textTransform:'none' }}> — {note}</span>}
      </h2>
      {children}
    </section>
  )
}

export function Gallery() {
  return (
    <div style={{ maxWidth:980, margin:'0 auto', padding:'28px 22px 80px' }}>
      <h1 style={{ fontFamily:'var(--dh-font-display)', fontSize:30, color:'var(--dh-ink-strong)', margin:'0 0 4px' }}>
        Daggerheart Component Gallery
      </h1>
      <p style={{ color:'var(--dh-mut)', marginTop:0, fontFamily:'var(--dh-font-flavor)', fontSize:15 }}>
        The reusable "bricks" — every component in its states, built on the grimoire design tokens.
        These are the parts the full React app will be assembled from.
      </p>
      <div style={{ height:18 }} />

      <Section title="Button" note="gold = primary, ghost = secondary, danger = destructive"><ButtonDemo /></Section>
      <Section title="Tag" note="domain wayfinding + type / trait labels"><TagDemo /></Section>
      <Section title="Section Header"><SectionHeaderDemo /></Section>
      <Section title="Panel" note="bordered card-section container"><PanelDemo /></Section>
      <Section title="Card" note="domain-framed loadout / reference card"><CardDemo /></Section>
      <Section title="Pip Track" note="shaped SVG resource pips — HP / Stress / Armor / Hope"><PipTrackDemo /></Section>
      <Section title="Stat Tile" note="traits + derived stats; tap-to-roll when interactive"><StatTileDemo /></Section>
      <Section title="Tooltip" note="derived-value breakdowns on hover/focus"><TooltipDemo /></Section>
      <Section title="Select" note="native, mobile-friendly dropdown"><SelectDemo /></Section>
      <Section title="Search Picker" note="type-to-filter picker for big equipment tables"><SearchPickerDemo /></Section>
      <Section title="Dice" note="die-shaped buttons — d4 through d100"><DicePickerDemo /></Section>
      <Section title="Duality Dice" note="the core 2d12 Hope/Fear roll"><DualityDiceDemo /></Section>
      <Section title="Modal" note="overlay dialog (Esc / backdrop to close)"><ModalDemo /></Section>
    </div>
  )
}
