import { useState, useMemo, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ReferenceLine
} from 'recharts'
import { cn } from '../../utils/cn'
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, AreaChart as AreaIcon, Settings2 } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981']

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-2xl transition-all duration-300 transform scale-105">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        <p className="text-sm font-semibold">
                            {entry.name}: <span className="text-primary">{entry.value.toLocaleString()}</span>
                        </p>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

const ChartGenerator = ({ data, externalConfig, goals }) => {
    const [chartType, setChartType] = useState('area')

    const keys = data && data.length > 0 ? Object.keys(data[0]) : []

    const isNumeric = (val) => {
        if (typeof val === 'number') return true;
        if (typeof val !== 'string') return false;
        return !isNaN(parseFloat(val)) && isFinite(val);
    }

    const numericKeys = keys.filter(key => {
        const firstVal = data.find(row => row[key] !== null && row[key] !== undefined)?.[key];
        return isNumeric(firstVal);
    })

    const categoricalKeys = keys.filter(key => !numericKeys.includes(key))

    const [xAxisKey, setXAxisKey] = useState(categoricalKeys.length > 0 ? categoricalKeys[0] : keys[0] || '')
    const [yAxisKey, setYAxisKey] = useState(numericKeys.length > 0 ? numericKeys[0] : keys[1] || keys[0] || '')

    // Feature 1: Apply external NL chart config
    useEffect(() => {
        if (externalConfig) {
            if (externalConfig.chartType) setChartType(externalConfig.chartType)
            if (externalConfig.xAxisKey && keys.includes(externalConfig.xAxisKey)) setXAxisKey(externalConfig.xAxisKey)
            if (externalConfig.yAxisKey && keys.includes(externalConfig.yAxisKey)) setYAxisKey(externalConfig.yAxisKey)
        }
    }, [externalConfig])

    // Synchronize keys when data is loaded asynchronously
    useEffect(() => {
        if (data && data.length > 0) {
            const hasValidX = xAxisKey && keys.includes(xAxisKey)
            const hasValidY = yAxisKey && keys.includes(yAxisKey)

            if (!hasValidX) {
                setXAxisKey(categoricalKeys.length > 0 ? categoricalKeys[0] : keys[0] || '')
            }
            if (!hasValidY) {
                setYAxisKey(numericKeys.length > 0 ? numericKeys[0] : keys[1] || keys[0] || '')
            }
        }
    }, [data, keys, categoricalKeys, numericKeys, xAxisKey, yAxisKey])

    // Feature 7: Compute goal reference lines for current yAxisKey
    const activeGoals = (goals || []).filter(g => g.column === yAxisKey)

    // DATA AGGREGATION LOGIC
    const aggregatedData = useMemo(() => {
        if (!data || data.length === 0 || !xAxisKey || !yAxisKey) return []

        // 1. Group and Sum values
        const groups = data.reduce((acc, curr) => {
            const key = String(curr[xAxisKey] || 'Unknown')
            const value = Number(curr[yAxisKey]) || 0
            if (!acc[key]) acc[key] = 0
            acc[key] += value
            return acc
        }, {})

        // 2. Convert to array
        let result = Object.entries(groups).map(([name, value]) => ({
            [xAxisKey]: name,
            [yAxisKey]: value
        }))

        // 3. Sort by value descending
        result.sort((a, b) => b[yAxisKey] - a[yAxisKey])

        // 4. Handle overcrowding for Pie (Max 10 slices)
        if (chartType === 'pie' && result.length > 10) {
            const top = result.slice(0, 10)
            const othersValue = result.slice(10).reduce((sum, item) => sum + item[yAxisKey], 0)
            return [...top, { [xAxisKey]: 'Others', [yAxisKey]: othersValue }]
        }

        return result
    }, [data, xAxisKey, yAxisKey, chartType])

    const Defs = () => (
        <defs>
            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
            </linearGradient>
        </defs>
    )

    const renderChart = () => {
        const commonProps = {
            data: aggregatedData,
            margin: { top: 10, right: 10, left: 0, bottom: 20 }
        }

        switch (chartType) {
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={420}>
                        <AreaChart {...commonProps}>
                            <Defs />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis
                                dataKey={xAxisKey}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                dy={10}
                                angle={-15}
                                textAnchor="end"
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }} />
                            <Area
                                type="monotone"
                                dataKey={yAxisKey}
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPrimary)"
                                animationDuration={1500}
                                animationEasing="ease-in-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={420}>
                        <BarChart {...commonProps}>
                            <Defs />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} dy={10} angle={-15} textAnchor="end" />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary)/0.05)' }} />
                            <Bar dataKey={yAxisKey} fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1000} />
                            {activeGoals.map((goal, i) => (
                                <ReferenceLine key={i} y={goal.target} stroke="#10b981" strokeWidth={2} strokeDasharray="6 3"
                                    label={{ value: `🎯 ${goal.label}: ${goal.target.toLocaleString()}`, fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={420}>
                        <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis
                                dataKey={xAxisKey}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                                angle={-15}
                                textAnchor="end"
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey={yAxisKey}
                                stroke="hsl(var(--primary))"
                                strokeWidth={4}
                                dot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                                animationDuration={1200}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={420}>
                        <PieChart>
                            <Pie
                                data={aggregatedData}
                                cx="50%"
                                cy="50%"
                                innerRadius="25%"
                                outerRadius="40%"
                                paddingAngle={5}
                                dataKey={yAxisKey}
                                nameKey={xAxisKey}
                                animationDuration={1500}
                            >
                                {aggregatedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 items-start justify-between p-4 sm:p-6 bg-gradient-to-br from-card to-muted/20 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center space-x-3 mb-2 lg:mb-0">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Settings2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold tracking-tight">Visualization Settings</h4>
                        <p className="text-xs text-muted-foreground">Adjust axes and chart type</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</label>
                        <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
                            {[
                                { id: 'area', icon: AreaIcon },
                                { id: 'bar', icon: BarChart3 },
                                { id: 'line', icon: LineIcon },
                                { id: 'pie', icon: PieIcon }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setChartType(item.id)}
                                    className={cn(
                                        "p-2 rounded-md transition-all",
                                        chartType === item.id ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1.5 flex-1 min-w-[120px]">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">X Axis</label>
                        <select
                            value={xAxisKey}
                            onChange={(e) => setXAxisKey(e.target.value)}
                            className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                            {keys.map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1.5 flex-1 min-w-[120px]">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Y Axis</label>
                        <select
                            value={yAxisKey}
                            onChange={(e) => setYAxisKey(e.target.value)}
                            className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                            {numericKeys.map(key => <option key={key} value={key}>{key}</option>)}
                            {numericKeys.length === 0 && keys.map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-card w-full p-4 sm:p-8 rounded-2xl border border-border shadow-xl backdrop-blur-sm">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{yAxisKey} vs {xAxisKey}</h3>
                        <p className="text-xs text-muted-foreground">Visualizing {data.length} data points</p>
                    </div>
                    <div style={{ width: '100%', height: 420 }}>
                        {renderChart()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChartGenerator
