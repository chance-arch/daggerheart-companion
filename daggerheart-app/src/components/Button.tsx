import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'gold' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

/** Primary action control. `gold` = main action, `ghost` = secondary, `danger` = destructive. */
export function Button({
  variant = 'ghost', size = 'md', fullWidth = false,
  className = '', children, ...rest
}: ButtonProps) {
  const cls = [styles.btn, styles[variant], styles[size], fullWidth ? styles.full : '', className]
    .filter(Boolean).join(' ')
  return <button className={cls} {...rest}>{children}</button>
}
