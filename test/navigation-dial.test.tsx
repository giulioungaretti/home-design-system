import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { NavigationDial } from '../src/index.js'
import {
  angularDelta,
  clampDialAngle,
  dialAngle,
  dialPosition,
} from '../src/lib/navigation-dial.js'
import type { NavigationPage } from '../src/index.js'

class TestPointerEvent extends MouseEvent {
  readonly pointerId: number
  readonly isPrimary: boolean

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerId = init.pointerId ?? 1
    this.isPrimary = init.isPrimary ?? true
  }
}

beforeAll(() => vi.stubGlobal('PointerEvent', TestPointerEvent))
afterAll(() => vi.unstubAllGlobals())
afterEach(() => vi.restoreAllMocks())

function Harness() {
  const [value, setValue] = useState<NavigationPage>('home')
  return <NavigationDial value={value} onValueChange={setValue} />
}

function control() {
  return screen.getByRole<HTMLInputElement>('slider', {
    name: 'Page selector',
  })
}

function preparePointer() {
  const input = control()
  const captured = new Set<number>()
  input.setPointerCapture = (id) => {
    captured.add(id)
  }
  input.hasPointerCapture = (id) => captured.has(id)
  input.releasePointerCapture = (id) => {
    captured.delete(id)
  }
  vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 68, 68),
  )
  return input
}

describe('rotary navigation geometry', () => {
  it('maps the three end-stopped detents and their midpoint thresholds', () => {
    expect([0, 1, 2].map(dialAngle)).toEqual([-60, 0, 60])
    expect([-100, -31, -30, 29, 30, 100].map(dialPosition)).toEqual([
      0, 0, 1, 1, 2, 2,
    ])
    expect(clampDialAngle(-500)).toBe(-60)
    expect(clampDialAngle(500)).toBe(60)
  })

  it('crosses the angular seam without jumping a whole revolution', () => {
    expect(angularDelta(179, -179)).toBe(2)
    expect(angularDelta(-179, 179)).toBe(-2)
    expect(angularDelta(350, 10)).toBe(20)
  })
})

describe('NavigationDial', () => {
  it('exposes native range semantics and responds to controlled updates', () => {
    const change = vi.fn()
    const result = render(
      <NavigationDial value="home" onValueChange={change} />,
    )
    expect(control()).toHaveAttribute('min', '0')
    expect(control()).toHaveAttribute('max', '2')
    expect(control()).toHaveAttribute('step', '1')
    expect(control()).toHaveAttribute('aria-valuetext', 'Home')
    fireEvent.change(control(), { target: { value: '1' } })
    expect(change).toHaveBeenCalledWith('cv')
    result.rerender(<NavigationDial value="blog" onValueChange={change} />)
    expect(control()).toHaveValue('2')
    expect(control()).toHaveAttribute('aria-valuetext', 'Blog')
  })

  it('lets the page labels select the same controlled value', async () => {
    render(<Harness />)
    const user = userEvent.setup()
    const group = within(
      screen.getByRole('group', { name: 'Rotary navigation' }),
    )
    await user.click(group.getByRole('button', { name: 'Blog' }))
    expect(control()).toHaveValue('2')
    expect(group.getByRole('button', { name: 'Blog' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(group.getByRole('button', { name: 'Home' }))
    expect(control()).toHaveValue('0')
  })

  it('turns relative to the grab point and commits only on release', () => {
    render(<Harness />)
    const input = preparePointer()
    fireEvent.pointerDown(input, { clientX: 34, clientY: 8, button: 0 })
    fireEvent.pointerMove(input, { clientX: 60, clientY: 19 })
    expect(input).toHaveValue('0')
    expect(input.parentElement).toHaveAttribute('data-dragging', 'true')
    fireEvent.pointerUp(input, { clientX: 60, clientY: 19 })
    expect(input).toHaveValue('1')
    expect(input).toHaveAttribute('aria-valuetext', 'CV')
    expect(input.hasPointerCapture(1)).toBe(false)
    expect(input.parentElement).toHaveAttribute('data-dragging', 'false')
  })

  it.each(['pointerCancel', 'lostPointerCapture', 'escape', 'blur'] as const)(
    'restores the selected detent on %s instead of navigating',
    (action) => {
      render(<Harness />)
      const input = preparePointer()
      fireEvent.pointerDown(input, { clientX: 34, clientY: 8, button: 0 })
      fireEvent.pointerMove(input, { clientX: 60, clientY: 19 })
      if (action === 'escape') fireEvent.keyDown(input, { key: 'Escape' })
      else if (action === 'blur') fireEvent.blur(input)
      else fireEvent[action](input)
      expect(input).toHaveValue('0')
      expect(input.parentElement).toHaveAttribute('data-dragging', 'false')
    },
  )

  it('ignores secondary pointers and right-clicks', () => {
    render(<Harness />)
    const input = preparePointer()
    fireEvent.pointerDown(input, { button: 0, isPrimary: false })
    fireEvent.pointerDown(input, { button: 2 })
    expect(input.parentElement).toHaveAttribute('data-dragging', 'false')
  })

  it('changes detents with focused scrolling, throttles and stops at the ends', () => {
    render(<Harness />)
    const input = control()
    const unfocused = new WheelEvent('wheel', { deltaY: 100, cancelable: true })
    fireEvent(input, unfocused)
    expect(unfocused.defaultPrevented).toBe(false)
    expect(input).toHaveValue('0')
    input.focus()
    const clock = vi.spyOn(performance, 'now').mockReturnValue(1000)
    const focused = new WheelEvent('wheel', { deltaY: 100, cancelable: true })
    fireEvent(input, focused)
    expect(focused.defaultPrevented).toBe(true)
    expect(input).toHaveValue('1')
    fireEvent.wheel(input, { deltaY: 100 })
    expect(input).toHaveValue('1')
    clock.mockReturnValue(1500)
    fireEvent.wheel(input, { deltaY: 100 })
    expect(input).toHaveValue('2')
    clock.mockReturnValue(2000)
    fireEvent.wheel(input, { deltaY: 100 })
    expect(input).toHaveValue('2')
    clock.mockReturnValue(2500)
    fireEvent.wheel(input, { deltaY: -100 })
    expect(input).toHaveValue('1')
    fireEvent.wheel(input, { deltaY: 100, ctrlKey: true })
    expect(input).toHaveValue('1')
  })
})
