import type { HTMLAttributes, ReactNode } from 'react'
import type { Domain } from '../theme/tokens'
import { Tag } from './Tag'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  domain?: Domain
  /** Right-aligned meta line, e.g. "Arcana · Lv 1". */
  meta?: string
  /** Optional recall-cost badge shown top-right. */
  recall?: number
  /** Card type label shown as a tag under the title (e.g. "Spell"). */
  type?: string
  children?: ReactNode
}

/** A color-framed grimoire card (domain loadout / reference). */
export function Card({ title, domain, meta, recall, type, className = '', children, ...rest }: CardProps) {
  const cls = [styles.card, domain ? `dh-domain-${domain}` : '', className].filter(Boolean).join(' ')
  return (
    <div className={cls} {...rest}>
      <div className={styles.head}>
        <div className={styles.titleWrap}>
          <h3 className={styles.title}>{title}</h3>
          {(meta || type) && (
            <div className={styles.metaRow}>
              {type && <Tag domain={domain}>{type}</Tag>}
              {meta && <span className={styles.meta}>{meta}</span>}
            </div>
          )}
        </div>
        {recall != null && (
          <span className={styles.recall} title="Recall cost">{recall}</span>
        )}
      </div>
      {children && <div className={styles.body}>{children}</div>}
    </div>
  )
}
