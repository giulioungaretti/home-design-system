import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils.js'
import { Slot } from '@radix-ui/react-slot'

const buttonVariants = cva(
  'control inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border text-sm font-medium whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
  {
    variants: {
      variant: {
        default:
          'control-primary border-foreground bg-primary text-primary-foreground',
        outline: 'control-raised border-border bg-card text-foreground',
        secondary:
          'control-signal border-border bg-secondary text-secondary-foreground',
        ghost:
          'control-flat border-transparent bg-transparent text-foreground hover:bg-muted',
        destructive:
          'control-raised border-destructive bg-card text-destructive',
        link: 'control-flat border-transparent text-foreground underline underline-offset-4',
      },
      size: {
        default: 'min-h-11 px-5 py-2',
        sm: 'min-h-11 px-3 py-2 text-xs',
        lg: 'min-h-13 px-6 py-3',
        icon: 'size-12 rounded-full p-0',
        'icon-lg': 'size-16 rounded-full p-0 [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
