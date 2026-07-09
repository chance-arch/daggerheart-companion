import { useMemo } from 'react'
import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
  /** When present, the option is nested under an <optgroup label={group}>. */
  group?: string
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

/** Styled wrapper around a native <select> — keeps native a11y + mobile pickers. */
export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  className = '',
  ...rest
}: SelectProps) {
  const groups = useMemo(() => {
    const order: string[] = []
    const byGroup = new Map<string, SelectOption[]>()
    for (const opt of options) {
      const key = opt.group ?? ''
      if (!byGroup.has(key)) {
        byGroup.set(key, [])
        order.push(key)
      }
      byGroup.get(key)!.push(opt)
    }
    return order.map((key) => ({ group: key, items: byGroup.get(key)! }))
  }, [options])

  const cls = [styles.field, className].filter(Boolean).join(' ')

  return (
    <label className={cls}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.selectWrap}>
        <select
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {groups.map(({ group, items }) =>
            group ? (
              <optgroup key={group} label={group}>
                {items.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              items.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            ),
          )}
        </select>
        <span className={styles.caret} aria-hidden="true">▾</span>
      </div>
    </label>
  )
}
