import { useEffect, useRef, useState } from 'react'
import { detectFace, loadFaceModels } from '@/lib/ai/faceDetector'
import { swapFaceAffine } from '@/lib/ai/faceSwapper'
import { FaceDetectionResult } from '@/types/pose'

interface UseFaceSwapReturn {
  isModelLoaded: boolean
  isDetecting: boolean
  sourceFace: FaceDetectionResult | null
  targetFace: FaceDetectionResult | null
  error: string | null
  performFaceSwap: (
    sourceCanvas: HTMLCanvasElement,
    targetCanvas: HTMLCanvasElement
  ) => void
}

export const useFaceSwap = (
  sourceImage: HTMLImageElement | null,
  targetImage: HTMLImageElement | null,
  enabled: boolean = true
): UseFaceSwapReturn => {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [sourceFace, setSourceFace] = useState<FaceDetectionResult | null>(null)
  const [targetFace, setTargetFace] = useState<FaceDetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isDisposedRef = useRef(false)

  // 모델 로드
  useEffect(() => {
    if (!enabled) return

    let isMounted = true

    const loadModel = async () => {
      try {
        await loadFaceModels()
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
  }, [enabled])

  // 얼굴 감지
  useEffect(() => {
    if (!isModelLoaded || !sourceImage || !targetImage || !enabled) {
      return
    }

    isDisposedRef.current = false

    const detectFaces = async () => {
      if (isDisposedRef.current) return

      try {
        setIsDetecting(true)

        // 소스 얼굴 감지
        const srcFace = await detectFace(sourceImage)
        if (!srcFace) {
          if (!isDisposedRef.current) {
            setError('소스 이미지에서 얼굴을 감지할 수 없습니다')
          }
          return
        }

        // 대상 얼굴 감지
        const tgtFace = await detectFace(targetImage)
        if (!tgtFace) {
          if (!isDisposedRef.current) {
            setError('대상 이미지에서 얼굴을 감지할 수 없습니다')
          }
          return
        }

        if (!isDisposedRef.current) {
          setSourceFace(srcFace)
          setTargetFace(tgtFace)
          setError(null)
        }
      } catch (err) {
        if (!isDisposedRef.current) {
          const errorMsg = err instanceof Error ? err.message : '얼굴 감지 실패'
          setError(errorMsg)
        }
      } finally {
        if (!isDisposedRef.current) {
          setIsDetecting(false)
        }
      }
    }

    detectFaces()

    return () => {
      isDisposedRef.current = true
    }
  }, [isModelLoaded, sourceImage, targetImage, enabled])

  const performFaceSwap = (
    sourceCanvas: HTMLCanvasElement,
    targetCanvas: HTMLCanvasElement
  ) => {
    if (!sourceFace || !targetFace) {
      console.warn('Face detection results not available')
      return
    }

    try {
      const sourceCtx = sourceCanvas.getContext('2d')
      const targetCtx = targetCanvas.getContext('2d')

      if (!sourceCtx || !targetCtx) {
        console.error('Could not get canvas context')
        return
      }

      swapFaceAffine({
        sourceCanvas,
        targetContext: targetCtx,
        sourceFace,
        targetFace,
      })
    } catch (err) {
      console.error('Face swap error:', err)
    }
  }

  return {
    isModelLoaded,
    isDetecting,
    sourceFace,
    targetFace,
    error,
    performFaceSwap,
  }
}
