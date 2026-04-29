import { useEffect, useRef, useState } from 'react'
import { detectPose, PoseDetectionResult } from '@/lib/ai/poseDetector'
import { loadPoseDetector } from '@/lib/ai/modelLoader'

interface UsePoseDetectionReturn {
  isModelLoaded: boolean
  isDetecting: boolean
  poseResult: PoseDetectionResult | null
  error: string | null
}

export const usePoseDetection = (
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | null,
  interval: number = 200 // ms
): UsePoseDetectionReturn => {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [poseResult, setPoseResult] = useState<PoseDetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isDisposedRef = useRef(false)

  // 모델 로드
  useEffect(() => {
    let isMounted = true

    const loadModel = async () => {
      try {
        await loadPoseDetector()
        if (isMounted) {
          setIsModelLoaded(true)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : '모델 로드 실패'
          setError(errorMsg)
          setIsModelLoaded(false)
        }
      }
    }

    loadModel()

    return () => {
      isMounted = false
    }
  }, [])

  // 포즈 감지 루프
  useEffect(() => {
    if (!isModelLoaded || !source) {
      return
    }

    isDisposedRef.current = false

    const runDetection = async () => {
      if (isDisposedRef.current) return

      try {
        setIsDetecting(true)
        const result = await detectPose(source)

        if (!isDisposedRef.current) {
          setPoseResult(result)
          setError(null)
        }
      } catch (err) {
        if (!isDisposedRef.current) {
          const errorMsg = err instanceof Error ? err.message : '포즈 감지 실패'
          setError(errorMsg)
        }
      } finally {
        if (!isDisposedRef.current) {
          setIsDetecting(false)
        }
      }
    }

    // 첫 번째 감지는 즉시 실행
    runDetection()

    // 이후 주기적으로 감지
    detectionIntervalRef.current = setInterval(runDetection, interval)

    return () => {
      isDisposedRef.current = true
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [isModelLoaded, source, interval])

  return {
    isModelLoaded,
    isDetecting,
    poseResult,
    error,
  }
}
