import type { HTMLAttributes } from 'react'
import styles from './StatTile.module.css'

export interface StatTileProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: number | string
  /** When value is a number and signed, render as "+2"/"0"/"-1". */
  signed?: boolean
  /** Small caption under the value, e.g. "Sprint·Leap·Maneuver". */
  sub?: string
  /** Gold ring/glow to mark selected / active for spellcast. */
  active?: boolean
  /** When set, the tile becomes an interactive button. */
  onClick?: () => void
}

function formatValue(value: number | string, signed?: boolean) {
  if (signed && typeof value === 'number') {
    return value > 0 ? `+${value}` : `${value}`
  }
  return value
}

/** A boxed stat/trait tile (traits, Evasion/Armor boxes). */
export function StatTile({ label, value, signed, sub, active, onClick, className = '', ...rest }: StatTileProps) {
  const cls = [styles.tile, active ? styles.active : '', onClick ? styles.button : '', className].filter(Boolean).join(' ')
  const content = (
    <>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{formatValue(value, signed)}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </>
  )
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} aria-pressed={active} {...(rest as HTMLAttributes<HTMLButtonElement>)}>
        {content}
      </button>
    )
  }
  return <div className={cls} {...rest}>{content}</div>
}
