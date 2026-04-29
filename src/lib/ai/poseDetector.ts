import * as poseDetection from '@tensorflow-models/pose-detection'
import { loadPoseDetector } from './modelLoader'
import { Keypoint, BodyRegion } from '@/types/pose'

export interface PoseDetectionResult {
  keypoints: Keypoint[]
  bodyRegion: BodyRegion
  timestamp: number
  processingTime: number
}

export const detectPose = async (
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<PoseDetectionResult> => {
  const startTime = performance.now()

  try {
    const detector = await loadPoseDetector()

    // 포즈 추론
    const poses = await detector.estimatePoses(source, {
      maxPoses: 1, // 한 명만 감지
      flipHorizontal: false,
    })

    if (!poses || poses.length === 0) {
      throw new Error('포즈를 감지할 수 없습니다')
    }

    const pose = poses[0]
    const keypoints = pose.keypoints.map((kp) => ({
      name: kp.name || '',
      x: kp.x,
      y: kp.y,
      z: kp.z,
      score: kp.score || 0,
    }))

    const bodyRegion = computeBodyRegion(keypoints)
    const processingTime = performance.now() - startTime

    return {
      keypoints,
      bodyRegion,
      timestamp: Date.now(),
      processingTime,
    }
  } catch (error) {
    console.error('Pose detection error:', error)
    throw error
  }
}

/**
 * BlazePose 33개 키포인트 인덱스
 * 11: 좌측 어깨, 12: 우측 어깨
 * 23: 좌측 엉덩이, 24: 우측 엉덩이
 * 27: 좌측 발목, 28: 우측 발목
 */
export function computeBodyRegion(keypoints: Keypoint[]): BodyRegion {
  // 어깨 찾기
  const leftShoulder = keypoints.find((kp) => kp.name === 'left_shoulder')
  const rightShoulder = keypoints.find((kp) => kp.name === 'right_shoulder')
  const leftHip = keypoints.find((kp) => kp.name === 'left_hip')
  const rightHip = keypoints.find((kp) => kp.name === 'right_hip')
  const leftAnkle = keypoints.find((kp) => kp.name === 'left_ankle')
  const rightAnkle = keypoints.find((kp) => kp.name === 'right_ankle')

  // 기본값 설정 (신체 감지 실패 시)
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return {
      top: { x: 0, y: 0, width: 0, height: 0, shoulderAngle: 0 },
      bottom: { x: 0, y: 0, width: 0, height: 0 },
    }
  }

  // 상의 영역 (어깨 ~ 엉덩이)
  const shoulderMinX = Math.min(leftShoulder.x, rightShoulder.x)
  const shoulderMaxX = Math.max(leftShoulder.x, rightShoulder.x)
  const shoulderY = Math.min(leftShoulder.y, rightShoulder.y)

  const hipMinX = Math.min(leftHip.x, rightHip.x)
  const hipMaxX = Math.max(leftHip.x, rightHip.x)
  const hipY = Math.max(leftHip.y, rightHip.y)

  // 어깨 기울기 각도 계산
  const shoulderDiff = rightShoulder.y - leftShoulder.y
  const shoulderDistance = rightShoulder.x - leftShoulder.x
  const shoulderAngle = Math.atan2(shoulderDiff, shoulderDistance)

  const topX = Math.min(shoulderMinX, hipMinX) - 30
  const topWidth = Math.max(shoulderMaxX, hipMaxX) - topX + 60
  const topHeight = hipY - shoulderY + 50

  // 하의 영역 (엉덩이 ~ 발목)
  const ankleMinX = Math.min(
    leftAnkle?.x || hipMinX,
    rightAnkle?.x || hipMaxX
  )
  const ankleMaxX = Math.max(
    leftAnkle?.x || hipMinX,
    rightAnkle?.x || hipMaxX
  )
  const ankleY = Math.max(
    leftAnkle?.y || hipY,
    rightAnkle?.y || hipY
  )

  const bottomX = Math.min(hipMinX, ankleMinX) - 20
  const bottomWidth = Math.max(hipMaxX, ankleMaxX) - bottomX + 40
  const bottomHeight = ankleY - hipY + 30

  return {
    top: {
      x: Math.max(0, topX),
      y: Math.max(0, shoulderY - 20),
      width: topWidth,
      height: topHeight,
      shoulderAngle,
    },
    bottom: {
      x: Math.max(0, bottomX),
      y: Math.max(0, hipY - 10),
      width: bottomWidth,
      height: bottomHeight,
    },
  }
}
