import { Router } from 'express'
import { groqJSON, groqText } from '../services/groq.js'

const router = Router()

/* ── Validation helper ───────────────────────────────────────────── */
function requireBody(fields) {
    return (req, res, next) => {
        for (const field of fields) {
            if (req.body[field] === undefined || req.body[field] === null) {
                return res.status(400).json({ error: `Missing required field: ${field}` })
            }
        }
        next()
    }
}

/* ──────────────────────────────────────────────────────────────────
   POST /api/ai/insights
   Body: { data: Array }
   Returns: { insights: string (markdown) }
────────────────────────────────────────────────────────────────── */
router.post('/insights', requireBody(['data']), async (req, res) => {
    try {
        const { data } = req.body
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: 'data must be a non-empty array' })
        }

        const columns = Object.keys(data[0])
        const preview = data.slice(0, 50)

        const system = `You are a professional data analyst. Return only markdown-formatted analysis.
No preamble like "Here is the analysis" — jump straight into the report.`

        const user = `
Dataset: ${data.length} rows × ${columns.length} columns
Columns: ${columns.join(', ')}
Sample data (first 50 rows):
${JSON.stringify(preview)}

Write a professional markdown data analysis report covering:
## 📊 Dataset Overview
## 🔍 Key Trends & Patterns
## ⚠️ Anomalies & Outliers
## 💡 Insights & Observations
## ✅ Recommended Actions

Be specific with numbers from the actual data. Be concise.`

        const insights = await groqText(system, user, 2000, 0.5)
        res.json({ insights })
    } catch (err) {
        console.error('[/ai/insights]', err.message)
        res.status(500).json({ error: err.message })
    }
})

/* ──────────────────────────────────────────────────────────────────
   POST /api/ai/ask
   Body: { question: string, data: Array }
   Returns: { answer: string }
────────────────────────────────────────────────────────────────── */
router.post('/ask', requireBody(['question', 'data']), async (req, res) => {
    try {
        const { question, data } = req.body
        const columns = Object.keys(data[0] || {})

        const system = `You are a helpful data analyst assistant. Answer questions about the dataset concisely and clearly.
Use markdown for formatting. Be direct and specific. If you can't answer from the data, say so.`

        const user = `
Dataset: ${data.length} rows × ${columns.length} columns
Columns: ${columns.join(', ')}
Sample (first 30 rows): ${JSON.stringify(data.slice(0, 30))}

User question: "${question}"

Answer clearly and specifically based on the data provided.`

        const answer = await groqText(system, user, 1000, 0.6)
        res.json({ answer })
    } catch (err) {
        console.error('[/ai/ask]', err.message)
        res.status(500).json({ error: err.message })
    }
})

/* ──────────────────────────────────────────────────────────────────
   POST /api/ai/nl-chart
   Body: { query: string, columns: string[], sampleData: Array }
   Returns: { config: { chartType, xAxisKey, yAxisKey, title, reasoning } }
────────────────────────────────────────────────────────────────── */
router.post('/nl-chart', requireBody(['query', 'columns', 'sampleData']), async (req, res) => {
    try {
        const { query, columns, sampleData } = req.body

        const numericCols = columns.filter(col => {
            const val = sampleData.find(r => r[col] !== null && r[col] !== undefined)?.[col]
            return typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))
        })
        const categoricalCols = columns.filter(c => !numericCols.includes(c))

        const system = `You are a data visualization expert. Return ONLY valid JSON. No markdown, no explanation.`

        const user = `
Dataset columns: ${JSON.stringify(columns)}
Numeric columns: ${JSON.stringify(numericCols)}
Categorical columns: ${JSON.stringify(categoricalCols)}
Sample data (3 rows): ${JSON.stringify(sampleData)}

User query: "${query}"

Return ONLY this JSON:
{
  "chartType": "bar" | "line" | "area" | "pie",
  "xAxisKey": "<column name>",
  "yAxisKey": "<numeric column name>",
  "title": "<short chart title>",
  "reasoning": "<one sentence why this chart was chosen>"
}`

        const config = await groqJSON(system, user, 400)
        res.json({ config })
    } catch (err) {
        console.error('[/ai/nl-chart]', err.message)
        res.status(500).json({ error: err.message })
    }
})

/* ──────────────────────────────────────────────────────────────────
   POST /api/ai/anomalies
   Body: { outliers: Array }
   Returns: { explanations: Array }
────────────────────────────────────────────────────────────────── */
router.post('/anomalies', requireBody(['outliers']), async (req, res) => {
    try {
        const { outliers } = req.body

        const system = `You are a data analyst. Return ONLY a JSON array. No markdown, no explanation.`

        const user = `
Statistical outliers (Z-score > 2.5) found in a dataset:
${JSON.stringify(outliers)}

For each outlier, return a JSON array:
[
  {
    "rowIndex": <number>,
    "column": "<col>",
    "value": <number>,
    "severity": "high" | "medium",
    "explanation": "<1-2 sentence business explanation of why this is unusual>"
  }
]`

        const explanations = await groqJSON(system, user, 1200)
        res.json({ explanations: Array.isArray(explanations) ? explanations : [] })
    } catch (err) {
        console.error('[/ai/anomalies]', err.message)
        // Return empty so frontend falls back to stat-only mode
        res.json({ explanations: [] })
    }
})

