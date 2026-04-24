import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption for all data storage. Your uploaded files are isolated and never used to train global AI models."
    },
    {
        question: "Which file formats do you support?",
        answer: "We currently support CSV and Excel (.xlsx) files. We are working on adding direct database connections soon."
    },
    {
        question: "How accurate are the AI insights?",
        answer: "Our AI uses Gemini 2.0 Flash, which is highly accurate at statistical interpretation. However, we recommend using insights for decision support rather than automated action."
    },
    {
        question: "Can I export reports for clients?",
        answer: "Yes! You can export full PDF reports that include your charts and the AI analysis, perfectly formatted for professional presentation."
    }
];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5 last:border-0 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors group px-4 rounded-xl"
            >
                <span className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">{question}</span>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    {isOpen ? <Minus className="h-5 w-5 text-violet-400" /> : <Plus className="h-5 w-5 text-white/20" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="pb-6 px-4 text-white/40 leading-relaxed max-w-2xl">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    return (
        <section className="py-24 bg-[#08080c] relative">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest mb-4"
                    >
                        <HelpCircle className="h-3 w-3" />
                        Support
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-black text-white"
                    >
                        Frequently Asked <span className="text-violet-500 text-6xl">Questions</span>
                    </motion.h2>
                </div>

                <div className="glass-card bg-white/[0.02] border border-white/5 rounded-3xl p-4">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} {...faq} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
