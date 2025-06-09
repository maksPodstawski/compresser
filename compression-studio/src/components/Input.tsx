import type React from "react"

export const Input = ({
                          type = "text",
                          id,
                          onChange,
                          className = "",
                          ref,
                      }: {
    type?: string
    id?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
    ref?: React.RefObject<HTMLInputElement>
}) => (
    <input
        type={type}
        id={id}
        onChange={onChange}
        ref={ref}
        className={`px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
    />
)