/* ──────────────────────────────────────────────────────────────────
   POST /api/ai/story
   Body: { fileName, rowCount, columns, insights, sample }
   Returns: { slides: Array }
────────────────────────────────────────────────────────────────── */
router.post('/story', requireBody(['fileName']), async (req, res) => {
    try {
        const { fileName, rowCount, columns, insights, sample } = req.body

        const system = `You are a data storytelling expert. Return ONLY a valid JSON array of exactly 5 slides. No markdown.`

        const user = `
Dataset: "${fileName}"
Rows: ${rowCount}, Columns: ${(columns || []).join(', ')}
AI Insights: ${insights || 'Not available'}
Sample data: ${JSON.stringify(sample || [])}

Return ONLY a JSON array of 5 slides:
[
  {
    "slideNumber": 1, "type": "title",
    "headline": "<compelling headline>",
    "subheadline": "<supporting statement>",
    "emoji": "<emoji>",
    "keyMetric": "<one important number>",
    "color": "violet"
  },
  {
    "slideNumber": 2, "type": "finding",
    "headline": "<key finding>",
    "body": "<2-3 sentence explanation>",
    "emoji": "<emoji>",
    "bulletPoints": ["<point 1>", "<point 2>", "<point 3>"],
    "color": "blue"
  },
  {
    "slideNumber": 3, "type": "anomaly",
    "headline": "<what stands out>",
    "body": "<what is unusual>",
    "emoji": "<emoji>",
    "bulletPoints": ["<obs 1>", "<obs 2>", "<obs 3>"],
    "color": "amber"
  },
  {
    "slideNumber": 4, "type": "opportunity",
    "headline": "<opportunity/risk>",
    "body": "<business implication>",
    "emoji": "<emoji>",
    "bulletPoints": ["<action 1>", "<action 2>", "<action 3>"],
    "color": "emerald"
  },
  {
    "slideNumber": 5, "type": "conclusion",
    "headline": "<conclusion>",
    "body": "<summary and next steps>",
    "emoji": "<emoji>",
    "bulletPoints": ["<rec 1>", "<rec 2>", "<rec 3>"],
    "color": "violet"
  }
]`

        const slides = await groqJSON(system, user, 1800)
        res.json({ slides: Array.isArray(slides) ? slides : [] })
    } catch (err) {
        console.error('[/ai/story]', err.message)
        res.status(500).json({ error: err.message })
    }
})

/* ──────────────────────────────────────────────────────────────────
   POST /api/ai/clean
   Body: { instruction: string, columns: string[], sampleData: Array }
   Returns: { operation: object }
────────────────────────────────────────────────────────────────── */
router.post('/clean', requireBody(['instruction', 'columns']), async (req, res) => {
    try {
        const { instruction, columns, sampleData } = req.body

        const system = `You are a data cleaning assistant. Return ONLY valid JSON. No markdown.`

        const user = `
Columns: ${JSON.stringify(columns)}
Sample data: ${JSON.stringify((sampleData || []).slice(0, 3))}
User instruction: "${instruction}"

Return ONLY this JSON:
{
  "operation": "remove_nulls"|"fill_nulls"|"remove_duplicates"|"filter_rows"|"replace_value"|"trim_whitespace"|"convert_type"|"remove_outliers",
  "column": "<column name or null for all>",
  "params": {
    "fillValue": "<value if fill_nulls>",
    "filterCondition": "<gt|lt|eq|neq if filter_rows>",
    "filterValue": <number or string>,
    "fromValue": "<replace from>",
    "toValue": "<replace to>",
    "targetType": "<number|string|date>"
  },
  "description": "<human readable description>",
  "estimatedRowsAffected": "few|some|many|unknown"
}`

        const operation = await groqJSON(system, user, 500)
        res.json({ operation })
    } catch (err) {
        console.error('[/ai/clean]', err.message)
        res.status(500).json({ error: err.message })
    }
})

/* ──────────────────────────────────────────────────────────────────
   POST /api/ai/formulas
   Body: { column: string, allColumns: string[], sampleData: Array }
   Returns: { formulas: Array }
────────────────────────────────────────────────────────────────── */
router.post('/formulas', requireBody(['column', 'allColumns']), async (req, res) => {
    try {
        const { column, allColumns, sampleData } = req.body

        const system = `You are a data analyst. Return ONLY a JSON array of 3 formula suggestions. No markdown.`

        const user = `
Focus column: "${column}"
All columns: ${JSON.stringify(allColumns)}
Sample data: ${JSON.stringify((sampleData || []).slice(0, 3))}

Return ONLY a JSON array of 3 suggestions:
[
  {
    "title": "<short name>",
    "formula": "<description of calculation>",
    "useCase": "<why useful in 1 sentence>",
    "newColumnName": "<suggested column name>",
    "type": "ratio"|"percentage"|"growth"|"rank"|"zscore"|"bin"
  }
]`

        const formulas = await groqJSON(system, user, 800)
        res.json({ formulas: Array.isArray(formulas) ? formulas : [] })
    } catch (err) {
        console.error('[/ai/formulas]', err.message)
        res.json({ formulas: [] })
    }
})

export default router
