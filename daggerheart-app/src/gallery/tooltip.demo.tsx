import { Tooltip } from '../components/Tooltip'

export default function TooltipDemo() {
  return (
    <div style={{ display:'flex', gap:24, alignItems:'center', padding:'24px 0' }}>
      <span>
        Evasion{' '}
        <Tooltip content="Evasion 11 = base 10 +1 armor">
          <strong style={{ textDecoration:'underline dotted', cursor:'help' }}>11</strong>
        </Tooltip>
      </span>
      <span>
        Hover (below){' '}
        <Tooltip side="bottom" content="Shown below the trigger.">
          <strong style={{ textDecoration:'underline dotted', cursor:'help' }}>?</strong>
        </Tooltip>
      </span>
    </div>
  )
}
