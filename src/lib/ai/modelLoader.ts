import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as poseDetection from '@tensorflow-models/pose-detection'

let poseDetector: poseDetection.PoseDetector | null = null
let isLoadingPose = false

export const loadPoseDetector = async (): Promise<poseDetection.PoseDetector> => {
  if (poseDetector) {
    return poseDetector
  }

  if (isLoadingPose) {
    // 로딩 중인 경우 완료될 때까지 기다림
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (poseDetector) {
          clearInterval(checkInterval)
          resolve(poseDetector!)
        }
      }, 100)
    })
  }

  isLoadingPose = true

  try {
    // TensorFlow.js 백엔드 초기화
    await tf.setBackend('webgl')
    await tf.ready()

    // BlazePose lite 모델 로드
    poseDetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.BlazePose,
      {
        runtime: 'tfjs',
        modelType: 'lite', // 모바일 성능용
        enableSmoothing: true,
      }
    )

    console.log('✅ BlazePose 모델 로드 완료')
    return poseDetector
  } catch (error) {
    console.error('❌ 포즈 감지 모델 로드 실패:', error)
    isLoadingPose = false
    throw new Error('포즈 감지 모델을 로드할 수 없습니다')
  }
}

export const disposePoseDetector = async () => {
  if (poseDetector) {
    await poseDetector.dispose()
    poseDetector = null
  }
}

export const getPoseDetector = (): poseDetection.PoseDetector | null => {
  return poseDetector
}
