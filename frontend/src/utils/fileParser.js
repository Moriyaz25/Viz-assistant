import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export const parseFile = (file) => {
    return new Promise((resolve, reject) => {
        const fileType = file.type

        // CSV
        if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true, // auto convert numbers
                complete: (results) => {
                    resolve({
                        data: results.data,
                        meta: results.meta,
                        fileName: file.name
                    })
                },
                error: (error) => {
                    reject(error)
                }
            })
        }
        // Excel
        else if (
            fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            fileType === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        ) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result)
                    const workbook = XLSX.read(data, { type: 'array' })
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

                    if (jsonData.length === 0) {
                        resolve({ data: [], meta: { fields: [] }, fileName: file.name })
                        return
                    }

                    // Convert array of arrays to array of objects
                    const headers = jsonData[0]
                    const rows = jsonData.slice(1)

                    const formattedData = rows.map(row => {
                        const obj = {}
                        headers.forEach((header, index) => {
                            // Try to parse numbers if possible, mimics PapaParse dynamicTyping logic roughly
                            let val = row[index]
                            if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
                                val = Number(val)
                            }
                            obj[header] = val
                        })
                        return obj
                    })

                    resolve({
                        data: formattedData,
                        meta: { fields: headers },
                        fileName: file.name
                    })
                } catch (err) {
                    reject(err)
                }
            }
            reader.onerror = (error) => reject(error)
            reader.readAsArrayBuffer(file)
        }
        else {
            reject(new Error('Unsupported file type'))
        }
    })
}
