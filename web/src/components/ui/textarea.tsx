import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-2xl border border-input bg-muted/40 px-4 py-3 text-base transition-all duration-200 outline-none placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm dark:bg-white/5 dark:focus-visible:bg-white/10 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
