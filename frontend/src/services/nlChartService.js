/**
 * NL Chart Service - Frontend
 * All feature AI calls go through the backend Express server.
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

// Feature 1: NL to Chart
export const nlToChart = async (query, columns, sampleData) => {
    try {
        const result = await post('/ai/nl-chart', { query, columns, sampleData: sampleData.slice(0, 3) })
        return result.config
    } catch (err) {
        console.error('NL chart error:', err)
        return null
    }
}

// Feature 2: Anomaly Detection
export const detectAnomalies = async (data, numericColumns) => {
    if (!data || data.length === 0) return []

    // Compute Z-score outliers client-side (no API needed for stats)
    const stats = {}
    numericColumns.forEach(col => {
        const vals = data.map(r => Number(r[col])).filter(v => !isNaN(v))
        if (!vals.length) return
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length
        const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length)
        stats[col] = { mean, std }
    })

    const outliers = []
    data.forEach((row, idx) => {
        numericColumns.forEach(col => {
            if (!stats[col]) return
            const val = Number(row[col])
            if (isNaN(val)) return
            const z = Math.abs((val - stats[col].mean) / (stats[col].std || 1))
            if (z > 2.5) {
                outliers.push({
                    rowIndex: idx + 1,
                    column: col,
                    value: val,
                    mean: Number(stats[col].mean.toFixed(2)),
                    std: Number(stats[col].std.toFixed(2)),
                    zScore: z.toFixed(2),
                    direction: val > stats[col].mean ? 'HIGH' : 'LOW',
                    rowData: row
                })
            }
        })
    })

    if (outliers.length === 0) return []

    // Ask backend to explain them
    try {
        const result = await post('/ai/anomalies', { outliers: outliers.slice(0, 15) })
        return (result.explanations || []).map((exp, i) => ({ ...outliers[i], ...exp }))
    } catch {
        return outliers.slice(0, 15).map(o => ({
            ...o,
            severity: Number(o.zScore) > 3 ? 'high' : 'medium',
            explanation: `This value (${o.value}) is ${o.zScore} standard deviations ${o.direction === 'HIGH' ? 'above' : 'below'} the column average (${o.mean}).`
        }))
    }
}

// Feature 3: Data Story Generator
export const generateDataStory = async (data, insights, fileName) => {
    try {
        const result = await post('/ai/story', {
            fileName,
            rowCount: data.length,
            columns: Object.keys(data[0] || {}),
            insights: (insights || '').substring(0, 800),
            sample: data.slice(0, 5)
        })
        return result.slides
    } catch (err) {
        console.error('Story error:', err)
        return null
    }
}

// Feature 5: Conversational Data Cleaning
export const parseCleaningInstruction = async (instruction, columns, sampleData) => {
    try {
        const result = await post('/ai/clean', { instruction, columns, sampleData: sampleData.slice(0, 3) })
        return result.operation
    } catch (err) {
        console.error('Clean parse error:', err)
        return null
    }
}

// Feature 8: AI Formula Suggestions
export const suggestFormulas = async (column, allColumns, sampleData) => {
    try {
        const result = await post('/ai/formulas', { column, allColumns, sampleData: sampleData.slice(0, 3) })
        return result.formulas || []
    } catch (err) {
        console.error('Formula suggestions error:', err)
        return []
    }
}

// Feature 10: Version Diff (pure client-side, no API)
export const compareDatasetVersions = async (oldData, newData, fileName) => {
    if (!oldData || !newData) return null
    const oldCols = Object.keys(oldData[0] || {})
    const newCols = Object.keys(newData[0] || {})
    const addedCols = newCols.filter(c => !oldCols.includes(c))
    const removedCols = oldCols.filter(c => !newCols.includes(c))
    const rowDiff = newData.length - oldData.length
    const changes = []
    const checkRows = Math.min(oldData.length, newData.length, 100)
    const commonCols = oldCols.filter(c => newCols.includes(c))
    for (let i = 0; i < checkRows; i++) {
        commonCols.forEach(col => {
            const oldVal = String(oldData[i][col] ?? '')
            const newVal = String(newData[i][col] ?? '')
            if (oldVal !== newVal) changes.push({ row: i + 1, column: col, oldValue: oldVal, newValue: newVal })
        })
        if (changes.length >= 20) break
    }
    return {
        fileName, oldRowCount: oldData.length, newRowCount: newData.length,
        rowDiff, addedRows: Math.max(0, rowDiff), removedRows: Math.max(0, -rowDiff),
        addedColumns: addedCols, removedColumns: removedCols,
        changedValues: changes, totalChanges: changes.length,
        summary: `${Math.abs(rowDiff)} rows ${rowDiff >= 0 ? 'added' : 'removed'}, ${changes.length} value changes, ${addedCols.length} new columns.`
    }
}
