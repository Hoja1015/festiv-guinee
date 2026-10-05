import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

interface QrScannerProps {
  onDetect: (value: string) => void
  // En pause (résultat affiché, requête en cours...) : la caméra reste
  // allumée mais on ne décode plus.
  paused: boolean
}

// Lecture du QR code via la caméra : getUserMedia + décodage jsQR sur une
// image réduite. Nécessite HTTPS (ou localhost) pour accéder à la caméra.
export function QrScanner({ onDetect, paused }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pausedRef = useRef(paused)
  const onDetectRef = useRef(onDetect)
  const [error, setError] = useState<string | null>(null)

  // La boucle de décodage tourne en dehors du rendu : on lui donne les
  // dernières valeurs via des refs plutôt que de la relancer à chaque rendu.
  useEffect(() => {
    pausedRef.current = paused
    onDetectRef.current = onDetect
  })

  useEffect(() => {
    let stream: MediaStream | null = null
    let frame = 0
    let cancelled = false

    function tick() {
      frame = requestAnimationFrame(tick)

      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || pausedRef.current || video.readyState < video.HAVE_ENOUGH_DATA) return

      // Image réduite : le décodage reste rapide même sur un téléphone modeste.
      const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight))
      canvas.width = Math.round(video.videoWidth * scale)
      canvas.height = Math.round(video.videoHeight * scale)

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })
      if (code?.data) onDetectRef.current(code.data)
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Caméra indisponible. Ouvre l\'application en HTTPS (ou sur localhost).')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        tick()
      } catch {
        setError('Impossible d\'accéder à la caméra. Vérifie l\'autorisation dans ton navigateur.')
      }
    }

    start()

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  if (error) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-white/5 p-6 text-center text-sm text-ink-300">
        {error}
      </div>
    )
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-black">
      <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Cadre de visée */}
      <div className="pointer-events-none absolute inset-[14%] rounded-2xl border-2 border-white/70" />
    </div>
  )
}