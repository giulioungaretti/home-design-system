import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils.js'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input data-slot="input" className={cn('field', className)} {...props} />
}
