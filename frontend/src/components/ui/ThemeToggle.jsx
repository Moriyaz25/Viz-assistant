const ThemeToggle = () => (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-default"
        style={{ background: 'hsl(38 95% 50% / 0.1)', border: '1px solid hsl(38 95% 50% / 0.2)', color: 'hsl(38 95% 58%)' }}>
        <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
        Dark
    </div>
)

export default ThemeToggle