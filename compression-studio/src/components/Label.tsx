import type React from "react"

export const Label = ({
                          children,
                          htmlFor,
                          className = "",
                      }: {
    children: React.ReactNode
    htmlFor?: string
    className?: string
}) => (
    <label htmlFor={htmlFor} className={`block mb-2 font-medium ${className}`}>
        {children}
    </label>
)