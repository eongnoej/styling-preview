import { useEffect, useRef, useState } from 'react'

type CameraError = 'permission-denied' | 'not-supported' | 'https-required' | null

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  stream: MediaStream | null
  error: CameraError
  startCamera: () => Promise<void>
  stopCamera: () => void
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<CameraError>(null)

  const startCamera = async () => {
    try {
      setError(null)

      // HTTPS 또는 localhost 체크
      const isSecureContext = window.isSecureContext
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

      if (!isSecureContext && !isLocalhost) {
        setError('https-required')
        throw new Error('HTTPS 또는 localhost에서만 카메라를 사용할 수 있습니다')
      }

      // getUserMedia 요청
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // 비디오 재생 (자동 재생)
        try {
          await videoRef.current.play()
        } catch (e) {
          // 자동 재생 실패 (괜찮음)
        }
      }
    } catch (err) {
      console.error('Camera error:', err)

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('permission-denied')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('not-supported')
        }
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null
    }
  }

  // cleanup
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return {
    videoRef,
    stream,
    error,
    startCamera,
    stopCamera,
  }
}
