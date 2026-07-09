import type { ReactNode, SVGProps } from 'react'
import styles from './Die.module.css'

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20 | 100

interface Geo { body: ReactNode; label: string; labelY: number; fs: number }

// Each die: a polyhedral silhouette (inset within 0..24 so strokes never clip) + centered label.
const GEO: Record<DieSides, Geo> = {
  4:  { body: (<><polygon className={styles.face} points="12,3.5 20.5,19.5 3.5,19.5"/><path className={styles.facet} d="M12 3.5 L12 19.5 M12 3.5 L7 19.5 M12 3.5 L17 19.5"/></>), label:'4',  labelY:14.6, fs:7.5 },
  6:  { body: (<rect className={styles.face} x="3.8" y="3.8" width="16.4" height="16.4" rx="3.2"/>),                                                                                              label:'6',  labelY:12,   fs:9   },
  8:  { body: (<><polygon className={styles.face} points="12,2.8 21.2,12 12,21.2 2.8,12"/><path className={styles.facet} d="M2.8 12 L21.2 12 M12 2.8 L12 21.2"/></>),                              label:'8',  labelY:12,   fs:8   },
  10: { body: (<><polygon className={styles.face} points="12,2.6 20,8.5 17.5,15 12,21.4 6.5,15 4,8.5"/><path className={styles.facet} d="M4 8.5 L20 8.5 M12 2.6 L12 13"/></>),                     label:'10', labelY:13,   fs:7   },
  12: { body: (<polygon className={styles.face} points="12,2.8 21.1,9.4 17.6,20.2 6.4,20.2 2.9,9.4"/>),                                                                                          label:'12', labelY:13.5, fs:7   },
  20: { body: (<><polygon className={styles.face} points="12,2.6 20.5,7.4 20.5,16.6 12,21.4 3.5,16.6 3.5,7.4"/><polygon className={styles.facet} points="12,6.5 17.5,16 6.5,16"/></>),            label:'20', labelY:14.2, fs:6.6 },
  100:{ body: (<><polygon className={styles.face} points="12,2.6 20,8.5 17.5,15 12,21.4 6.5,15 4,8.5"/><path className={styles.facet} d="M4 8.5 L20 8.5"/></>),                                   label:'00', labelY:13,   fs:7   },
}

export type DieTone = 'gold' | 'hope' | 'fear'

export interface DieProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  sides: DieSides
  size?: number
  selected?: boolean
  /** Color theme — gold (default), hope, or fear (for Duality dice). */
  tone?: DieTone
  /** Override the displayed face text (e.g. a rolled value); defaults to the side count. */
  face?: string | number
}

/** A polyhedral die graphic (silhouette + face number). */
export function Die({ sides, size = 30, selected = false, tone = 'gold', face, className = '', ...rest }: DieProps) {
  const g = GEO[sides]
  const toneCls = tone === 'hope' ? styles.toneHope : tone === 'fear' ? styles.toneFear : ''
  const cls = [styles.die, selected ? styles.selected : '', toneCls, className].filter(Boolean).join(' ')
  return (
    <svg className={cls} viewBox="0 0 24 24" width={size} height={size}
         shapeRendering="geometricPrecision" {...rest}>
      {g.body}
      <text className={styles.label} x="12" y={g.labelY} fontSize={g.fs} dominantBaseline="central">{face ?? g.label}</text>
    </svg>
  )
}
