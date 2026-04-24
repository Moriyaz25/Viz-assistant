import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ChevronLeft, ChevronRight, BookOpen, Download, X, Sparkles } from 'lucide-react'
import { generateDataStory } from '../../services/nlChartService'
import { exportFullReportAsPDF } from '../../utils/downloadUtils'

/**
 * Feature 3: Auto Data Story Generator
 * Creates a 5-slide story from the dataset analysis
 */

const colorMap = {
    violet: { bg: 'from-violet-600 to-purple-700', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30', dot: 'bg-violet-400' },
    blue: { bg: 'from-blue-600 to-cyan-700', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
    emerald: { bg: 'from-emerald-600 to-teal-700', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
    amber: { bg: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
    rose: { bg: 'from-rose-600 to-pink-700', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' },
}

const Slide = ({ slide, total }) => {
    const colors = colorMap[slide.color] || colorMap.violet

    return (
        <motion.div
            key={slide.slideNumber}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${colors.bg} p-8 flex flex-col justify-between text-white relative overflow-hidden`}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-black/10 blur-3xl" />
            </div>

            {/* Slide number */}
            <div className="flex items-center justify-between z-10">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${colors.badge}`}>
                    {slide.type?.toUpperCase()} · {slide.slideNumber}/{total}
                </span>
                <span className="text-4xl">{slide.emoji}</span>
            </div>

            {/* Content */}
            <div className="z-10 space-y-3">
                {slide.keyMetric && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
                        <p className="text-2xl font-black">{slide.keyMetric}</p>
                    </div>
                )}
                <h2 className="text-2xl md:text-3xl font-black leading-tight">{slide.headline}</h2>
                {slide.subheadline && (
                    <p className="text-white/70 text-sm font-medium">{slide.subheadline}</p>
                )}
                {slide.body && (
                    <p className="text-white/80 text-sm leading-relaxed max-w-2xl">{slide.body}</p>
                )}
                {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                    <ul className="space-y-1.5">
                        {slide.bulletPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
                                {point}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.div>
    )
}

const DataStoryModal = ({ story, fileName, onClose, insights }) => {
    const [current, setCurrent] = useState(0)
    const [exporting, setExporting] = useState(false)

    const prev = () => setCurrent(c => Math.max(0, c - 1))
    const next = () => setCurrent(c => Math.min(story.length - 1, c + 1))

    const handleExport = async () => {
        setExporting(true)
        try {
            const storyText = story.map(s =>
                `## Slide ${s.slideNumber}: ${s.headline}\n${s.body || ''}\n${(s.bulletPoints || []).join('\n')}`
            ).join('\n\n')
            await exportFullReportAsPDF('story-chart-capture', storyText, `${fileName}_story`)
        } finally {
            setExporting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="bg-violet-500/10 p-2 rounded-xl">
                            <BookOpen className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-black">Data Story</h3>
                            <p className="text-xs text-muted-foreground">{fileName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                            Export
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Slide */}
                <div className="p-5" id="story-chart-capture">
                    <AnimatePresence mode="wait">
                        <Slide key={current} slide={story[current]} total={story.length} />
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="px-5 pb-5 flex items-center justify-between">
                    <button
                        onClick={prev}
                        disabled={current === 0}
                        className="flex items-center gap-1 text-sm font-bold px-4 py-2 bg-muted rounded-xl hover:bg-muted/80 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </button>

                    {/* Dots */}
                    <div className="flex items-center gap-2">
                        {story.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={next}
                        disabled={current === story.length - 1}
                        className="flex items-center gap-1 text-sm font-bold px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-30 transition-colors"
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

const DataStoryButton = ({ data, insights, fileName }) => {
    const [loading, setLoading] = useState(false)
    const [story, setStory] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState(null)

    const handleGenerate = async () => {
        if (story) { setShowModal(true); return }
        setLoading(true)
        setError(null)
        try {
            const result = await generateDataStory(data, insights, fileName)
            if (result) {
                setStory(result)
                setShowModal(true)
            } else {
                setError('Story generation failed')
            }
        } catch {
            setError('Failed to generate story')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={handleGenerate}
                disabled={loading || !data || data.length === 0}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
                {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating Story...</>
                ) : (
                    <><BookOpen className="h-4 w-4" /> Data Story</>
                )}
            </button>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

            <AnimatePresence>
                {showModal && story && (
                    <DataStoryModal
                        story={story}
                        fileName={fileName?.replace(/\.[^.]+$/, '') || 'Dataset'}
                        insights={insights}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

export default DataStoryButton
