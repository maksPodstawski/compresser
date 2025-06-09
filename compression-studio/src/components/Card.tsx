import type React from "react"

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg shadow-md ${className}`}>{children}</div>
)

export const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6 pb-2">{children}</div>

export const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 ${className}`}>{children}</div>
)

export const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-xl font-semibold mb-1 ${className}`}>{children}</h3>
)

export const CardDescription = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-slate-400">{children}</p>
)