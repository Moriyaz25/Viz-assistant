/**
 * AI Service - Frontend
 * All AI calls go through the backend Express server.
 * This keeps the GROQ_API_KEY secure and out of the browser.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function post(endpoint, body) {
    const res = await fetch(`${API_URL}/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || 'Backend error')
    }
    return res.json()
}

export const generateInsights = async (data) => {
    if (!data || data.length === 0) return 'No data available to analyze.'
    try {
        const result = await post('/ai/insights', { data: data.slice(0, 100) })
        return result.insights
    } catch (err) {
        console.error('Insights error:', err)
        return `ERROR: ${err.message}`
    }
}

export const askAI = async (question, data) => {
    if (!question || !data) return 'Please provide a question and data.'
    try {
        const result = await post('/ai/ask', { question, data: data.slice(0, 100) })
        return result.answer
    } catch (err) {
        console.error('AskAI error:', err)
        return `Sorry, I couldn't process that: ${err.message}`
    }
}
