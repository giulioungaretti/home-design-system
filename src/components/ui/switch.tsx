import * as React from 'react'
import { cn } from '../../lib/utils.js'
import * as SwitchPrimitive from '@radix-ui/react-switch'

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'physical-switch group/switch relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-border bg-input data-[state=checked]:bg-secondary data-disabled:cursor-not-allowed data-disabled:opacity-45',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 rounded-full border border-border bg-card shadow-sm transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0.5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
