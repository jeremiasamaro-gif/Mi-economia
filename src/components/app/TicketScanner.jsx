import { useState, useRef, useCallback } from 'react'
import { ScanLine, Camera, Upload, X, Loader2 } from 'lucide-react'
import { scanTicket } from '../../lib/ticketScanner'
import TicketConfirmModal from './TicketConfirmModal'

const DAILY_LIMIT = 10
const STORAGE_KEY = 'ticket_scan_usage'

function getDailyUsage() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const today = new Date().toISOString().split('T')[0]
    return data.date === today ? data.count : 0
  } catch { return 0 }
}

function incrementDailyUsage() {
  const today = new Date().toISOString().split('T')[0]
  const current = getDailyUsage()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: current + 1 }))
}

export default function TicketScanner({ isOpen, onClose, onExpenseAdded }) {
  const [mode, setMode] = useState('select')
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const dailyUsage = getDailyUsage()
  const canScan = dailyUsage < DAILY_LIMIT

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  const handleClose = () => {
    cleanup()
    setMode('select')
    setImageFile(null)
    setImageUrl(null)
    setScanResult(null)
    setError('')
    onClose()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setMode('preview')
    setError('')
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      setMode('camera')
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch {
      setError('No se pudo acceder a la cámara')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'ticket.jpg', { type: 'image/jpeg' })
        setImageFile(file)
        setImageUrl(URL.createObjectURL(file))
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
        setMode('preview')
      }
    }, 'image/jpeg', 0.85)
  }

  const handleScan = async () => {
    if (!imageFile || !canScan) return
    setScanning(true)
    setError('')
    try {
      const result = await scanTicket(imageFile)
      incrementDailyUsage()
      setScanResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-dark-surface border border-dark-border rounded-xl w-full max-w-md">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
            <div className="flex items-center gap-2">
              <ScanLine size={18} className="text-accent" />
              <h3 className="font-semibold">Escanear ticket</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-dark-muted font-mono">{dailyUsage}/{DAILY_LIMIT} hoy</span>
              <button onClick={handleClose} className="text-dark-muted hover:text-dark-text">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            {mode === 'select' && (
              <div className="space-y-3">
                <p className="text-sm text-dark-muted mb-4">
                  Sacale una foto al ticket o subí una imagen. Leemos el total y el comercio automáticamente.
                </p>
                <button
                  onClick={startCamera}
                  className="w-full flex items-center gap-3 bg-dark-bg border border-dark-border rounded-xl px-4 py-4 hover:border-accent transition-colors"
                >
                  <Camera size={20} className="text-accent" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Usar cámara</p>
                    <p className="text-xs text-dark-muted">Sacá una foto al ticket</p>
                  </div>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 bg-dark-bg border border-dark-border rounded-xl px-4 py-4 hover:border-accent transition-colors"
                >
                  <Upload size={20} className="text-accent" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Subir imagen</p>
                    <p className="text-xs text-dark-muted">JPG, PNG o WebP (máx 3MB)</p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {mode === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4]">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { cleanup(); setMode('select') }}
                    className="flex-1 text-dark-muted hover:text-dark-text text-sm py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-accent text-dark-bg py-2 rounded-lg text-sm font-semibold hover:bg-accent/90"
                  >
                    Capturar
                  </button>
                </div>
              </div>
            )}

            {mode === 'preview' && imageUrl && (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-black">
                  <img src={imageUrl} alt="Ticket" className="w-full max-h-80 object-contain" />
                </div>
                {!canScan && (
                  <p className="text-xs text-red-400 text-center">Límite diario alcanzado ({DAILY_LIMIT} escaneos/día)</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setMode('select'); setImageFile(null); setImageUrl(null) }}
                    className="flex-1 text-dark-muted hover:text-dark-text text-sm py-2"
                  >
                    Otra imagen
                  </button>
                  <button
                    onClick={handleScan}
                    disabled={scanning || !canScan}
                    className="flex-1 bg-accent text-dark-bg py-2 rounded-lg text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {scanning ? <><Loader2 size={16} className="animate-spin" /> Escaneando...</> : 'Escanear'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {scanResult && (
        <TicketConfirmModal
          result={scanResult}
          onConfirm={(expense) => {
            onExpenseAdded?.(expense)
            setScanResult(null)
            handleClose()
          }}
          onCancel={() => setScanResult(null)}
        />
      )}
    </>
  )
}
