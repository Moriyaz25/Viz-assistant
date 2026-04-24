import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Download a DOM element as a high-res PNG
 */
export const downloadChartAsPNG = async (elementId, fileName = 'chart.png') => {
    const element = document.getElementById(elementId)
    if (!element) return console.error(`Element #${elementId} not found`)

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            onclone: (clonedDoc) => {
                const el = clonedDoc.getElementById(elementId)
                if (el) el.style.background = 'white'
            }
        })
        const link = document.createElement('a')
        link.download = fileName
        link.href = canvas.toDataURL('image/png')
        link.click()
    } catch (error) {
        console.error('PNG download failed:', error)
        alert('Failed to download chart. Please try again.')
    }
}

/**
 * Export a full analysis report as PDF
 * Captures chart image + renders insights text natively in jsPDF
 */
export const exportFullReportAsPDF = async (chartElementId, insightsText, datasetName = 'Dataset') => {
    try {
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pageW = pdf.internal.pageSize.getWidth()
        const pageH = pdf.internal.pageSize.getHeight()
        const margin = 14
        const contentW = pageW - margin * 2

        // ── Header ──────────────────────────────────────────────
        pdf.setFillColor(109, 40, 217) // primary purple
        pdf.rect(0, 0, pageW, 28, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Vizassistant', margin, 12)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text('AI-Powered Data Analysis Report', margin, 20)

        // Dataset name + date
        pdf.setFontSize(8)
        const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        pdf.text(`Dataset: ${datasetName}   |   Generated: ${dateStr}`, margin, 26)

        let cursorY = 36

        // ── Chart Screenshot ──────────────────────────────────
        const chartEl = document.getElementById(chartElementId)
        if (chartEl) {
            try {
                const canvas = await html2canvas(chartEl, {
                    backgroundColor: '#ffffff',
                    scale: 1.5,
                    useCORS: true,
                    onclone: (clonedDoc) => {
                        const el = clonedDoc.getElementById(chartElementId)
                        if (el) el.style.background = 'white'
                    }
                })
                const imgData = canvas.toDataURL('image/png')
                const imgH = (canvas.height * contentW) / canvas.width
                const clampedH = Math.min(imgH, 90) // don't let chart take entire page
                pdf.addImage(imgData, 'PNG', margin, cursorY, contentW, clampedH)
                cursorY += clampedH + 8
            } catch (e) {
                console.warn('Chart capture skipped:', e)
            }
        }

        // ── Divider ──────────────────────────────────────────
        pdf.setDrawColor(200, 200, 200)
        pdf.line(margin, cursorY, pageW - margin, cursorY)
        cursorY += 6

        // ── AI Insights Section ───────────────────────────────
        pdf.setTextColor(30, 30, 30)
        pdf.setFontSize(13)
        pdf.setFont('helvetica', 'bold')
        pdf.text('AI Strategic Report', margin, cursorY)
        cursorY += 7

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(60, 60, 60)

        // Clean markdown for PDF (remove **, ##, *, etc.)
        const cleanText = (insightsText || 'No insights generated yet.')
            .replace(/#{1,6}\s*/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/---+/g, '')
            .trim()

        const lines = pdf.splitTextToSize(cleanText, contentW)

        lines.forEach((line) => {
            if (cursorY > pageH - 20) {
                pdf.addPage()
                cursorY = 20

                // Repeat header strip on new page
                pdf.setFillColor(109, 40, 217)
                pdf.rect(0, 0, pageW, 10, 'F')
                pdf.setTextColor(255, 255, 255)
                pdf.setFontSize(7)
                pdf.text('Vizassistant — Continued', margin, 7)

                pdf.setTextColor(60, 60, 60)
                pdf.setFontSize(9)
                pdf.setFont('helvetica', 'normal')
            }
            pdf.text(line, margin, cursorY)
            cursorY += 5
        })

        // ── Footer ─────────────────────────────────────────────
        const totalPages = pdf.internal.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i)
            pdf.setFontSize(7)
            pdf.setTextColor(160, 160, 160)
            pdf.text(
                `Vizassistant AI Report  |  Page ${i} of ${totalPages}  |  vizassistant.app`,
                margin,
                pageH - 6
            )
        }

        pdf.save(`${datasetName.replace(/[^a-z0-9]/gi, '_')}_report.pdf`)
    } catch (error) {
        console.error('PDF export failed:', error)
        alert('Failed to export PDF. Please try again.')
    }
}

/**
 * Export raw dataset as a CSV file
 */
export const exportDataAsCSV = (data, fileName = 'dataset.csv') => {
    if (!data || data.length === 0) return alert('No data to export.')

    try {
        const headers = Object.keys(data[0])
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(h => {
                    const val = row[h] ?? ''
                    // Wrap in quotes if contains comma, newline or quote
                    const str = String(val)
                    return str.includes(',') || str.includes('\n') || str.includes('"')
                        ? `"${str.replace(/"/g, '""')}"`
                        : str
                }).join(',')
            )
        ]
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        link.click()
        URL.revokeObjectURL(link.href)
    } catch (error) {
        console.error('CSV export failed:', error)
        alert('Failed to export CSV. Please try again.')
    }
}

/**
 * Export AI insights text as a plain .txt file
 */
export const exportInsightsAsTxt = (insightsText, fileName = 'insights.txt') => {
    if (!insightsText) return alert('No insights to export.')
    const blob = new Blob([insightsText], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    URL.revokeObjectURL(link.href)
}
