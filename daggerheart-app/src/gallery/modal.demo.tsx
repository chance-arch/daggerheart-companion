import { useState } from 'react'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'

export default function ModalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="gold" onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm Rest"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" size="sm" onClick={() => setOpen(false)}>Take Rest</Button>
          </>
        }
      >
        Taking a short rest lets you clear Stress and recover Hit Points. Spend your downtime
        moves wisely — the GM may gain Fear. Click the backdrop or press Escape to dismiss.
      </Modal>
    </>
  )
}
