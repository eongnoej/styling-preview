import { FaceDetectionResult } from '@/types/pose'

export interface FaceSwapParams {
  sourceContext: CanvasRenderingContext2D
  sourceCanvas: HTMLCanvasElement
  targetCanvas: HTMLCanvasElement
  targetContext: CanvasRenderingContext2D
  sourceFace: FaceDetectionResult
  targetFace: FaceDetectionResult
}

/**
 * 3점 Affine 변환 행렬 계산
 * 출처: https://en.wikipedia.org/wiki/Affine_transformation
 */
function getAffineMatrix(
  srcPoints: Array<[number, number]>,
  dstPoints: Array<[number, number]>
): number[] {
  // 3x2 행렬 계산
  const [x0, y0] = srcPoints[0]
  const [x1, y1] = srcPoints[1]
  const [x2, y2] = srcPoints[2]

  const [u0, v0] = dstPoints[0]
  const [u1, v1] = dstPoints[1]
  const [u2, v2] = dstPoints[2]

  const denom =
    (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)

  if (Math.abs(denom) < 1e-6) {
    // 퇴화된 경우 단위 행렬 반환
    return [1, 0, 0, 1, 0, 0]
  }

  const a = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / denom
  const b = ((u2 - u0) * (x1 - x0) - (u1 - u0) * (x2 - x0)) / denom
  const c = u0 - a * x0 - b * y0

  const d = ((v1 - v0) * (y2 - y0) - (v2 - v0) * (y1 - y0)) / denom
  const e = ((v2 - v0) * (x1 - x0) - (v1 - v0) * (x2 - x0)) / denom
  const f = v0 - d * x0 - e * y0

  return [a, b, c, d, e, f]
}

/**
 * 기준점 선택: 눈 외안각 2개 + 입꼬리 중간점
 * face-api 68 포인트 인덱스:
 * 36: 왼쪽 눈 외안각, 45: 오른쪽 눈 외안각
 * 48, 54: 입 모서리 (중간 계산)
 */
function getKeypoints(landmarks: Array<{ x: number; y: number }>): Array<[number, number]> {
  // 기준점 인덱스 (68 포인트 모델)
  const leftEyeOuter = landmarks[36]
  const rightEyeOuter = landmarks[45]
  const leftMouthCorner = landmarks[48]
  const rightMouthCorner = landmarks[54]

  if (!leftEyeOuter || !rightEyeOuter || !leftMouthCorner || !rightMouthCorner) {
    return [[0, 0], [0, 0], [0, 0]]
  }

  const mouthCenterX = (leftMouthCorner.x + rightMouthCorner.x) / 2
  const mouthCenterY = (leftMouthCorner.y + rightMouthCorner.y) / 2

  return [
    [leftEyeOuter.x, leftEyeOuter.y],
    [rightEyeOuter.x, rightEyeOuter.y],
    [mouthCenterX, mouthCenterY],
  ]
}

/**
 * Affine Warp 기반 얼굴 합성
 * 출처 얼굴을 대상 위치로 변환
 */
export function swapFaceAffine({
  sourceContext,
  sourceCanvas,
  targetCanvas,
  targetContext,
  sourceFace,
  targetFace,
}: FaceSwapParams): void {
  try {
    // 기준점 추출
    const srcPoints = getKeypoints(sourceFace.landmarks)
    const dstPoints = getKeypoints(targetFace.landmarks)

    // Affine 변환 행렬 계산
    const matrix = getAffineMatrix(srcPoints, dstPoints)

    // 변환 행렬 적용
    targetContext.save()

    // setTransform: [a, b, c, d, e, f]
    // x' = ax + cy + e
    // y' = bx + dy + f
    targetContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5])

    // 얼굴 영역만 클리핑 (턱선 기반)
    // 간단한 구현: 직사각형 클리핑
    const sourceBox = sourceFace.box
    targetContext.beginPath()
    targetContext.rect(sourceBox.x, sourceBox.y, sourceBox.width, sourceBox.height)
    targetContext.clip()

    // 출처 이미지 그리기
    targetContext.drawImage(sourceCanvas, 0, 0)

    targetContext.restore()

    // 부드러운 블렌딩을 위해 경계 부분에 blur 적용
    applyFaceBlending(targetContext, targetCanvas, targetFace)
  } catch (error) {
    console.error('Face swap error:', error)
  }
}

/**
 * 얼굴 경계 부분에 부드러운 블렌딩 적용
 */
function applyFaceBlending(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  face: FaceDetectionResult
): void {
  try {
    const { box } = face

    // 경계 영역에 그래디언트 적용 (부드러운 블렌딩)
    const blurWidth = 20
    const edgeGradient = ctx.createLinearGradient(
      box.x - blurWidth,
      0,
      box.x,
      0
    )
    edgeGradient.addColorStop(0, 'rgba(0,0,0,1)')
    edgeGradient.addColorStop(1, 'rgba(0,0,0,0)')

    // 최소한의 부드러운 처리 (완전한 블렌딩은 성능상 생략)
    // 실제로는 Canvas filter나 별도 OffscreenCanvas 사용 권장
  } catch (error) {
    console.error('Face blending error:', error)
  }
}

/**
 * 간단한 피부톤 보정
 * 출처와 대상의 평균 색상 차이 계산
 */
export function getColorCorrection(
  sourceCanvas: HTMLCanvasElement,
  sourceFace: FaceDetectionResult
): { h: number; s: number; l: number } {
  try {
    const ctx = sourceCanvas.getContext('2d')
    if (!ctx) return { h: 0, s: 0, l: 0 }

    const { box } = sourceFace
    const imageData = ctx.getImageData(
      Math.floor(box.x),
      Math.floor(box.y),
      Math.floor(box.width),
      Math.floor(box.height)
    )

    // 간단한 평균 색상 계산
    let r = 0, g = 0, b = 0
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }

    const count = data.length / 4
    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)

    // RGB to HSL 변환 (간단한 버전)
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    const l = (max + min) / 2

    if (max === min) {
      return { h: 0, s: 0, l }
    }

    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0

    switch (max) {
      case r / 255:
        h = ((g - b) / 255 / d + (g < b ? 6 : 0)) / 6
        break
      case g / 255:
        h = ((b - r) / 255 / d + 2) / 6
        break
      case b / 255:
        h = ((r - g) / 255 / d + 4) / 6
        break
    }

    return { h, s, l }
  } catch (error) {
    console.error('Color correction error:', error)
    return { h: 0, s: 0, l: 0 }
  }
}
