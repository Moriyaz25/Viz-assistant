import 'dotenv/config' // ← MUST be first — loads .env before any other import runs

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

import aiRoutes from './routes/ai.js'
import healthRoutes from './routes/health.js'

const app = express()
const PORT = process.env.PORT || 5000

// ── Security middleware ───────────────────────────────────────────────
app.use(helmet())

app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://viz-assistant.vercel.app',
     
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

// ── Body parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' })) // 10mb for large datasets
app.use(express.urlencoded({ extended: true }))

// ── Rate limiting ─────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait 15 minutes.' }
})

const aiLimiter = rateLimit({
    windowMs: 60 * 1000,       // 1 minute
    max: 20,                   // 20 AI calls per minute per IP
    message: { error: 'AI rate limit reached. Please wait a moment.' }
})

app.use(limiter)
app.use('/api/ai', aiLimiter)

// ── Request logger (dev only) ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
        next()
    })
}

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api', healthRoutes)
app.use('/api/ai', aiRoutes)

// ── 404 handler ───────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

// ── Global error handler ──────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[Error]', err.message)
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    })
})

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Vizassistance Backend running on http://localhost:${PORT}`)
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
    console.log(`   Groq model  : ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`)
    console.log(`   AI endpoint : http://localhost:${PORT}/api/ai\n`)

    // Confirm key loaded — remove this line after verifying it works
    console.log(`   GROQ key    : ${process.env.GROQ_API_KEY ? '✅ Loaded' : '❌ MISSING — check .env'}`)
})