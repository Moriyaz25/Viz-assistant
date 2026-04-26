export const Skeleton = ({ className = '' }) => (
    <div className={`rounded-lg animate-pulse ${className}`}
        style={{ background: 'hsl(30 8% 14%)' }} />
)

export const CardSkeleton = () => (
    <div className="space-y-3 p-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-3 w-24" />
    </div>
)

export default Skeleton