import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Feature 7: Goal Tracker / Target Line
 * User sets a target for a metric; shows progress and chart reference lines
 */

const GoalTracker = ({ data, numericColumns, onGoalsChange }) => {
    const [goals, setGoals] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [newGoal, setNewGoal] = useState({ column: '', target: '', label: '' })

    // Compute actual value (sum of column)
    const getActual = (col) => {
        if (!data || !col) return 0
        return data.reduce((sum, row) => {
            const v = Number(row[col])
            return sum + (isNaN(v) ? 0 : v)
        }, 0)
    }

    const handleAddGoal = () => {
        if (!newGoal.column || !newGoal.target) return
        const actual = getActual(newGoal.column)
        const target = Number(newGoal.target)
        const pct = ((actual / target) * 100).toFixed(1)

        const goal = {
            id: Date.now(),
            column: newGoal.column,
            target,
            actual: Math.round(actual * 100) / 100,
            pct: Number(pct),
            label: newGoal.label || newGoal.column,
            status: pct >= 100 ? 'achieved' : pct >= 80 ? 'on-track' : 'behind',
        }

        const updated = [...goals, goal]
        setGoals(updated)
        onGoalsChange && onGoalsChange(updated)
        setNewGoal({ column: '', target: '', label: '' })
        setShowForm(false)
    }

    const handleRemove = (id) => {
        const updated = goals.filter(g => g.id !== id)
        setGoals(updated)
        onGoalsChange && onGoalsChange(updated)
    }

    const statusStyle = {
        achieved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', bar: 'bg-emerald-500', icon: TrendingUp, label: 'Achieved' },
        'on-track': { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', bar: 'bg-blue-500', icon: Minus, label: 'On Track' },
        behind: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', bar: 'bg-amber-500', icon: TrendingDown, label: 'Behind' },
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <Target className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Goal Tracker</h4>
                        <p className="text-[10px] text-muted-foreground">Set targets · Track progress</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(f => !f)}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Goal
                </button>
            </div>

            {/* Add goal form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3"
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Goal</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Column</label>
                                <select
                                    value={newGoal.column}
                                    onChange={e => setNewGoal(g => ({ ...g, column: e.target.value }))}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="">Select column</option>
                                    {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Value</label>
                                <input
                                    type="number"
                                    value={newGoal.target}
                                    onChange={e => setNewGoal(g => ({ ...g, target: e.target.value }))}
                                    placeholder="e.g. 50000"
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Label (optional)</label>
                                <input
                                    type="text"
                                    value={newGoal.label}
                                    onChange={e => setNewGoal(g => ({ ...g, label: e.target.value }))}
                                    placeholder="e.g. Q4 Sales Target"
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddGoal}
                                disabled={!newGoal.column || !newGoal.target}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                            >
                                Add Goal
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-muted rounded-xl text-xs font-black hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Goals list */}
            {goals.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                    No goals set yet. Add a target to track progress.
                </div>
            ) : (
                <div className="space-y-3">
                    {goals.map(goal => {
                        const style = statusStyle[goal.status]
                        const StatusIcon = style.icon
                        const displayPct = Math.min(goal.pct, 100)

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`border rounded-2xl p-4 ${style.bg}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <p className="font-bold text-sm">{goal.label}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{goal.column}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${style.bg} ${style.color} border`}>
                                            <StatusIcon className="h-2.5 w-2.5" />
                                            {style.label}
                                        </span>
                                        <button onClick={() => handleRemove(goal.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Actual: <span className="font-bold text-foreground">{goal.actual.toLocaleString()}</span></span>
                                        <span className="text-muted-foreground">Target: <span className="font-bold text-foreground">{goal.target.toLocaleString()}</span></span>
                                    </div>
                                    <div className="h-2.5 bg-background/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${displayPct}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${style.bar}`}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`text-xs font-black ${style.color}`}>{goal.pct}% achieved</span>
                                        {goal.pct < 100 && (
                                            <span className="text-xs text-muted-foreground">
                                                {(goal.target - goal.actual).toLocaleString()} remaining
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default GoalTracker
