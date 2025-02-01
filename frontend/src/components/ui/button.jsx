import * as React from "react"
import PropTypes from 'prop-types'
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90": variant === "destructive",
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80": variant === "secondary",
          "bg-transparent text-foreground underline-offset-4 hover:underline": variant === "link",
        },
        {
          "h-9 px-4 py-2": size === "default",
          "h-8 rounded-md px-3 text-xs": size === "sm",
          "h-10 rounded-md px-8": size === "lg",
          "h-6 rounded-md px-2 text-xs": size === "xs",
        },
        className
      )}
      ref={ref}
      {...props} />
  )
})
Button.displayName = "Button"

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'destructive', 'outline', 'secondary', 'link']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'xs']),
  asChild: PropTypes.bool,
  children: PropTypes.node
}

export { Button }
