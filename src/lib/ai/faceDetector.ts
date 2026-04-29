import * as faceapi from '@vladmandic/face-api'
import { FaceDetectionResult } from '@/types/pose'

let modelsLoaded = false
let isLoadingModels = false

// CDN에서 모델 로드 (로컬 설치 불필요)
const MODELS_PATH = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

export const loadFaceModels = async (): Promise<void> => {
  if (modelsLoaded) {
    return
  }

  if (isLoadingModels) {
    // 로딩 중인 경우 완료될 때까지 기다림
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (modelsLoaded) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  isLoadingModels = true

  try {
    // face-api 모델 로드
    // TinyFaceDetector: 빠르고 경량 (모바일용)
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH)
    // 68개 얼굴 특징점 (경량 버전)
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH)
    // (선택적) 얼굴 표현 벡터 - MVP에서는 생략 가능
    // await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH)

    modelsLoaded = true
    console.log('✅ face-api 모델 로드 완료')
  } catch (error) {
    console.error('❌ face-api 모델 로드 실패:', error)
    isLoadingModels = false
    throw new Error('얼굴 감지 모델을 로드할 수 없습니다')
  }
}

export const detectFace = async (
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<FaceDetectionResult | null> => {
  try {
    await loadFaceModels()

    const detections = await faceapi
      .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()

    if (!detections) {
      return null
    }

    const { detection, landmarks } = detections
    const { x, y, width, height } = detection.box

    return {
      box: { x, y, width, height },
      landmarks: landmarks.positions.map((p) => ({ x: p.x, y: p.y })),
      score: detection.score,
    }
  } catch (error) {
    console.error('Face detection error:', error)
    return null
  }
}

export const getFaceRegion = (faceResult: FaceDetectionResult | null): { x: number; y: number; width: number; height: number } | null => {
  if (!faceResult) return null

  const { box } = faceResult
  // 얼굴 주변에 약간의 패딩 추가
  const padding = {
    top: box.height * 0.2,
    sides: box.width * 0.15,
  }

  return {
    x: Math.max(0, box.x - padding.sides),
    y: Math.max(0, box.y - padding.top),
    width: box.width + padding.sides * 2,
    height: box.height + padding.top * 2,
  }
}
