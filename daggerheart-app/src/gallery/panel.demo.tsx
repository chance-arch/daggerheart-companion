import { Panel } from '../components/Panel'

export default function PanelDemo() {
  return (
    <div style={{ display:'grid', gap:12 }}>
      <Panel label="Background">
        Raised among the wandering star-readers of the high desert, Theron learned to listen before he learned to speak.
      </Panel>
      <Panel>
        A plain panel with no label bar — just bordered body content.
      </Panel>
    </div>
  )
}
