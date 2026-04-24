import { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const FileUpload = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState(null)
    const [error, setError] = useState(null)

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true)
        } else if (e.type === 'dragleave') {
            setIsDragging(false)
        }
    }, [])

    const validateFile = (file) => {
        const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid CSV or Excel file')
            return false
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('File size must be less than 5MB')
            return false
        }
        setError(null)
        return true
    }

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]
            if (validateFile(droppedFile)) {
                setFile(droppedFile)
                if (onFileSelect) onFileSelect(droppedFile)
            }
        }
    }, [onFileSelect])

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (validateFile(selectedFile)) {
                setFile(selectedFile)
                if (onFileSelect) onFileSelect(selectedFile)
            }
        }
    }

    const removeFile = () => {
        setFile(null)
        setError(null)
        if (onFileSelect) onFileSelect(null)
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!file ? (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out cursor-pointer",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                        error ? "border-destructive bg-destructive/5" : ""
                    )}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".csv, .xlsx, .xls"
                    />
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className={cn(
                            "p-4 rounded-full bg-muted",
                            isDragging ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        )}>
                            <Upload className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-foreground">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                CSV or Excel files (max 5MB)
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <File className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={removeFile}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-4 flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}

export default FileUpload
