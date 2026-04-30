import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const variantMap: Record<string, string> = {
            default: "bg-primary text-on-primary hover:bg-primary-hover shadow-[var(--shadow-sm)] active:shadow-none",
            outline: "border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-high hover:border-outline",
            ghost: "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            link: "text-primary underline-offset-4 hover:underline",
            destructive: "bg-error text-on-error hover:brightness-90 shadow-[var(--shadow-sm)]",
            secondary: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
        }

        const sizeMap: Record<string, string> = {
            default: "h-10 px-4 py-2",
            sm: "h-8 px-3 text-xs",
            lg: "h-11 px-6",
            icon: "h-9 w-9",
        }

        const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius)] font-ui text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

        return (
            <Comp
                className={`${baseClasses} ${variantMap[variant] || variantMap.default} ${sizeMap[size] || sizeMap.default} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
