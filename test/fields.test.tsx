import { createRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input, Select, Textarea } from '../src/index.js'

describe('native fields', () => {
  it('forwards native props, React 19 refs, classes, labels, and descriptions', () => {
    const inputRef = createRef<HTMLInputElement>()
    const selectRef = createRef<HTMLSelectElement>()
    const textareaRef = createRef<HTMLTextAreaElement>()
    render(
      <>
        <label htmlFor="address">Address</label>
        <Input
          id="address" name="address" type="email" autoComplete="email"
          ref={inputRef} className="consumer-field px-2 px-5"
          aria-invalid="true" aria-describedby="address-error" required
        />
        <p id="address-error">Enter an email address.</p>
        <label htmlFor="source">Source</label>
        <Select
          id="source" name="source" ref={selectRef} className="consumer-field"
          defaultValue="radio" aria-describedby="source-hint"
        >
          <optgroup label="Inputs">
            <option value="radio">Radio</option>
            <option value="line">Line input</option>
          </optgroup>
        </Select>
        <p id="source-hint">Choose an input.</p>
        <label htmlFor="notes">Notes</label>
        <Textarea
          id="notes" name="notes" ref={textareaRef} className="consumer-field"
          rows={4} maxLength={100} aria-describedby="notes-hint"
        />
        <p id="notes-hint">Up to 100 characters.</p>
      </>,
    )
    for (const [label, slot, ref, description] of [
      ['Address', 'input', inputRef, 'Enter an email address.'],
      ['Source', 'select', selectRef, 'Choose an input.'],
      ['Notes', 'textarea', textareaRef, 'Up to 100 characters.'],
    ] as const) {
      const field = screen.getByLabelText(label)
      expect(ref.current).toBe(field)
      expect(field.tagName.toLowerCase()).toBe(slot)
      expect(field).toHaveAttribute('data-slot', slot)
      expect(field).toHaveClass('field', 'consumer-field')
      expect(field).toHaveAccessibleDescription(description)
    }
    expect(inputRef.current).toHaveClass('px-5')
    expect(inputRef.current).not.toHaveClass('px-2')
    expect(inputRef.current).toHaveAttribute('type', 'email')
    expect(inputRef.current).toHaveAttribute('autocomplete', 'email')
    expect(inputRef.current).toBeRequired()
    expect(inputRef.current).toHaveAttribute('aria-invalid', 'true')
    expect(selectRef.current).toHaveValue('radio')
    expect(textareaRef.current).toHaveAttribute('rows', '4')
    expect(textareaRef.current).toHaveAttribute('maxlength', '100')
  })

  it('supports controlled values, native change events, keyboard focus, and multiline input', async () => {
    function ControlledFields() {
      const [name, setName] = useState('')
      const [source, setSource] = useState('radio')
      const [notes, setNotes] = useState('')
      return (
        <>
          <Input aria-label="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Select aria-label="Source" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="radio">Radio</option>
            <option value="line">Line input</option>
          </Select>
          <Textarea aria-label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </>
      )
    }
    render(<ControlledFields />)
    const user = userEvent.setup()
    await user.tab()
    expect(screen.getByLabelText('Name')).toHaveFocus()
    await user.keyboard('Kitchen')
    await user.tab()
    expect(screen.getByLabelText('Source')).toHaveFocus()
    await user.selectOptions(screen.getByLabelText('Source'), 'line')
    await user.tab()
    expect(screen.getByLabelText('Notes')).toHaveFocus()
    await user.keyboard('Morning{Enter}Evening')
    expect(screen.getByLabelText('Name')).toHaveValue('Kitchen')
    expect(screen.getByLabelText('Source')).toHaveValue('line')
    expect(screen.getByLabelText('Notes')).toHaveValue('Morning\nEvening')
  })

  it('retains native disabled and readonly behavior without inventing validation', async () => {
    const onChange = vi.fn()
    render(
      <>
        <Input aria-label="Disabled name" disabled defaultValue="Kitchen" onChange={onChange} />
        <Select aria-label="Disabled source" disabled defaultValue="radio" onChange={onChange}>
          <option value="radio">Radio</option>
          <option value="line">Line input</option>
        </Select>
        <Textarea aria-label="Disabled notes" disabled defaultValue="Morning" onChange={onChange} />
        <Input aria-label="Readonly name" readOnly defaultValue="Radio" onChange={onChange} />
        <Textarea aria-label="Readonly notes" readOnly defaultValue="Evening" onChange={onChange} />
        <Input aria-label="Required name" required />
      </>,
    )
    const user = userEvent.setup()
    for (const name of ['Disabled name', 'Disabled source', 'Disabled notes']) {
      expect(screen.getByLabelText(name)).toBeDisabled()
    }
    await user.type(screen.getByLabelText('Disabled name'), 'changed')
    await user.selectOptions(screen.getByLabelText('Disabled source'), 'line')
    await user.type(screen.getByLabelText('Disabled notes'), 'changed')
    await user.tab()
    expect(screen.getByLabelText('Readonly name')).toHaveFocus()
    await user.keyboard('changed')
    await user.tab()
    expect(screen.getByLabelText('Readonly notes')).toHaveFocus()
    await user.keyboard('changed')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Required name')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('preserves uncontrolled values, form submission/reset, and native multi-select', async () => {
    render(
      <form aria-label="Settings">
        <Input aria-label="Name" name="name" defaultValue="Radio" />
        <Select aria-label="Sources" name="sources" multiple size={3} defaultValue={['radio']}>
          <option value="radio">Radio</option>
          <option value="line">Line input</option>
          <option value="wireless" disabled>Wireless</option>
        </Select>
        <Textarea aria-label="Notes" name="notes" defaultValue="Morning" />
        <button type="reset">Reset</button>
      </form>,
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Name'), ' 2')
    await user.selectOptions(screen.getByLabelText('Sources'), ['line', 'wireless'])
    await user.type(screen.getByLabelText('Notes'), ' news')
    const form = screen.getByRole<HTMLFormElement>('form', { name: 'Settings' })
    const data = new FormData(form)
    expect(data.get('name')).toBe('Radio 2')
    expect(data.getAll('sources')).toEqual(['radio', 'line'])
    expect(data.get('notes')).toBe('Morning news')
    expect(screen.getByLabelText('Sources')).toHaveAttribute('size', '3')
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByLabelText('Name')).toHaveValue('Radio')
    expect(screen.getByLabelText('Sources')).toHaveValue(['radio'])
    expect(screen.getByLabelText('Notes')).toHaveValue('Morning')
  })
})
