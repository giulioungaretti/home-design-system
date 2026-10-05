import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../docs/App.js'

describe('standalone showcase', () => {
  it('provides page landmarks, a skip link, and local rotary selection', async () => {
    render(<App />)
    const user = userEvent.setup()
    expect(screen.getByRole('link', { name: 'Skip to components' })).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    await user.click(within(screen.getByRole('group', { name: 'Rotary navigation' })).getByRole('button', { name: 'CV' }))
    expect(screen.getByText('Selected: CV')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Page selector' })).toHaveAttribute('aria-valuetext', 'CV')
    expect(screen.getAllByRole('link').every((link) => !link.getAttribute('href')?.includes('giulioungaretti.me'))).toBe(true)
  })

  it('toggles controls and validates the local form without persistence', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Demo power off' }))
    expect(screen.getByRole('button', { name: 'Demo power on' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Raise demo level' }))
    expect(screen.getByLabelText('Demo level')).toHaveTextContent('Level 3 / 5')
    await user.click(screen.getByRole('button', { name: 'Try validation' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a device name')
    expect(screen.getByLabelText('Demo device name')).toHaveAttribute('aria-invalid', 'true')
    await user.type(screen.getByLabelText('Demo device name'), 'Kitchen radio')
    await user.click(screen.getByRole('button', { name: 'Try validation' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Validation result' })).toHaveTextContent('Nothing was sent or saved.')
  })

  it('retains accessible tabs and keyboard selection', async () => {
    render(<App />)
    const user = userEvent.setup()
    const overview = screen.getByRole('tab', { name: 'Overview' })
    overview.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Keyboard' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Space toggles a focused switch')
  })

  it('demonstrates native fields and the compact reset control', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Demo playback mode'), 'line')
    expect(screen.getByLabelText('Demo playback mode')).toHaveValue('line')
    expect(screen.getByLabelText('Demo playback mode')).toHaveAccessibleDescription(/native select/)
    await user.type(screen.getByLabelText('Demo listening notes'), 'Morning{Enter}news')
    expect(screen.getByLabelText('Demo listening notes')).toHaveValue('Morning\nnews')
    expect(screen.getByLabelText('Serial number (unavailable)')).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Raise demo level' }))
    await user.click(screen.getByRole('button', { name: 'Reset demo level' }))
    expect(screen.getByLabelText('Demo level')).toHaveTextContent('Level 2 / 5')
  })
  it('demonstrates the compact language dial and successful status', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByRole('slider', { name: 'Answer language' })).toHaveAttribute('aria-valuetext', 'English')
    expect(screen.getByText('Language: English')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toHaveAttribute('data-tone', 'success')
  })
})
