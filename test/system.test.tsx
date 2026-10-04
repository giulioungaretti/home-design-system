import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Button, buttonVariants, Switch, TooltipProvider, IconButton, Panel, Status, cn,
} from '../src/index.js'

describe('reusable system', () => {
  it('merges conflicting utilities without losing conditional classes', () => {
    expect(cn('px-2', false, { 'text-sm': true }, 'px-5')).toBe('text-sm px-5')
  })
  it('provides typed material and size variants', () => {
    expect(buttonVariants({ variant: 'secondary', size: 'icon' })).toContain(
      'control-signal',
    )
    expect(buttonVariants({ size: 'icon' })).toContain('rounded-full')
    expect(buttonVariants({ variant: 'outline' })).toContain('control-raised')
  })
  it('composes a semantic anchor without nesting a button', () => {
    render(
      <Button asChild variant="outline">
        <a href="#usage" download>
          Download
        </a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'download',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
  it('requires a named circular icon control and supports pressed state', async () => {
    const onClick = vi.fn()
    render(
      <TooltipProvider>
        <IconButton label="Reset demo" aria-pressed onClick={onClick}>
          <span aria-hidden="true">↻</span>
        </IconButton>
      </TooltipProvider>,
    )
    const button = screen.getByRole('button', { name: 'Reset demo' })
    expect(button).toHaveClass('rounded-full')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })
  it('does not activate disabled buttons', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Unavailable
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
  it('supports keyboard switching and disabled switches', async () => {
    const onChange = vi.fn()
    render(
      <>
        <Switch aria-label="Demo power" onCheckedChange={onChange} />
        <Switch disabled aria-label="Unavailable" />
      </>,
    )
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard(' ')
    expect(screen.getByRole('switch', { name: 'Demo power' })).toBeChecked()
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('switch', { name: 'Unavailable' })).toBeDisabled()
  })
  it('keeps status labels and labeled semantic panels', () => {
    render(
      <Panel surface="recessed" aria-label="Details">
        <Status tone="alert">Needs attention</Status>
      </Panel>,
    )
    expect(screen.getByRole('region', { name: 'Details' })).toHaveClass(
      'bg-muted',
    )
    expect(screen.getByText('Needs attention')).toHaveAttribute(
      'data-tone',
      'alert',
    )
  })
})
