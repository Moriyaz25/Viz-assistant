import { Github, Twitter, Linkedin, Sparkles, Mail, MapPin, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="relative bg-[#080808] pt-24 pb-12 overflow-hidden border-t border-white/5">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link to="/" className="flex items-center space-x-3 group w-fit">
                            <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white">
                                Vizassistance
                            </span>
                        </Link>
                        <p className="text-white/40 text-lg leading-relaxed font-medium max-w-xs">
                            Architecting the future of data intelligence with AI-driven precision and stunning visual clarity.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { icon: Github, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Linkedin, href: '#' }
                            ].map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    className="h-10 w-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-amber-400 hover:border-amber-400/30 transition-colors border border-white/5"
                                >
                                    <social.icon className="h-5 w-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-8 tracking-tight">Platform</h3>
                        <ul className="space-y-4">
                            {['Features', 'Workflow', 'Pricing', 'API Docs'].map((item) => (
                                <li key={item}>
                                    <a href={`#${item.toLowerCase()}`} className="text-white/40 hover:text-white transition-colors font-medium flex items-center group">
                                        <span className="w-0 group-hover:w-2 h-[2px] bg-primary mr-0 group-hover:mr-2 transition-all duration-300" />
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-8 tracking-tight">Support</h3>
                        <ul className="space-y-4">
                            {['Help Center', 'Terms of Service', 'Privacy Policy', 'Status'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-white/40 hover:text-white transition-colors font-medium flex items-center group">
                                        <span className="w-0 group-hover:w-2 h-[2px] bg-primary mr-0 group-hover:mr-2 transition-all duration-300" />
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-8 tracking-tight">Get in Touch</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <div className="h-10 w-10 shrink-0 glass rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-sm font-bold uppercase tracking-wider mb-1">Email Us</p>
                                    <p className="text-white font-medium">hello@vizassistance.ai</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="h-10 w-10 shrink-0 glass rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                                    <MapPin className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-sm font-bold uppercase tracking-wider mb-1">Office</p>
                                    <p className="text-white font-medium">Digital Valley, SF</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-white/30 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Vizassistance AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8 text-white/30 text-sm font-medium">
                        <a href="#" className="hover:text-white transition-colors">Security</a>
                        <a href="#" className="hover:text-white transition-colors">System Status</a>
                        <div className="flex items-center gap-2 px-3 py-1 glass rounded-full border border-white/5 text-[10px] uppercase tracking-widest font-black text-green-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            All Systems Operational
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
