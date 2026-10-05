import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils.js'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn('field', className)} {...props} />
}
