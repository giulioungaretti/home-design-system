import { useEffect, useId, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import {
  angularDelta,
  clampDialAngle,
  rotaryAngle,
  rotaryPosition,
} from '../lib/navigation-dial.js'
import { cn } from '../lib/utils.js'

export type DialOption<Value extends string = string> = {
  value: Value
  label: string
}

export type RotaryDialProps<Value extends string> = {
  options: readonly DialOption<Value>[]
  value: NoInfer<Value>
  onValueChange: (value: NoInfer<Value>) => void
  label: string
  groupLabel?: string
  size?: 'default' | 'sm'
  helpText?: string
  className?: string
}

type Drag = {
  pointerId: number
  previousAngle: number
  angle: number
  centerX: number
  centerY: number
  selection: string
  optionValues: readonly string[]
}

function pointerAngle(event: PointerEvent<HTMLInputElement>, drag: Drag) {
  return (
    Math.atan2(event.clientX - drag.centerX, drag.centerY - event.clientY) *
    (180 / Math.PI)
  )
}

export function RotaryDial<Value extends string>({
  options,
  value,
  onValueChange,
  label,
  groupLabel = label,
  size = 'default',
  helpText = 'Turn to select',
  className,
}: RotaryDialProps<Value>) {
  const input = useRef<HTMLInputElement>(null)
  const drag = useRef<Drag | null>(null)
  const lastWheel = useRef(-Infinity)
  const [previewAngle, setPreviewAngle] = useState<number | null>(null)
  const helpId = useId()
  const count = options.length
  const index = options.findIndex((option) => option.value === value)
  if (count < 2) throw new Error('RotaryDial requires at least two options.')
  if (new Set(options.map((option) => option.value)).size !== count)
    throw new Error('RotaryDial option values must be unique.')
  if (!label.trim() || !groupLabel.trim() || options.some((option) => !option.label.trim()))
    throw new Error('RotaryDial requires nonempty accessible labels.')
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
      const next = Math.max(0, Math.min(count - 1, index + Math.sign(delta)))
      if (next !== index) onValueChange(options[next]!.value)
    }
    control.addEventListener('wheel', wheel, { passive: false })
    return () => control.removeEventListener('wheel', wheel)
  }, [count, index, onValueChange, options])

  function beginDrag(event: PointerEvent<HTMLInputElement>) {
    if (!event.isPrimary || event.button !== 0) return
    event.preventDefault()
    const control = event.currentTarget
    control.focus({ preventScroll: true })
    const bounds = control.getBoundingClientRect()
    const next: Drag = {
      pointerId: event.pointerId,
      previousAngle: 0,
      angle: rotaryAngle(index, count),
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2,
      selection: value,
      optionValues: options.map((option) => option.value),
    }
    next.previousAngle = pointerAngle(event, next)
    drag.current = next
    control.setPointerCapture(event.pointerId)
    setPreviewAngle(next.angle)
  }

  function turn(event: PointerEvent<HTMLInputElement>) {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    if (
      current.selection !== value ||
      current.optionValues.length !== count ||
      current.optionValues.some((optionValue, position) => optionValue !== options[position]?.value)
    ) {
      cancelDrag(event.currentTarget)
      return
    }
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
    if (!drag.current) return
    drag.current = null
    setPreviewAngle(null)
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    const next = options[rotaryPosition(current.angle, count)]!.value
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
      className={cn('navigation-dial', className)}
      data-size={size}
      style={size === 'default' ? { minWidth: Math.max(180, count * 44) } : undefined}
      role="group"
      aria-label={groupLabel}
    >
      <div className="navigation-dial-labels">
        {options.map((page) => (
          <button
            type="button"
            key={page.value}
            aria-label={page.label}
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
        {options.map((page, position) => (
          <span
            className="navigation-dial-detent"
            key={page.value}
            style={{ transform: `rotate(${rotaryAngle(position, count)}deg)` }}
            data-selected={value === page.value}
            aria-hidden="true"
          />
        ))}
        <span
          className="navigation-dial-face"
          style={{
            transform: `rotate(${previewAngle ?? rotaryAngle(index, count)}deg)`,
          }}
          aria-hidden="true"
        />
        <input
          ref={input}
          type="range"
          min={0}
          max={count - 1}
          step={1}
          value={index}
          aria-label={label}
          aria-valuetext={options[index]!.label}
          aria-describedby={helpId}
          onChange={(event) => {
            const page = options[event.currentTarget.valueAsNumber]
            if (!page) throw new Error('Invalid rotary navigation position.')
            onValueChange(page.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && drag.current) {
              event.preventDefault()
              event.stopPropagation()
              cancelDrag(event.currentTarget)
            }
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
      <p id={helpId} className={size === 'sm' ? 'sr-only' : 'navigation-dial-help'}>
        {helpText}
        <span className="sr-only">
          . Drag the knob, use arrow keys or Home and End, or scroll while
          focused. You can also press an option label.
        </span>
      </p>
    </div>
  )
}
