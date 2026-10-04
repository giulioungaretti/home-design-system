import { useEffect, useId, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import {
  angularDelta,
  clampDialAngle,
  dialAngle,
  dialPages,
  dialPosition,
} from '../lib/navigation-dial.js'
import type { NavigationPage } from '../lib/navigation-dial.js'

type Drag = {
  pointerId: number
  previousAngle: number
  angle: number
  centerX: number
  centerY: number
}

function pointerAngle(event: PointerEvent<HTMLInputElement>, drag: Drag) {
  return (
    Math.atan2(event.clientX - drag.centerX, drag.centerY - event.clientY) *
    (180 / Math.PI)
  )
}

export function NavigationDial({
  value,
  onValueChange,
}: {
  value: NavigationPage
  onValueChange: (value: NavigationPage) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const drag = useRef<Drag | null>(null)
  const lastWheel = useRef(-Infinity)
  const [previewAngle, setPreviewAngle] = useState<number | null>(null)
  const helpId = useId()
  const index = dialPages.findIndex((page) => page.value === value)
  if (index < 0) throw new Error(`Unknown rotary navigation value: ${value}`)

  useEffect(() => {
    const control = input.current
    if (!control) return
    function wheel(event: WheelEvent) {
      if (document.activeElement !== control || drag.current) return
      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX
      if (!delta || event.ctrlKey) return
      event.preventDefault()
      const now = performance.now()
      if (now - lastWheel.current < 180) return
      lastWheel.current = now
      const next = Math.max(0, Math.min(2, index + Math.sign(delta)))
      if (next !== index) onValueChange(dialPages[next]!.value)
    }
    control.addEventListener('wheel', wheel, { passive: false })
    return () => control.removeEventListener('wheel', wheel)
  }, [index, onValueChange])

  function beginDrag(event: PointerEvent<HTMLInputElement>) {
    if (!event.isPrimary || event.button !== 0) return
    event.preventDefault()
    const control = event.currentTarget
    control.focus({ preventScroll: true })
    const bounds = control.getBoundingClientRect()
    const next: Drag = {
      pointerId: event.pointerId,
      previousAngle: 0,
      angle: dialAngle(index),
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2,
    }
    next.previousAngle = pointerAngle(event, next)
    drag.current = next
    control.setPointerCapture(event.pointerId)
    setPreviewAngle(next.angle)
  }

  function turn(event: PointerEvent<HTMLInputElement>) {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    // Near the axle, an angle is unstable; keep the last meaningful position.
    if (
      Math.hypot(
        event.clientX - current.centerX,
        event.clientY - current.centerY,
      ) < 8
    )
      return
    const angle = pointerAngle(event, current)
    current.angle = clampDialAngle(
      current.angle + angularDelta(current.previousAngle, angle),
    )
    current.previousAngle = angle
    setPreviewAngle(current.angle)
  }

  function endDrag(event: PointerEvent<HTMLInputElement>, commit: boolean) {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    if (commit) turn(event)
    drag.current = null
    setPreviewAngle(null)
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    const next = dialPages[dialPosition(current.angle)]!.value
    if (commit && next !== value) onValueChange(next)
  }

  function cancelDrag(control: HTMLInputElement) {
    const current = drag.current
    if (!current) return
    drag.current = null
    setPreviewAngle(null)
    if (control.hasPointerCapture(current.pointerId))
      control.releasePointerCapture(current.pointerId)
  }

  return (
    <div
      className="navigation-dial"
      role="group"
      aria-label="Rotary navigation"
    >
      <div className="navigation-dial-labels">
        {dialPages.map((page) => (
          <button
            type="button"
            key={page.value}
            aria-pressed={value === page.value}
            onClick={() => onValueChange(page.value)}
          >
            {page.label}
          </button>
        ))}
      </div>
      <div
        className="mock-dial navigation-dial-knob"
        data-dragging={previewAngle !== null}
      >
        {dialPages.map((page, position) => (
          <span
            className="navigation-dial-detent"
            key={page.value}
            style={{ transform: `rotate(${dialAngle(position)}deg)` }}
            data-selected={value === page.value}
            aria-hidden="true"
          />
        ))}
        <span
          className="navigation-dial-face"
          style={{
            transform: `rotate(${previewAngle ?? dialAngle(index)}deg)`,
          }}
          aria-hidden="true"
        />
        <input
          ref={input}
          type="range"
          min={0}
          max={2}
          step={1}
          value={index}
          aria-label="Page selector"
          aria-valuetext={dialPages[index]!.label}
          aria-describedby={helpId}
          onChange={(event) => {
            const page = dialPages[event.currentTarget.valueAsNumber]
            if (!page) throw new Error('Invalid rotary navigation position.')
            onValueChange(page.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') cancelDrag(event.currentTarget)
            if (
              drag.current &&
              [
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
              ].includes(event.key)
            )
              event.preventDefault()
          }}
          onBlur={(event) => cancelDrag(event.currentTarget)}
          onPointerDown={beginDrag}
          onPointerMove={turn}
          onPointerUp={(event) => endDrag(event, true)}
          onPointerCancel={(event) => endDrag(event, false)}
          onLostPointerCapture={(event) => endDrag(event, false)}
        />
      </div>
      <p id={helpId} className="navigation-dial-help">
        Turn to select
        <span className="sr-only">
          . Drag the knob, use arrow keys or Home and End, or scroll while
          focused. You can also press a page label.
        </span>
      </p>
    </div>
  )
}
