import { motion } from 'framer-motion';
import { Database, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx as cn } from 'clsx';


const EmptyState = ({
    icon: Icon = Database,
    title,
    description,
    actionLabel,
    actionLink,
    className
}) => {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 px-6 glass-card border-dashed border-white/10",
            className
        )}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10"
            >
                <Icon className="h-8 w-8 text-white/20" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/40 text-sm text-center max-w-xs mb-6">
                {description}
            </p>
            {actionLink && (
                <Link
                    to={actionLink}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all text-sm"
                >
                    <Plus className="h-4 w-4" />
                    {actionLabel}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;
