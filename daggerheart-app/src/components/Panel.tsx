import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Panel.module.css'

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional uppercase label bar shown at the top of the panel. */
  label?: string
  children?: ReactNode
}

/** A bordered content container (the "card-section" look). */
export function Panel({ label, children, className = '', ...rest }: PanelProps) {
  const cls = [styles.panel, className].filter(Boolean).join(' ')
  return (
    <div className={cls} {...rest}>
      {label && <div className={styles.label}>{label}</div>}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  )
}
