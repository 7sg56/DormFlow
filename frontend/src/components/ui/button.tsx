import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "outline" | "ghost" | "link" | "destructive"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        // Minimalist Tailwind classes mapping
        let variantClasses = "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
        if (variant === "outline") variantClasses = "border border-input bg-background hover:bg-muted hover:text-foreground"
        if (variant === "ghost") variantClasses = "hover:bg-muted hover:text-foreground"
        if (variant === "link") variantClasses = "text-primary underline-offset-4 hover:underline"
        if (variant === "destructive") variantClasses = "bg-red-500 text-white hover:bg-red-600 shadow-sm"

        let sizeClasses = "h-10 px-4 py-2"
        if (size === "sm") sizeClasses = "h-9 rounded-md px-3"
        if (size === "lg") sizeClasses = "h-11 rounded-md px-8"
        if (size === "icon") sizeClasses = "h-10 w-10"

        const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        return (
            <Comp
                className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
