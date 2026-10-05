import { RotaryDial } from './RotaryDial.js'
import { dialPages, type NavigationPage } from '../lib/navigation-dial.js'

export function NavigationDial({
  value,
  onValueChange,
}: {
  value: NavigationPage
  onValueChange: (value: NavigationPage) => void
}) {
  return (
    <RotaryDial
      options={dialPages}
      value={value}
      onValueChange={onValueChange}
      label="Page selector"
      groupLabel="Rotary navigation"
    />
  )
}
