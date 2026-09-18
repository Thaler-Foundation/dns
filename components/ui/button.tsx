import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-none font-sans font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-zinc-300 dark:border-white/20 bg-card text-foreground hover:bg-muted/40 hover:border-zinc-500 dark:hover:border-white/40 before:content-[''] before:absolute before:inset-[3px] before:border before:border-zinc-300/80 dark:before:border-white/15 before:pointer-events-none hover:before:border-zinc-500/80 dark:hover:before:border-white/30 shadow-none",
        framed:
          "border border-zinc-300 dark:border-white/20 bg-card text-foreground hover:bg-muted/40 hover:border-zinc-500 dark:hover:border-white/40 before:content-[''] before:absolute before:inset-[3px] before:border before:border-zinc-300/80 dark:before:border-white/15 before:pointer-events-none hover:before:border-zinc-500/80 dark:hover:before:border-white/30 shadow-none",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted/60 hover:text-foreground",
        secondary:
          "border border-border bg-muted/50 text-foreground hover:bg-muted",
        ghost:
          "hover:bg-muted hover:text-foreground",
        destructive:
          "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 text-sm gap-2",
        xs: "h-7 px-2.5 text-xs gap-1",
        sm: "h-8.5 px-3 text-xs gap-1.5",
        lg: "h-12 px-6 text-sm gap-2",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
