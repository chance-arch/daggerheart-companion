import type { HTMLAttributes } from 'react'
import styles from './SectionHeader.module.css'

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Heading text (rendered all-caps). */
  children: React.ReactNode
  /** Optional right-aligned muted hint, e.g. "TAP TO TOGGLE". */
  hint?: string
}

/** All-caps gold section heading with diamond ornaments and a thin gold rule. */
export function SectionHeader({ children, hint, className = '', ...rest }: SectionHeaderProps) {
  const cls = [styles.header, className].filter(Boolean).join(' ')
  return (
    <div className={cls} {...rest}>
      <span className={styles.center}>
        <span className={styles.ornament} aria-hidden="true">{'❖'}</span>
        <span className={styles.title}>{children}</span>
        <span className={styles.ornament} aria-hidden="true">{'❖'}</span>
      </span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
