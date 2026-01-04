"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(
  undefined
)

interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ className, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const open = controlledOpen ?? internalOpen
    const containerRef = React.useRef<HTMLDivElement>(null)

    const setOpen = React.useCallback(
      (newOpen: boolean) => {
        if (controlledOpen === undefined) {
          setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
      },
      [controlledOpen, onOpenChange]
    )

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (open && containerRef.current) {
          if (!containerRef.current.contains(event.target as Node)) {
            setOpen(false)
          }
        }
      }

      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [open, setOpen])

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    return (
      <PopoverContext.Provider value={{ open, setOpen }}>
        <div
          ref={containerRef}
          className={cn("relative", className)}
          {...props}
        >
          {children}
        </div>
      </PopoverContext.Provider>
    )
  }
)
Popover.displayName = "Popover"

const usePopoverContext = () => {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error("Popover components must be used within Popover")
  }
  return context
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, children, ...props }, ref) => {
  const { open, setOpen } = usePopoverContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open)
    onClick?.(e)
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = usePopoverContext()

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
