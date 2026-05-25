import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border font-medium whitespace-nowrap transition-all duration-300 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-transparent shadow-sm hover:shadow-lg hover:shadow-primary/25 hover:brightness-105",
        outline:
          "border-border bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md hover:border-primary/30 aria-expanded:bg-white aria-expanded:text-foreground dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10",
        secondary:
          "bg-secondary text-secondary-foreground border-transparent shadow-sm hover:shadow-md hover:shadow-secondary/20 hover:brightness-110 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "border-transparent hover:bg-slate-100 hover:text-foreground aria-expanded:bg-slate-100 aria-expanded:text-foreground dark:hover:bg-white/5",
        destructive:
          "bg-destructive/10 text-destructive border-transparent hover:bg-destructive/15 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
        glow:
          "bg-gradient-to-br from-primary via-primary to-amber-500 text-primary-foreground border-transparent shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110 animate-pulse-glow",
      },
      size: {
        default:
          "h-10 gap-2 px-5 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[min(var(--radius-md),12px)] px-4 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 rounded-2xl px-8 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xl: "h-14 gap-3 rounded-2xl px-10 text-lg has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        "2xl": "h-16 gap-3 rounded-3xl px-12 text-xl tracking-tight has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
