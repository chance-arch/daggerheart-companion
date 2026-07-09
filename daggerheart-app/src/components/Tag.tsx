import type { HTMLAttributes } from 'react'
import type { Domain } from '../theme/tokens'
import styles from './Tag.module.css'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** When set, the tag is tinted with that domain's color. */
  domain?: Domain
  /** Visual weight: solid filled vs subtle outline. */
  tone?: 'solid' | 'soft'
}

/** Small uppercase pill for domain / card-type / trait labels. */
export function Tag({ domain, tone = 'soft', className = '', style, children, ...rest }: TagProps) {
  const cls = [styles.tag, styles[tone], domain ? `dh-domain-${domain}` : '', className]
    .filter(Boolean).join(' ')
  return <span className={cls} style={style} {...rest}>{children}</span>
}
