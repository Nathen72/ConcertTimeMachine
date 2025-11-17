import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-vintage-teal text-vintage-cream hover:bg-vintage-teal/90 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg",
        outline:
          "border-2 border-vintage-teal bg-transparent text-vintage-teal hover:bg-vintage-teal hover:text-vintage-cream hover:shadow-lg hover:scale-105 active:scale-95",
        secondary:
          "bg-vintage-sage text-foreground hover:bg-vintage-sage/80 hover:shadow-lg",
        ghost: "hover:bg-vintage-teal/10 hover:text-vintage-teal",
        link: "text-vintage-teal underline-offset-4 hover:underline hover:text-vintage-teal/80",
        vintage: "bg-vintage-orange text-vintage-cream hover:bg-vintage-orange/90 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-display font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
