import { LogOut, X } from 'lucide-react'

const LogoutConfirmDialog = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Dialog */}
            <div
                className="relative bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-zinc-400 hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center mb-6">
                    <LogOut className="h-7 w-7 text-red-500" />
                </div>

                {/* Content */}
                <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">
                    Sign Out?
                </h2>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8">
                    You'll be logged out of your account. Any unsaved changes will be lost.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-5 py-3 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-5 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 active:scale-95 transition-all text-sm shadow-lg shadow-red-500/20"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LogoutConfirmDialog