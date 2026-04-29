import { useEffect, useRef } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { usePoseDetection } from '@/hooks/usePoseDetection'
import { drawClothingOverlay, debugDrawBodyRegion } from '@/lib/canvas/clothingDrawer'
import { BodyInfo } from '@/types/bodyInfo'
import { ClothingCategory } from '@/types/product'

interface PreviewCanvasProps {
  clothingImageUrl: string
  clothingCategory: ClothingCategory
  bodyInfo: BodyInfo
  sourceImageUrl?: string // 갤러리 이미지 (없으면 카메라 사용)
  onCaptureReady?: (canvas: HTMLCanvasElement) => void
  showDebug?: boolean
}

export default function PreviewCanvas({
  clothingImageUrl,
  clothingCategory,
  bodyInfo,
  sourceImageUrl,
  onCaptureReady,
  showDebug = false,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const clothingImageRef = useRef<HTMLImageElement | null>(null)
  const sourceImageRef = useRef<HTMLImageElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const { videoRef, stream, error: cameraError, startCamera } = useCamera()
  const { isModelLoaded, poseResult, error: poseError } = usePoseDetection(
    sourceImageUrl ? sourceImageRef.current : videoRef.current,
    200 // 200ms 간격으로 포즈 감지
  )

  // 카메라 시작
  useEffect(() => {
    if (!sourceImageUrl) {
      startCamera()
    }
  }, [sourceImageUrl, startCamera])

  // 의류 이미지 로드
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      clothingImageRef.current = img
    }
    img.onerror = () => {
      console.error('Failed to load clothing image:', clothingImageUrl)
    }
    img.src = clothingImageUrl
  }, [clothingImageUrl])

  // 갤러리 이미지 로드 (사용 시)
  useEffect(() => {
    if (!sourceImageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      sourceImageRef.current = img
    }
    img.onerror = () => {
      console.error('Failed to load source image:', sourceImageUrl)
    }
    img.src = sourceImageUrl
  }, [sourceImageUrl])

  // Canvas 렌더링 루프
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas 크기 설정
    const updateCanvasSize = () => {
      if (sourceImageRef.current && sourceImageUrl) {
        // 갤러리 이미지 크기에 맞춤
        canvas.width = sourceImageRef.current.naturalWidth
        canvas.height = sourceImageRef.current.naturalHeight
      } else if (videoRef.current && videoRef.current.videoWidth) {
        // 비디오 크기에 맞춤
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
      }
    }

    const render = () => {
      updateCanvasSize()

      // 1. 배경 그리기 (카메라 또는 갤러리 이미지)
      if (sourceImageRef.current && sourceImageUrl) {
        ctx.drawImage(sourceImageRef.current, 0, 0)
      } else if (videoRef.current && stream) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      } else {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // 2. 의류 오버레이 (포즈 감지 결과 기반)
      if (poseResult && clothingImageRef.current) {
        try {
          drawClothingOverlay({
            ctx,
            clothingImage: clothingImageRef.current,
            bodyRegion: poseResult.bodyRegion,
            bodyInfo,
            category: clothingCategory,
          })
        } catch (error) {
          console.error('Error drawing clothing overlay:', error)
        }
      }

      // 3. 디버그 정보 (개발용)
      if (showDebug && poseResult) {
        debugDrawBodyRegion(ctx, poseResult.bodyRegion)

        // 포즈 감지 시간 표시
        ctx.fillStyle = '#fff'
        ctx.font = '14px Arial'
        ctx.fillText(
          `처리시간: ${poseResult.processingTime.toFixed(0)}ms`,
          10,
          30
        )
        ctx.fillText(
          `키포인트: ${poseResult.keypoints.length}`,
          10,
          50
        )
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [stream, poseResult, bodyInfo, clothingCategory, sourceImageUrl, showDebug])

  // 캡처 메서드 노출
  useEffect(() => {
    if (onCaptureReady && canvasRef.current) {
      onCaptureReady(canvasRef.current)
    }
  }, [onCaptureReady])

  return (
    <div className="flex flex-col gap-4">
      {/* 숨겨진 비디오 요소 */}
      {!sourceImageUrl && (
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          autoPlay
          playsInline
          muted
        />
      )}

      {/* 캔버스 */}
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg shadow-lg bg-black"
        style={{ aspectRatio: '4/5' }}
      />

      {/* 에러 메시지 */}
      {cameraError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          📷 카메라 오류: {
            cameraError === 'permission-denied'
              ? '카메라 권한을 확인해주세요'
              : cameraError === 'https-required'
                ? 'HTTPS 또는 localhost에서만 사용 가능합니다'
                : '지원하지 않는 기기입니다'
          }
        </div>
      )}

      {poseError && (
        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
          ⚠️ {poseError}
        </div>
      )}

      {/* 로딩 상태 */}
      {!isModelLoaded && (
        <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
          ⏳ AI 모델 로딩 중...
        </div>
      )}
    </div>
  )
}
