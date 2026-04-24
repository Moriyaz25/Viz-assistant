import { Router } from 'express'
import { groq, MODEL } from '../services/groq.js'

const router = Router()

router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'Vizassistance Backend',
        timestamp: new Date().toISOString(),
        ai: groq ? 'connected' : 'not configured (missing GROQ_API_KEY)',
        model: MODEL,
        version: '1.0.0'
    })
})

export default router
