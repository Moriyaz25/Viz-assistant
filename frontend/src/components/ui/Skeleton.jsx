import { clsx as cn } from "clsx";


export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-white/10", className)}
            {...props}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="glass-card flex flex-col gap-4 p-6">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-full" />
            <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="glass-card flex flex-col gap-4 p-6 min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-1/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
            <div className="flex-1 flex items-end gap-2 px-2">
                {[...Array(12)].map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1"
                        style={{ height: `${Math.random() * 60 + 20}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-3 w-10" />
                ))}
            </div>
        </div>
    );
}
