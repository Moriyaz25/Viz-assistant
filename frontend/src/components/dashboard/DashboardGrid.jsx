import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

const DashboardGrid = ({ layout, onLayoutChange, isDraggable, children }) => {
    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            draggableHandle=".drag-handle"
            isDraggable={isDraggable}
            isResizable={isDraggable}
            onLayoutChange={onLayoutChange}
            margin={[24, 24]}
        >
            {children}
        </ResponsiveGridLayout>
    )
}

export const DashboardWidget = ({ id, title, children, isDraggable }) => {
    return (
        <div key={id} className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden flex flex-col">
            <div className={`px-5 py-3.5 border-b border-white/5 flex items-center justify-between ${isDraggable ? 'cursor-move drag-handle' : ''}`}>
                <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.15em]">{title}</h4>
                {isDraggable && (
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                    </div>
                )}
            </div>
            <div className="flex-1 p-5 overflow-auto">
                {children}
            </div>
        </div>
    )
}

export default DashboardGrid
