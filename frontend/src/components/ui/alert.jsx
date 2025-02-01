import * as React from "react"
import PropTypes from 'prop-types'
import { cn } from "@/lib/utils"

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
      {
        "bg-destructive text-destructive-foreground": variant === "destructive",
      },
      className
    )}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

Alert.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
  children: PropTypes.node
}

AlertTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

AlertDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

export { Alert, AlertTitle, AlertDescription }
