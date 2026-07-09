import { Die } from './Die'
import styles from './DualityDice.module.css'

export interface DualityDiceProps {
  /** Rolled Hope-die value (1–12); null = not yet rolled. */
  hope?: number | null
  /** Rolled Fear-die value (1–12); null = not yet rolled. */
  fear?: number | null
  /** Die size in px. */
  size?: number
  className?: string
}

/** The Duality pair: a Hope d12 and a Fear d12, with the resulting outcome. */
export function DualityDice({ hope = null, fear = null, size = 46, className = '' }: DualityDiceProps) {
  const rolled = hope != null && fear != null
  const outcome = rolled ? (hope! > fear! ? 'hope' : fear! > hope! ? 'fear' : 'crit') : null
  const total = rolled ? hope! + fear! : null
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <div className={styles.pair}>
        <div className={styles.col}>
          <Die sides={12} tone="hope" size={size} face={hope ?? '?'} />
          <span className={styles.capHope}>Hope</span>
        </div>
        <div className={styles.col}>
          <Die sides={12} tone="fear" size={size} face={fear ?? '?'} />
          <span className={styles.capFear}>Fear</span>
        </div>
      </div>
      {outcome && (
        <div className={[styles.outcome, styles[outcome]].join(' ')}>
          {outcome === 'hope' && <>Total {total} · <b>with Hope</b></>}
          {outcome === 'fear' && <>Total {total} · <b>with Fear</b></>}
          {outcome === 'crit' && <><b>Critical Success!</b></>}
        </div>
      )}
    </div>
  )
}
