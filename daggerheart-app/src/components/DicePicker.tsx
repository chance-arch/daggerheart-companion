import { Die, type DieSides } from './Die'
import styles from './DicePicker.module.css'

export interface DicePickerProps {
  /** Which dice to show. */
  dice?: DieSides[]
  /** Currently-selected die (controlled). */
  value?: DieSides | null
  /** Called when a die button is pressed. */
  onSelect?: (sides: DieSides) => void
  /** Die graphic size in px. */
  size?: number
  /** Show the "d4 / d6 …" caption under each die. */
  captions?: boolean
  className?: string
}

const DEFAULT: DieSides[] = [4, 6, 8, 10, 12, 20, 100]

/** A row of die-shaped buttons for picking a die type. */
export function DicePicker({
  dice = DEFAULT, value = null, onSelect, size = 34, captions = true, className = '',
}: DicePickerProps) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')} role="group" aria-label="Choose a die">
      {dice.map((d) => {
        const sel = value === d
        return (
          <button key={d} type="button" className={[styles.btn, sel ? styles.btnSel : ''].filter(Boolean).join(' ')}
            aria-pressed={sel} aria-label={`d${d}`} onClick={() => onSelect?.(d)}>
            <Die sides={d} size={size} selected={sel} />
            {captions && <span className={styles.cap}>d{d}</span>}
          </button>
        )
      })}
    </div>
  )
}
