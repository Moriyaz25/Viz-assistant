import { Link } from 'react-router-dom'
import { Database } from 'lucide-react'

const EmptyState = ({ title, description, actionLabel, actionLink, className = '' }) => (
    <div className={`flex flex-col items-center justify-center text-center p-10 rounded-2xl ${className}`}
        style={{ background: 'hsl(30 8% 10%)', border: '1px solid hsl(30 8% 16%)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'hsl(38 95% 50% / 0.1)', border: '1px solid hsl(38 95% 50% / 0.18)' }}>
            <Database className="h-6 w-6" style={{ color: '#F59E0B' }} />
        </div>
        <h3 className="text-base font-black text-white mb-1">{title}</h3>
        {description && <p className="text-sm mb-5 max-w-xs" style={{ color: 'hsl(30 8% 42%)' }}>{description}</p>}
        {actionLabel && actionLink && (
            <Link to={actionLink}
                className="px-5 py-2.5 rounded-xl text-sm font-black"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'hsl(30 10% 5%)' }}>
                {actionLabel}
            </Link>
        )}
    </div>
)

export default EmptyState