import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & {
  variant?: "default" | "glass" | "underline"
}) {
  const variantClasses = {
    default:
      "rounded-2xl border border-input bg-muted/50 focus-visible:bg-white focus-visible:border-primary/40",
    glass:
      "rounded-2xl border border-white/30 bg-white/60 backdrop-blur-md focus-visible:bg-white/90 focus-visible:border-primary/40 dark:border-white/8 dark:bg-white/5 dark:focus-visible:bg-white/10",
    underline:
      "rounded-none border-0 border-b-2 border-input bg-transparent px-0 focus-visible:bg-transparent focus-visible:border-primary",
  }

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 px-3.5 py-2 text-base transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Input }
