import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils.js'

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select data-slot="select" className={cn('field', className)} {...props} />
}
