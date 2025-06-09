import type React from "react"

export const Alert = ({
                          children,
                          className = "",
                          variant = "default",
                      }: {
    children: React.ReactNode
    className?: string
    variant?: "default" | "destructive"
}) => {
    const variantStyles =
        variant === "destructive"
            ? "bg-red-900/20 border-red-500/30 text-red-200"
            : "bg-slate-800 border-slate-700 text-slate-200"

    return <div className={`p-4 rounded-md border ${variantStyles} ${className}`}>{children}</div>
}

export const AlertDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`text-sm ${className}`}>{children}</div>
)