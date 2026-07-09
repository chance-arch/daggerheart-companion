import { useState } from 'react'
import type { ReactNode } from 'react'
import styles from './Tooltip.module.css'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom'
  className?: string
}

/** A hover/focus popover, used to show derived-stat breakdowns. */
export function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const cls = [styles.wrap, className].filter(Boolean).join(' ')
  const bubbleCls = [styles.bubble, side === 'bottom' ? styles.bottom : styles.top].join(' ')

  return (
    <span
      className={cls}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
      aria-describedby={visible ? 'dh-tooltip' : undefined}
    >
      {children}
      {visible && (
        <span id="dh-tooltip" role="tooltip" className={bubbleCls}>
          {content}
        </span>
      )}
    </span>
  )
}
