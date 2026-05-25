"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
  variant?: "default" | "glow" | "gradient"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, variant = "default", ...props }, ref) => {
    const indicatorVariants = {
      default: "bg-primary",
      glow: "bg-primary shadow-[0_0_12px_rgba(245,158,11,0.4)]",
      gradient: "bg-gradient-to-r from-primary via-amber-400 to-primary",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted/60",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 rounded-full transition-all duration-500 ease-out",
            indicatorVariants[variant],
            indicatorClassName
          )}
          style={{
            transform: `translateX(-${100 - (value || 0)}%)`,
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
