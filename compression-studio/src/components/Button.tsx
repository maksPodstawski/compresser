import type React from "react"

export const Button = ({
                           children,
                           onClick,
                           disabled,
                           className = "",
                           variant = "default",
                           size = "default",
                       }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    className?: string
    variant?: "default" | "outline"
    size?: "default" | "lg"
}) => {
    const baseStyles =
        "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
    const variantStyles =
        variant === "outline"
            ? "border border-slate-600 bg-transparent hover:bg-slate-700/20"
            : "bg-purple-600 text-white hover:bg-purple-700"
    const sizeStyles = size === "lg" ? "text-lg py-3" : ""
    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`}
        >
            {children}
        </button>
    )
}