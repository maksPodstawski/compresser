export const Progress = ({
                             value,
                             className = "",
                         }: {
    value: number
    className?: string
}) => (
    <div className={`w-full bg-slate-700 rounded-full h-2.5 ${className}`}>
        <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${value}%` }}></div>
    </div>
)