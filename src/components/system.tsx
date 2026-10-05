import type { ComponentProps, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils.js'
import { Button } from './ui/button.js'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip.js'

const panelVariants = cva('panel', {
  variants: { surface: { raised: '', recessed: 'bg-muted shadow-none' } },
  defaultVariants: { surface: 'raised' },
})

export function Panel({
  surface,
  className,
  ...props
}: ComponentProps<'section'> & VariantProps<typeof panelVariants>) {
  return (
    <section className={cn(panelVariants({ surface }), className)} {...props} />
  )
}

export function Status({
  tone = 'off',
  children,
}: {
  tone?: 'on' | 'off' | 'alert'
  children: ReactNode
}) {
  return (
    <span className="status" data-tone={tone}>
      <span className="status-dot" aria-hidden="true" />
      {children}
    </span>
  )
}

type IconButtonProps = Omit<
  ComponentProps<typeof Button>,
  'children' | 'size' | 'asChild'
> & {
  label: string
  children: ReactNode
  size?: 'default' | 'sm'
}

export function IconButton({
  label,
  children,
  variant = 'outline',
  size = 'default',
  className,
  ...props
}: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={variant}
          aria-label={label}
          className={cn(size === 'sm' && 'size-9 pointer-coarse:size-11', className)}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  )
}

export function PageHeading({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="page-heading">
      <h1 className="page-title">{title}</h1>
      {children && <p className="page-intro">{children}</p>}
    </div>
  )
}
