import { useRef, useEffect, useCallback } from 'react'
import { X, Share2, Download } from 'lucide-react'

export default function AchievementShareCanvas({ achievement, userName, isOpen, onClose }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !achievement) return

    const ctx = canvas.getContext('2d')
    const w = 1080
    const h = 1080
    canvas.width = w
    canvas.height = h

    // Background
    ctx.fillStyle = '#0e0f12'
    ctx.fillRect(0, 0, w, h)

    // Subtle gradient overlay
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    grad.addColorStop(0, 'rgba(74, 222, 128, 0.06)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // "mi EconomIA" top center
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText('mi EconomIA', w / 2, 120)

    // Achievement emoji
    ctx.font = '120px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText(achievement.icon, w / 2, h / 2 - 40)

    // Achievement title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText(achievement.title, w / 2, h / 2 + 60)

    // Description
    ctx.fillStyle = '#71717a'
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText(achievement.description, w / 2, h / 2 + 110)

    // "Logrado por {userName}"
    ctx.fillStyle = '#71717a'
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText(`Logrado por ${userName}`, w / 2, h / 2 + 180)

    // "mieconomia.com" bottom center
    ctx.fillStyle = '#4ade80'
    ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText('mieconomia.com', w / 2, h - 80)

    // Set preview image
    if (imageRef.current) {
      imageRef.current.src = canvas.toDataURL('image/png')
    }
  }, [achievement, userName])

  useEffect(() => {
    if (isOpen && achievement) {
      // Small delay to ensure canvas is in the DOM
      requestAnimationFrame(drawCanvas)
    }
  }, [isOpen, achievement, drawCanvas])

  if (!isOpen || !achievement) return null

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (navigator.share && blob) {
        const file = new File([blob], `logro-${achievement.id}.png`, { type: 'image/png' })
        await navigator.share({
          title: `Logro: ${achievement.title}`,
          text: `Desbloqueé "${achievement.title}" en mi EconomIA!`,
          files: [file],
        })
      }
    } catch (err) {
      // User cancelled share or share not available
      console.log('Share cancelled or unavailable', err)
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `logro-${achievement.id}.png`
    link.href = url
    link.click()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-dark-text">Compartir logro</h3>
          <button onClick={onClose} className="text-dark-muted hover:text-dark-text">
            <X size={20} />
          </button>
        </div>

        {/* Hidden canvas for drawing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Image preview */}
        <div className="rounded-lg overflow-hidden mb-4 border border-dark-border">
          <img
            ref={imageRef}
            alt={`Logro: ${achievement.title}`}
            className="w-full h-auto"
          />
        </div>

        <div className="flex gap-3">
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-accent text-dark-bg font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Share2 size={16} />
              Compartir
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 border border-dark-border text-dark-text font-semibold py-2.5 rounded-lg hover:border-dark-muted transition-colors"
          >
            <Download size={16} />
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}
