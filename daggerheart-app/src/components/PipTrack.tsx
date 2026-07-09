import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { ResourceKind } from '../theme/tokens'
import styles from './PipTrack.module.css'

export interface PipTrackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Which resource this track represents. */
  kind: ResourceKind
  /** Total number of pips. */
  max: number
  /** How many pips are filled (0..max). */
  value: number
  /** If provided, pips + steppers become interactive. */
  onChange?: (next: number) => void
  /** Pip size in px. */
  size?: number
  /** Optional caption shown before the row. */
  label?: string
  /** Show the − / + stepper buttons + readout (defaults to true when interactive). */
  steppers?: boolean
}

const COLORS: Record<ResourceKind, { fillVar: string; edgeVar: string }> = {
  hp: { fillVar: '--dh-hp', edgeVar: '--dh-hp-edge' },
  stress: { fillVar: '--dh-stress', edgeVar: '--dh-stress-edge' },
  armor: { fillVar: '--dh-armor', edgeVar: '--dh-armor-edge' },
  hope: { fillVar: '--dh-hope', edgeVar: '--dh-hope-edge' },
}

const SHAPES: Record<ResourceKind, { tag: 'path' | 'polygon'; attrs: Record<string, string> }> = {
  // symmetric heart, inset within 2.5..21.5 so the stroke never clips
  hp: { tag: 'path', attrs: { d: 'M12 20C4.6 14.9 2.6 11 2.6 7.9C2.6 5.4 4.5 3.7 6.7 3.7C8.7 3.7 10.5 5 12 7.1C13.5 5 15.3 3.7 17.3 3.7C19.5 3.7 21.4 5.4 21.4 7.9C21.4 11 19.4 14.9 12 20Z' } },
  // upright triangle, inset
  stress: { tag: 'polygon', attrs: { points: '12,4 20.4,19.6 3.6,19.6' } },
  // shield, inset and symmetric
  armor: { tag: 'path', attrs: { d: 'M12 3.2L19.6 6V11.4C19.6 15.8 16.4 18.9 12 20.8C7.6 18.9 4.4 15.8 4.4 11.4V6L12 3.2Z' } },
  // diamond, inset
  hope: { tag: 'polygon', attrs: { points: '12,3.2 20.8,12 12,20.8 3.2,12' } },
}

const ARIA_KIND: Record<ResourceKind, string> = { hp: 'Hit Points', stress: 'Stress', armor: 'Armor', hope: 'Hope' }

export function PipTrack({
  kind, max, value, onChange, size = 22, label, steppers, className = '', ...rest
}: PipTrackProps) {
  const { fillVar, edgeVar } = COLORS[kind]
  const shape = SHAPES[kind]
  const interactive = typeof onChange === 'function'
  const showSteppers = (steppers ?? interactive) && interactive
  const cls = [styles.track, className].filter(Boolean).join(' ')
  const clamp = (n: number) => Math.max(0, Math.min(max, n))

  const apply = (i: number) => {
    if (!onChange) return
    onChange(i + 1 === value ? i : i + 1) // click top-filled pip to decrement
  }
  const onKey = (e: KeyboardEvent<HTMLSpanElement>, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(i) }
  }

  return (
    <div className={cls} {...rest}>
      <div className={styles.header}>
        {label && <span className={styles.label}>{label}</span>}
        {showSteppers && (
          <div className={styles.controls}>
            <span className={styles.readout}>{value} / {max}</span>
            <button type="button" className={styles.step} aria-label={`Decrease ${ARIA_KIND[kind]}`}
              disabled={value <= 0} onClick={() => onChange!(clamp(value - 1))}>−</button>
            <button type="button" className={styles.step} aria-label={`Increase ${ARIA_KIND[kind]}`}
              disabled={value >= max} onClick={() => onChange!(clamp(value + 1))}>+</button>
          </div>
        )}
      </div>
      <div className={styles.row}>
        {Array.from({ length: max }, (_, i) => {
          const filled = i < value
          const pipStyle = { fill: filled ? `var(${fillVar})` : 'transparent', stroke: `var(${edgeVar})` }
          const Shape = shape.tag
          const svg = (
            <svg className={styles.pip} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
              <Shape {...shape.attrs} style={pipStyle} strokeWidth={1.4} strokeLinejoin="round" shapeRendering="geometricPrecision" />
            </svg>
          )
          if (!interactive) return <span key={i} className={styles.cell}>{svg}</span>
          return (
            <span key={i} className={[styles.cell, styles.interactive].join(' ')}
              role="button" tabIndex={0} aria-label={`${ARIA_KIND[kind]} ${i + 1} of ${max}`}
              onClick={() => apply(i)} onKeyDown={(e) => onKey(e, i)}>{svg}</span>
          )
        })}
      </div>
    </div>
  )
}
