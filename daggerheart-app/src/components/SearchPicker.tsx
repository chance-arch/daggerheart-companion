import { useMemo, useState } from 'react'
import styles from './SearchPicker.module.css'

export interface SearchPickerItem {
  value: string
  label: string
  sub?: string
  /** When present, matching items are shown under a group header. */
  group?: string
}

export interface SearchPickerProps {
  items: SearchPickerItem[]
  onPick: (value: string) => void
  placeholder?: string
  maxResults?: number
  className?: string
}

/** Type-to-filter picker for swapping items from large tables. */
export function SearchPicker({
  items,
  onPick,
  placeholder = 'Search…',
  maxResults = 30,
  className = '',
}: SearchPickerProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [] as SearchPickerItem[]
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        (it.sub ? it.sub.toLowerCase().includes(q) : false),
    )
  }, [items, query])

  const visible = filtered.slice(0, maxResults)
  const overflow = filtered.length - visible.length

  // Build display rows with group headers interleaved.
  const rows = useMemo(() => {
    const out: { kind: 'header' | 'item'; key: string; item?: SearchPickerItem; label?: string }[] = []
    let lastGroup: string | undefined
    for (const it of visible) {
      if (it.group && it.group !== lastGroup) {
        out.push({ kind: 'header', key: `h:${it.group}`, label: it.group })
        lastGroup = it.group
      }
      out.push({ kind: 'item', key: `i:${it.value}`, item: it })
    }
    return out
  }, [visible])

  const open = focused && query.trim().length > 0

  const handlePick = (value: string) => {
    onPick(value)
    setQuery('')
    setFocused(false)
  }

  const cls = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <input
        type="text"
        className={styles.input}
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
      />
      {open && (
        <div className={styles.dropdown}>
          {rows.length === 0 ? (
            <div className={styles.empty}>No matches</div>
          ) : (
            rows.map((r) =>
              r.kind === 'header' ? (
                <div key={r.key} className={styles.groupHeader}>
                  {r.label}
                </div>
              ) : (
                <button
                  key={r.key}
                  type="button"
                  className={styles.row}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePick(r.item!.value)}
                >
                  <span className={styles.rowLabel}>{r.item!.label}</span>
                  {r.item!.sub && <span className={styles.rowSub}>{r.item!.sub}</span>}
                </button>
              ),
            )
          )}
          {overflow > 0 && (
            <div className={styles.moreHint}>+{overflow} more — keep typing</div>
          )}
        </div>
      )}
    </div>
  )
}
