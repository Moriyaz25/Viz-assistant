import OpenAI from 'openai'

if (!process.env.GROQ_API_KEY) {
    console.warn('[WARN] GROQ_API_KEY is not set in .env — AI features will not work.')
}

export const groq = process.env.GROQ_API_KEY
    ? new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
    })
    : null

export const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

/**
 * Helper: call Groq and parse JSON from response
 */
export async function groqJSON(systemPrompt, userPrompt, maxTokens = 1500) {
    if (!groq) throw new Error('GROQ_API_KEY not configured')

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: maxTokens,
    })

    const raw = completion.choices[0].message.content.trim()
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
}

/**
 * Helper: call Groq and return plain text
 */
export async function groqText(systemPrompt, userPrompt, maxTokens = 2000, temperature = 0.5) {
    if (!groq) throw new Error('GROQ_API_KEY not configured')

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
    })

    return completion.choices[0].message.content.trim()
}